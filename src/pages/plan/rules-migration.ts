import { IParameters } from "../../store/parameters";
import { IApiRule } from "../../store/rules";
import { createNewRRuleWithFilteredDates } from "./rule-update";

function stripPastDatesFromRRuleSet(rrulesetstring: string, startDate: string) {
  return createNewRRuleWithFilteredDates(
    rrulesetstring,
    (exdate) => exdate >= startDate,
    (rdate) => rdate >= startDate,
  );
}

export function migrateRules(
  rules: IApiRule[],
  parameters: IParameters,
): IApiRule[] {
  return rules.map((r) => {
    //
    // create a new RRuleSet with some modifications
    //
    const newRRuleString = stripPastDatesFromRRuleSet(
      r.rrule,
      parameters.startDate,
    );

    return {
      ...r,
      rrule: newRRuleString,
    };
  });
}
