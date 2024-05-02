import { RRuleSet, rrulestr } from "rrule";
import { cleanRawRRuleString } from "./rules/AddEditRule/translation";
import {
  fromDateToString,
  fromStringToDate,
} from "../../services/engine/rrule";
import { addDays } from "date-fns/addDays";

export function simplifyDateExceptions(rrulesetstring: string): string {
  const originalRRuleSet = rrulestr(rrulesetstring, {
    forceset: true,
  }) as RRuleSet;
  const newRRuleSet = new RRuleSet();

  function rrulesGiveDate(day: string): boolean {
    const d = fromStringToDate(day);
    const pre = addDays(d, -1);
    const post = addDays(d, 1);
    return originalRRuleSet.rrules().some((r) => {
      const rule = rrulestr(r.toString()); // make a copy
      rule.options.dtstart = pre; // adjust dtstart needed
      // because if dtstart is missing, is assumed to be today
      // not startDate, which means the condition below always fails for transactions
      // before today but after startDate (i.e., reconciliation use case)
      return rule.between(pre, post).map(fromDateToString).includes(day);
    });
  }

  const newRDates = originalRRuleSet
    .rdates()
    // don't rdate dates that the rrules were going to say anyway
    .filter((rdate) => !rrulesGiveDate(fromDateToString(rdate)));

  const rdateSet = new Set(originalRRuleSet.rdates().map(fromDateToString)); // (refer to old rdates because we're only interested in rdates on days that can be exdated)
  const newExDates = originalRRuleSet
    .exdates()
    // don't exdate dates that the rrules never would have said
    .filter((exdate) => rrulesGiveDate(fromDateToString(exdate)))
    // don't exdate dates that were explicitly being rdate'd
    .filter((exdate) => !rdateSet.has(fromDateToString(exdate)));

  originalRRuleSet.rrules().forEach((rrule) => {
    newRRuleSet.rrule(rrule);
  });
  newRDates.forEach((rdate) => {
    newRRuleSet.rdate(rdate);
  });
  newExDates.forEach((exdate) => {
    newRRuleSet.exdate(exdate);
  });

  return newRRuleSet.toString();
}

export function createNewRRuleWithFilteredExDates(
  rrulesetstring: string,
  exdatePredicate: (exdate: string) => boolean,
): string {
  const originalRRuleSet = rrulestr(rrulesetstring, {
    forceset: true,
  }) as RRuleSet;
  const newRRuleSet = new RRuleSet();

  // transfer all rrules
  originalRRuleSet.rrules().forEach((rrule) => {
    newRRuleSet.rrule(rrule);
  });

  // transfer exdates
  originalRRuleSet
    .exdates()
    .filter((exdate) => exdatePredicate(fromDateToString(exdate)))
    .forEach((exdate) => {
      newRRuleSet.exdate(exdate);
    });

  // we don't do exrules
  // we don't do rdates (exceptionalTransactions)

  return cleanRawRRuleString(newRRuleSet.toString());
}

export function removeDate(rrulestring: string, d: string): string {
  const rruleset = rrulestr(rrulestring, { forceset: true }) as RRuleSet;

  rruleset.exdate(fromStringToDate(d));

  return cleanRawRRuleString(rruleset.toString());
}
