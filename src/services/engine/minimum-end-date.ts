import { RRuleSet, rrulestr } from "rrule";
import { IParameters } from "../../store/parameters";
import { IApiRule } from "../../store/rules";
import { addDays, parseISO } from "date-fns";

const INFINITE_DATE = new Date(3000, 12, 31);

function getMinimumEndDateForFairComputation(
  rule: IApiRule,
  startDateString: string,
): string {
  const rruleset = rrulestr(rule.rrule, { forceset: true }) as RRuleSet;

  // for our computations to be fair, we need to compute until *at least* the latest unusual date.
  // What dates are unusual?
  // 1. rdates; dates that are added as an exception are unusual
  // 2. exdates; dates that are especially excluded are unusual
  // 3. rrule `until` dates
  // 4. final date of rrules with `count` (this includes old-fashioned one-time rules)

  const rdates = rruleset.rdates().map((d) => d.toISOString().split("T")[0]);
  const exdates = rruleset.exdates().map((d) => d.toISOString().split("T")[0]);

  const startDate = parseISO(startDateString + "T00:00:00");
  const finalDatesOfFiniteRRules = rruleset
    .rrules()
    .filter((rrule) => rrule.options.count)
    .map((rrule) => rrule.between(startDate, INFINITE_DATE, true).at(-1)) // this could be computationally expensive
    .map((d) => d && d.toISOString().split("T")[0])
    .filter(Boolean) as string[];

  const finalDatesOfUntilRRules = rruleset
    .rrules()
    .filter((rrule) => rrule.options.until)
    .map((rrule) => rrule.before(rrule.options.until as Date, true))
    .map((d) => d && d.toISOString().split("T")[0])
    .filter(Boolean) as string[];

  // pick the highest value
  return [
    ...rdates,
    ...exdates,
    ...finalDatesOfUntilRRules,
    ...finalDatesOfFiniteRRules,
  ].reduce((a: string, x: string) => {
    return a > x ? a : x;
  }, startDateString);
}

export function computeMinimumEndDate(
  rules: IApiRule[],
  parameters: IParameters,
): string {
  const minimumEndDates = rules.map((rule) =>
    getMinimumEndDateForFairComputation(rule, parameters.startDate),
  );
  const minimumEndDate = minimumEndDates.reduce((a: string, x: string) => {
    return a > x ? a : x;
  }, parameters.startDate);

  // add 1 day so the chart can show the day after the unusual date
  return addDays(parseISO(minimumEndDate + "T00:00:00"), 1)
    .toISOString()
    .split("T")[0];
}
