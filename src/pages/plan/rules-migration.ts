import { RRule, RRuleSet, rrulestr } from "rrule";
import { ExceptionalTransaction, IApiRule } from "../../store/rules";
import {
  createNewRRuleWithFilteredExDates,
  simplifyDateExceptions,
} from "./rule-update";
import {
  fromDateToString,
  fromStringToDate,
} from "../../services/engine/rrule";

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
  return function pastExceptionalTransactionRemover(rule: IApiRule) {
    return {
      ...rule,
      exceptionalTransactions: rule.exceptionalTransactions.filter(
        (t) => t.day >= startDate,
      ),
    };
  };
}

function buildPastRRuleRemover(startDate: string) {
  return function pastRRuleRemover(rule: IApiRule) {
    if (!rule.rrule) return rule;
    const rruleset = rrulestr(rule.rrule, { forceset: true }) as RRuleSet;

    function isRRuleComplete(rrule: RRule) {
      return !rrule.after(fromStringToDate(startDate), true);
    }
    const allRRulesComplete = rruleset.rrules().every(isRRuleComplete);
    if (allRRulesComplete) {
      return {
        ...rule,
        rrule: undefined,
      };
    }
    return rule;
  };
}

function uselessRuleRemover(rule: IApiRule) {
  if (rule.rrule) {
    return rule;
  }
  if (rule.exceptionalTransactions.length) return rule;

  // if no rrule and no exceptional transactions, it should be removed
  return undefined;
}

function _extractLegacyOnceRuleDate(rrulestring: string): string | undefined {
  const rruleset = rrulestr(rrulestring, { forceset: true }) as RRuleSet;
  const rrules = rruleset.rrules();
  if (rrules.length !== 1) return;
  const rrule = rrules[0];
  // legacy "ONCE" rules are Yearly and had a count of 1
  if (!(rrule.options.freq === RRule.YEARLY && rrule.options.count === 1))
    return;
  return fromDateToString(rrule.options.dtstart);
}
function migrateLegacyOnceRules(rule: IApiRule) {
  if (!rule.rrule) return rule;

  // handle legacy "ONCE" rules
  const legacyOnceDate = _extractLegacyOnceRuleDate(rule.rrule);
  if (!legacyOnceDate) return rule;

  // convert to a "list" rule
  return {
    ...rule,
    rrule: undefined,
    exceptionalTransactions: [
      ...rule.exceptionalTransactions,
      {
        id: `${Date.now()}`,
        day: legacyOnceDate,
        value: rule.value,
        name: rule.name,
      },
    ],
    value: 0,
  };
}

function buildPastExDatesRemoverAndRdatesToExceptionalTransactionsTranslatorAndRRuleExceptionSimplifier(
  startDate: string,
) {
  return function pastExDatesRemoverAndRdatesToExceptionalTransactionsTranslatorAndRRuleExceptionSimplifier(
    r: IApiRule,
  ): IApiRule | undefined {
    if (!r.rrule) {
      return r;
    }
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
    [
      "pastExDatesRemoverAndRdatesToExceptionalTransactionsTranslatorAndRRuleExceptionSimplifier",
      buildPastExDatesRemoverAndRdatesToExceptionalTransactionsTranslatorAndRRuleExceptionSimplifier(
        startDate,
      ),
    ],
    ["migrateLegacyOnceRules", migrateLegacyOnceRules],
    ["pastRRuleRemover", buildPastRRuleRemover(startDate)],
    [
      "pastExceptionalTransactionRemover",
      buildPastExceptionalTransactionRemover(startDate),
    ],
    ["uselessRuleRemover", uselessRuleRemover],
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
