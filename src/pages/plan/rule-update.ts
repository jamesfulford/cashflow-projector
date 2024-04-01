import { RRuleSet, rrulestr } from "rrule";
import { cleanRawRRuleString } from "./rules/AddEditRule/translation";
import {
  fromDateToString,
  fromStringToDate,
} from "../../services/engine/rrule";
import { addDays } from "date-fns/addDays";

export function removeUselessRdatesAndExdates(rrulesetstring: string): string {
  const originalRRuleSet = rrulestr(rrulesetstring, {
    forceset: true,
  }) as RRuleSet;
  const newRRuleSet = new RRuleSet();

  function rrulesGiveDate(day: string): boolean {
    const d = fromStringToDate(day);
    const pre = addDays(d, -1);
    const post = addDays(d, 1);
    return originalRRuleSet.rrules().some((r) => {
      return r.between(pre, post).map(fromDateToString).includes(day);
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

export function createNewRRuleWithFilteredDates(
  rrulesetstring: string,
  exdatePredicate: (exdate: string) => boolean,
  rdatePredicate: (rdate: string) => boolean,
): string {
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
    .filter((exdate) => exdatePredicate(fromDateToString(exdate)))
    .forEach((exdate) => {
      newRRuleSet.exdate(exdate);
    });

  // transfer rdates
  originalRRuleSet
    .rdates()
    .filter((rdate) => rdatePredicate(fromDateToString(rdate)))
    .forEach((rdate) => {
      newRRuleSet.rdate(rdate);
    });

  return cleanRawRRuleString(newRRuleSet.toString());
}

export function addDate(rrulestring: string, d: string): string {
  // if there's an exdate that matches, remove it:
  const newRRuleString = createNewRRuleWithFilteredDates(
    rrulestring,
    (exdate) => exdate !== d,
    () => true,
  );

  const rruleset = rrulestr(newRRuleString, { forceset: true }) as RRuleSet;

  rruleset.rdate(new Date(d));

  return cleanRawRRuleString(rruleset.toString());
}

export function removeDate(rrulestring: string, d: string): string {
  // if there's an rdate that matches, remove it:
  const newRRuleString = createNewRRuleWithFilteredDates(
    rrulestring,
    () => true,
    (rdate) => rdate !== d,
  );

  const rruleset = rrulestr(newRRuleString, { forceset: true }) as RRuleSet;

  rruleset.exdate(new Date(d));

  return cleanRawRRuleString(rruleset.toString());
}
