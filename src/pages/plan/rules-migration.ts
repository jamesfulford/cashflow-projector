import { RRuleSet, rrulestr } from "rrule";
import { IApiRule } from "../../store/rules";
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

    return {
      ...r,
      rrule: newRRuleString,
    };
  });
}
