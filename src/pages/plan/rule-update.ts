import { RRuleSet, rrulestr } from "rrule";

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
    .filter((exdate) => exdatePredicate(exdate.toISOString().split("T")[0]))
    .forEach((exdate) => {
      newRRuleSet.exdate(exdate);
    });

  // transfer rdates
  originalRRuleSet
    .rdates()
    .filter((rdate) => rdatePredicate(rdate.toISOString().split("T")[0]))
    .forEach((rdate) => {
      newRRuleSet.rdate(rdate);
    });

  return newRRuleSet.toString();
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

  return rruleset.toString();
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

  return rruleset.toString();
}
