import { RRule, Options, rrulestr, RRuleSet } from "rrule";
import { Weekday, WeekdayStr } from "rrule";
import { IApiRuleMutate } from "../../../../store/rules";
import { extractHebrew } from "./hebrew";
import { ONCE, SupportedFrequency, WorkingState, YEARLY_HEBREW } from "./types";
import { AddEditRuleType } from "./AddEditRuleTypes";
import { fromDateToString } from "../../../../services/engine/rrule";
import sortBy from "lodash/sortBy";

// copied from rrule src code because not exported readily
const ALL_WEEKDAYS = ["SU", "MO", "TU", "WE", "TR", "FR", "SA"];

function frequenciesEqual(freq1: Options["freq"], freq2: Options["freq"]) {
  return String(freq1) === String(freq2);
}

function workingStateRRuleToString(rrule: WorkingState["rrule"]): string {
  // serializing rrule for sending from UI to API.
  // inverse of stringToWorkingStateRRule

  if (rrule.freq === YEARLY_HEBREW) {
    return `X-YEARLY-HEBREW: ${rrule.byhebrewmonth || 1}, ${
      rrule.byhebrewday || 1
    }`;
  }

  if (rrule.freq === ONCE) {
    return new RRule({
      freq: RRule.YEARLY,
      count: 1,
      dtstart: rrule.dtstart ? new Date(rrule.dtstart) : undefined,
    }).toString();
  }

  // at this point it isn't "ONCE"
  const freq = rrule.freq as Options["freq"];

  const rruleOptions = {
    ...rrule,
    freq,
    dtstart: rrule.dtstart ? new Date(rrule.dtstart) : undefined,
    until: rrule.until ? new Date(rrule.until) : undefined,
    bymonthday: frequenciesEqual(freq, RRule.MONTHLY)
      ? rrule.bymonthday
      : undefined,
    byweekday: frequenciesEqual(freq, RRule.WEEKLY)
      ? rrule.byweekday
      : undefined,

    count: rrule.count || undefined,
    wkst: undefined,
    bymonth: undefined,
    byhour: undefined,
    byminute: undefined,
    bysecond: undefined,
    byweekno: undefined,
    byeaster: undefined,
  };

  // Override what might be in `rrule`
  delete rruleOptions["byhebrewmonth"];
  delete rruleOptions["byhebrewday"];
  delete rruleOptions["exdates"];

  const rruleset = new RRuleSet();
  rruleset.rrule(new RRule(rruleOptions));
  rrule.exdates?.forEach((d) => {
    rruleset.exdate(new Date(d));
  });

  return cleanRawRRuleString(rruleset.toString());
}

export function cleanRawRRuleString(rrulestring: string): string {
  return rrulestring.replace(/\d{8}T\d{6}Z/g, (match) =>
    match.replace("Z", ""),
  );
}

function normalizeByWeekday(byweekday?: Options["byweekday"]): number[] {
  if (!byweekday) return [];

  let _byweekday = byweekday;
  if (!Array.isArray(_byweekday)) {
    _byweekday = [_byweekday];
  }

  return _byweekday.map((w) => {
    if (Number.isInteger(w)) return w as number;
    if (typeof w === "string") {
      return ALL_WEEKDAYS.indexOf(w as WeekdayStr);
    }
    const _w = w as Weekday;
    return _w.weekday;
  });
}

function stringToWorkingStateRRule(rrulestring: string): WorkingState["rrule"] {
  // inverse of workingStateRRuleToString, for editing

  const hebrewExtraction = extractHebrew(rrulestring);
  if (hebrewExtraction) {
    return {
      freq: YEARLY_HEBREW,
      ...hebrewExtraction,
    };
  }

  const rruleset = rrulestr(cleanRawRRuleString(rrulestring), {
    forceset: true,
  }) as RRuleSet;
  const rrules = rruleset.rrules();
  if (rrules.length > 1) {
    throw new Error("cannot handle editing more than 1 rrule in a set");
  }
  if (rruleset.exrules().length > 0) {
    throw new Error("cannot handle editing exclusion rules");
  }

  const rrule = rrules[0];
  const libraryInferredOptions = rrule.options;
  const parsedOptions = rrule.origOptions;
  parsedOptions.freq = Number(parsedOptions.freq);

  if (
    ![RRule.YEARLY, RRule.MONTHLY, RRule.WEEKLY, undefined].includes(
      parsedOptions.freq,
    )
  ) {
    throw new Error("Unsupported frequency specified in rule: " + rrulestring);
  }

  const freq = parsedOptions.freq as SupportedFrequency;

  const dtstart =
    (parsedOptions.dtstart && fromDateToString(parsedOptions.dtstart)) ??
    undefined;
  const until =
    (parsedOptions.until && fromDateToString(parsedOptions.until)) ?? undefined;

  return {
    ...parsedOptions,
    freq: libraryInferredOptions.count === 1 ? ONCE : freq,
    byweekday: normalizeByWeekday(parsedOptions.byweekday),
    dtstart,
    until,
    exdates: rruleset.exdates().map(fromDateToString),
  };
}

export function convertWorkingStateToApiRuleMutate(
  fields: WorkingState,
): IApiRuleMutate {
  const labels = { ...fields.labels };

  const returnValue: IApiRuleMutate = {
    name: fields.name,
    value: Number(fields.value),

    rrule: workingStateRRuleToString(fields.rrule),

    labels,

    exceptionalTransactions: sortBy(fields.exceptionalTransactions ?? [], [
      "day",
      "name",
    ]),
  };

  // if rrule cannot be parsed, throw error
  rrulestr(returnValue.rrule, { forceset: true });

  return returnValue;
}

const defaultValues: WorkingState = {
  rrule: {
    freq: RRule.MONTHLY,
    bymonthday: 1,
    interval: 1,
    dtstart: "",
    until: "",

    exdates: [],
  },

  value: "-5", // input=number is a pain for users

  name: "",
  labels: {},
  exceptionalTransactions: [],
};

export function ruleToWorkingState(rule?: AddEditRuleType): WorkingState {
  if (!rule) {
    return defaultValues;
  }

  return {
    rrule: rule.rrule
      ? stringToWorkingStateRRule(rule.rrule)
      : defaultValues.rrule,
    name: rule.name || "",
    labels: rule.labels,
    value: String(rule.value || 0),
    exceptionalTransactions: rule.exceptionalTransactions ?? [],
  };
}
