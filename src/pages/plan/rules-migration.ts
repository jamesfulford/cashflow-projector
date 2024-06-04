import { RRule, RRuleSet, rrulestr } from "rrule";
import {
  ExceptionalTransaction,
  IApiRule,
  RuleType,
  isRecurringRule,
} from "../../store/rules";
import {
  createNewRRuleWithFilteredExDates,
  simplifyDateExceptions,
} from "./rule-update";
import {
  fromDateToString,
  fromStringToDate,
} from "../../services/engine/rrule";
import { addEmergencyFundApplicability } from "./migration/addEmergencyFundApplicability";

function stripPastExdatesFromRRuleSet(
  rrulesetstring: string,
  startDate: string,
) {
  return createNewRRuleWithFilteredExDates(
    rrulesetstring,
    (exdate) => exdate >= startDate,
  );
}

function buildPastExceptionalTransactionRemover(startDate: string) {
  return function pastExceptionalTransactionRemover(rule: IApiRule): IApiRule {
    if (isRecurringRule(rule)) {
      return {
        ...rule,
        exceptionalTransactions: rule.exceptionalTransactions.filter(
          (t) => t.day >= startDate,
        ),
      };
    } else {
      return {
        ...rule,
        exceptionalTransactions: rule.exceptionalTransactions.filter(
          (t) => t.day >= startDate,
        ),
      };
    }
  };
}

function buildPastRRuleRemover(startDate: string) {
  return function pastRRuleRemover(rule: IApiRule): IApiRule {
    if (!isRecurringRule(rule)) return rule;

    const rruleset = rrulestr(rule.rrule, { forceset: true }) as RRuleSet;

    function isRRuleComplete(rrule: RRule) {
      return !rrule.after(fromStringToDate(startDate), true);
    }
    const allRRulesComplete = rruleset.rrules().every(isRRuleComplete);
    if (allRRulesComplete) {
      // convert to transactions list
      return {
        id: rule.id,
        name: rule.name,
        version: rule.version,

        type: RuleType.TRANSACTIONS_LIST,
        exceptionalTransactions: rule.exceptionalTransactions.map((et) => {
          return {
            name: rule.name,
            value: rule.value,
            ...et,
          };
        }),
      };
    }
    return rule;
  };
}

function uselessRuleRemover(rule: IApiRule) {
  if (isRecurringRule(rule)) return rule;
  if (rule.exceptionalTransactions.length) return rule;

  // if no rrule and no exceptional transactions, it should be removed
  return undefined;
}

function buildPastExDatesRemoverAndRdatesToExceptionalTransactionsTranslatorAndRRuleExceptionSimplifier(
  startDate: string,
) {
  return function pastExDatesRemoverAndRdatesToExceptionalTransactionsTranslatorAndRRuleExceptionSimplifier(
    r: IApiRule,
  ): IApiRule | undefined {
    if (!isRecurringRule(r)) return r;

    //
    // move rules to the present
    //

    // simplifies down to minimum exdates and rdates and resolves conflicts
    const simplifiedRRuleString = simplifyDateExceptions(r.rrule);
    // (remember minimum rdates for later)
    const rdates = (
      rrulestr(simplifiedRRuleString, { forceset: true }) as RRuleSet
    )
      .rdates()
      .map(fromDateToString);

    // removes past exdates and removes all rdates
    const newRRuleString = stripPastExdatesFromRRuleSet(
      simplifiedRRuleString,
      startDate,
    );

    // preserve minimum rdates as additional exceptionalTransactions
    const exceptionalTransactions: ExceptionalTransaction[] = [
      ...(r.exceptionalTransactions ?? []), // (original)
      ...rdates.map((rdate) => ({
        // (migrated from rdates)
        id: rdate,
        day: rdate,
      })),
    ];

    return {
      ...r,
      rrule: newRRuleString,

      // only keep exceptional transactions that have not yet happened
      exceptionalTransactions: exceptionalTransactions.filter(
        (t) => t.day >= startDate,
      ),
    };
  };
}

export function migrateRules(rules: IApiRule[], startDate: string): IApiRule[] {
  const migrations: [string, (rule: IApiRule) => IApiRule | undefined][] = [
    //
    // Migrations
    //
    // apply in order
    //

    //
    // Consistency/cleanup methods (not really migrating)
    //
    [
      "pastExDatesRemoverAndRdatesToExceptionalTransactionsTranslatorAndRRuleExceptionSimplifier",
      buildPastExDatesRemoverAndRdatesToExceptionalTransactionsTranslatorAndRRuleExceptionSimplifier(
        startDate,
      ),
    ],
    ["pastRRuleRemover", buildPastRRuleRemover(startDate)],
    [
      "pastExceptionalTransactionRemover",
      buildPastExceptionalTransactionRemover(startDate),
    ],
    ["uselessRuleRemover", uselessRuleRemover],
    ["addEmergencyFundApplicability", addEmergencyFundApplicability],
  ];

  let migratedRules = rules;
  migrations.forEach(([name, migration]) => {
    const rulesBefore = migratedRules.length;
    migratedRules = migratedRules.map(migration).filter(Boolean) as IApiRule[];
    if (rulesBefore !== migratedRules.length) {
      console.debug(
        `migration '${name}' has changed number of rules from ${rulesBefore} to ${migratedRules.length}.`,
      );
    }
  });
  return migratedRules;
}
