import { RRuleSet, rrulestr } from "rrule";
import { IApiRule } from "../../services/RulesService";
import { IParameters } from "../../services/ParameterService";

function stripPastDatesFromRRuleSet(rrulesetstring: string, startDate: string) {
  const originalRRuleSet = rrulestr(rrulesetstring, {
    forceset: true,
  }) as RRuleSet;
  const newRRuleSet = new RRuleSet();

  // transfer 1 rrule
  newRRuleSet.rrule(originalRRuleSet.rrules()[0]); // we don't allow more than 1 rrule

  // we don't do exrules

  // transfer exdates
  originalRRuleSet
    .exdates()
    .filter((exdate) => exdate.toISOString().split("T")[0] >= startDate)
    .forEach((exdate) => {
      newRRuleSet.exdate(exdate);
    });

  // transfer rdates
  originalRRuleSet
    .rdates()
    .filter((rdate) => rdate.toISOString().split("T")[0] >= startDate)
    .forEach((rdate) => {
      newRRuleSet.rdate(rdate);
    });

  return newRRuleSet.toString();
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
