import { RRule } from "rrule";
import { convertHebrewMonthToDisplayName, extractHebrew } from "./hebrew";

export const getPreviewDetails = (
  rrulestring: string | undefined,
): {
  message?: string;
  rrule?: RRule;
  isOnce?: boolean;
} => {
  if (!rrulestring) {
    return {};
  }

  const hebrewExtraction = extractHebrew(rrulestring);
  if (hebrewExtraction) {
    return {
      message: `every ${convertHebrewMonthToDisplayName(
        hebrewExtraction.byhebrewmonth,
      )} ${hebrewExtraction.byhebrewday}`,
    };
  }

  let rrule: RRule | undefined;
  try {
    rrule = RRule.fromString(rrulestring);
  } catch {
    console.warn("Unable to parse rrule from string ", rrulestring);
  }

  if (!rrule) {
    return {};
  }

  const isOnce = rrule.origOptions.count === 1;
  if (isOnce) {
    return {
      message: `once on ${rrule.all()[0].toISOString().split("T")[0]}`,
      isOnce,
      rrule,
    };
  } else {
    return {
      message: rrule.toText(),
      isOnce,
      rrule,
    };
  }
};
