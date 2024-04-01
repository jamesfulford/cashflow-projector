import { RRuleSet, rrulestr } from "rrule";
import { ExceptionalTransaction, IApiRule } from "../../store/rules";
import {
  createNewRRuleWithFilteredDates,
  removeUselessRdatesAndExdates,
} from "./rule-update";
import { fromDateToString } from "../../services/engine/rrule";

function stripPastDatesFromRRuleSet(rrulesetstring: string, startDate: string) {
  return createNewRRuleWithFilteredDates(
    rrulesetstring,
    (exdate) => exdate >= startDate,
    (rdate) => rdate >= startDate,
  );
}

export function migrateRules(rules: IApiRule[], startDate: string): IApiRule[] {
  return rules.map((r) => {
    //
    // create a new RRuleSet with some modifications
    //
    let newRRuleString = stripPastDatesFromRRuleSet(r.rrule, startDate);
    newRRuleString = removeUselessRdatesAndExdates(newRRuleString);

    //
    // remove all rdates
    // and turn them into exceptionalTransactions
    //
    const rdates = (rrulestr(newRRuleString, { forceset: true }) as RRuleSet)
      .rdates()
      .map(fromDateToString);
    newRRuleString = createNewRRuleWithFilteredDates(
      newRRuleString,
      () => true, // keep all exdates
      () => false, // remote all rdates
    );

    let exceptionalTransactions: ExceptionalTransaction[] = [
      ...(r.exceptionalTransactions ?? []),
      ...rdates.map((rdate) => ({
        id: rdate,
        day: rdate,
      })),
    ];

    // only keep exceptional transactions that have not yet happened
    exceptionalTransactions = exceptionalTransactions.filter(
      (t) => t.day >= startDate,
    );

    return {
      ...r,
      rrule: newRRuleString,
      exceptionalTransactions,
    };
  });
}
