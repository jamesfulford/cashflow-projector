import { RRuleSet, rrulestr } from "rrule";
import { ExceptionalTransaction, IApiRule } from "../../store/rules";
import {
  createNewRRuleWithFilteredExDates,
  simplifyDateExceptions,
} from "./rule-update";
import { fromDateToString } from "../../services/engine/rrule";

function stripPastExdatesFromRRuleSet(
  rrulesetstring: string,
  startDate: string,
) {
  return createNewRRuleWithFilteredExDates(
    rrulesetstring,
    (exdate) => exdate >= startDate,
  );
}

export function migrateRules(rules: IApiRule[], startDate: string): IApiRule[] {
  return rules.map((r) => {
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
      // only keep exceptional transactions that have not yet happened
    ].filter((t) => t.day >= startDate);

    return {
      ...r,
      rrule: newRRuleString,
      exceptionalTransactions,
    };
  });
}
