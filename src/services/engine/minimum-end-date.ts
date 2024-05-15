import { RRuleSet, rrulestr } from "rrule";
import { IParameters } from "../../store/parameters";
import { IApiRule, isRecurringRule } from "../../store/rules";
import { addDays } from "date-fns/addDays";
import { fromDateToString, fromStringToDate } from "./rrule";

const INFINITE_DATE = new Date(3000, 12, 31);

function maxDate(dates: string[], startDate: string) {
  return dates.reduce((a: string, x: string) => {
    return a > x ? a : x;
  }, startDate);
}

function getMinimumEndDateForFairComputation(
  rule: IApiRule,
  startDateString: string,
): string {
  // for our computations to be fair, we need to compute until *at least* the latest unusual date.
  // What dates are unusual?
  // 1. exdates; dates that are especially excluded are unusual
  // 2. rrule `until` dates
  // 3. final date of rrules with `count` (this includes old-fashioned one-time rules)
  // 4. exceptional transactions; explicitly added transactions are unusual

  const exceptionalTransactionDates = rule.exceptionalTransactions.map(
    (t) => t.day,
  );

  // if no rrule, then the following are not of interest in computing min end date
  if (!isRecurringRule(rule))
    return maxDate(exceptionalTransactionDates, startDateString);

  const rruleset = rrulestr(rule.rrule, { forceset: true }) as RRuleSet;

  const exdates = rruleset.exdates().map(fromDateToString);

  const startDate = fromStringToDate(startDateString);
  const finalDatesOfFiniteRRules = rruleset
    .rrules()
    .filter((rrule) => rrule.options.count)
    .map((rrule) => rrule.between(startDate, INFINITE_DATE, true).at(-1)) // this could be computationally expensive
    .map((d) => d && fromDateToString(d))
    .filter(Boolean) as string[];

  const finalDatesOfUntilRRules = rruleset
    .rrules()
    .filter((rrule) => rrule.options.until)
    .map((rrule) => rrule.before(rrule.options.until as Date, true))
    .map((d) => d && fromDateToString(d))
    .filter(Boolean) as string[];

  // pick the highest value
  return maxDate(
    [
      ...exdates,
      ...finalDatesOfUntilRRules,
      ...finalDatesOfFiniteRRules,
      ...exceptionalTransactionDates,
    ],
    startDateString,
  );
}

function computeAbsoluteMinimumEndDate(startDate: string) {
  return fromDateToString(addDays(fromStringToDate(startDate), 400));
}

export function computeMinimumEndDate(
  rules: IApiRule[],
  parameters: IParameters,
): string {
  const minimumEndDates = rules.map((rule) =>
    getMinimumEndDateForFairComputation(rule, parameters.startDate),
  );
  const absoluteMinEndDate = computeAbsoluteMinimumEndDate(
    parameters.startDate,
  );
  const minimumEndDate = minimumEndDates.reduce((a: string, x: string) => {
    return a > x ? a : x;
  }, absoluteMinEndDate);

  // add 1 day so the chart can show the day after the unusual date
  return fromDateToString(addDays(fromStringToDate(minimumEndDate), 1));
}
