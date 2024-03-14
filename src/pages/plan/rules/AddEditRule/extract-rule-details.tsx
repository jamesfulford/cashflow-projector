import { RRule, RRuleSet, rrulestr } from "rrule";
import { convertHebrewMonthToDisplayName, extractHebrew } from "./hebrew";
import { cleanRawRRuleString } from "./translation";
import { IApiRuleMutate } from "../../../../store/rules";
import { IParameters } from "../../../../store/parameters";

interface Message {
  message: string;
}
export function getRuleWarnings(
  rule: IApiRuleMutate,
  parameters: IParameters,
): {
  warnings: Message[];
  errors: Message[];
} {
  const warnings: Message[] = [];
  const errors: Message[] = [];

  const details = getPreviewDetails(rule.rrule);

  // Error -> should delete
  if (!details.message) {
    errors.push({ message: "Unable to parse rrule." });
    return { warnings, errors };
  }
  if (details.message === "(too complex to display or edit)") {
    errors.push({ message: "Rule is too complex." });
    return { warnings, errors };
  }

  if (details.exdates?.some((d) => d < parameters.startDate)) {
    warnings.push({ message: "Some excluded dates are in the past." });
  }
  if (details.rdates?.some((d) => d < parameters.startDate)) {
    warnings.push({ message: "Some included dates are in the past." });
  }
  if (details.isOnce) {
    const onceDate = details.rrule
      ?.all()[0]
      .toISOString()
      .split("T")[0] as string;

    if (onceDate < parameters.startDate) {
      warnings.push({ message: "'On' date is in the past." });
    }
  }

  const until = details.rrule?.origOptions.until?.toISOString().split("T")[0];
  if (until && until < parameters.startDate) {
    warnings.push({ message: "End date is in the past." });
  }

  return {
    warnings,
    errors,
  };
}

export const getPreviewDetails = (
  rrulestring: string | undefined,
): {
  message?: string;
  rrule?: RRule;
  isOnce?: boolean;
  exdates?: string[];
  rdates?: string[];
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

  let rruleset: RRuleSet | undefined;
  try {
    rruleset = rrulestr(cleanRawRRuleString(rrulestring), {
      forceset: true,
    }) as RRuleSet;
  } catch {
    console.warn("Unable to parse rrule from string ", rrulestring);
  }

  if (!rruleset) {
    return {};
  }

  const rrules = rruleset.rrules();
  if (rrules.length > 1) {
    return {
      message: "(too complex to display or edit)",
    };
  }
  if (rrules.length < 1) {
    return {
      message: "on specific days",
    };
  }
  const rrule = rrules[0];

  const isOnce = rrule.origOptions.count === 1;
  if (isOnce) {
    return {
      message: `once on ${rrule.all()[0].toISOString().split("T")[0]}`,
      isOnce,
      rrule: rruleset,
    };
  } else {
    return {
      message: rruleset.rrules()[0].toText(),
      isOnce,
      rrule,
      exdates: rruleset.exdates().map((d) => d.toISOString().split("T")[0]),
      rdates: rruleset.rdates().map((d) => d.toISOString().split("T")[0]),
    };
  }
};
