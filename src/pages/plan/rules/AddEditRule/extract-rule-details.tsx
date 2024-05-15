import { RRule, RRuleSet, rrulestr } from "rrule";
import { convertHebrewMonthToDisplayName, extractHebrew } from "./hebrew";
import {
  IApiRuleMutate,
  isRecurringRule,
  isTransactionsListRule,
} from "../../../../store/rules";
import { IParameters } from "../../../../store/parameters";

export function getShortFrequencyDisplayString(rule: IApiRuleMutate): string {
  if (isTransactionsListRule(rule)) {
    // is list rule
    const count = rule.exceptionalTransactions.length;
    return `happens ${count} time${count > 1 ? "s" : ""}`;
  }

  if (isRecurringRule(rule)) {
    const hebrewExtraction = extractHebrew(rule.rrule);
    if (hebrewExtraction) {
      return `every ${convertHebrewMonthToDisplayName(
        hebrewExtraction.byhebrewmonth,
      )} ${hebrewExtraction.byhebrewday}`;
    }

    const rruleset = rrulestr(rule.rrule, { forceset: true }) as RRuleSet;
    const rrules = rruleset.rrules();
    if (rrules.length > 1) {
      return "(too complex)";
    }
    if (rrules.length === 0) {
      // act like a list rule
      const count = rule.exceptionalTransactions.length;
      return `happens ${count} time${count > 1 ? "s" : ""}`;
    }
    const rrule = rrules[0];

    const interval = rrule.options.interval;
    const frequency = rrule.options.freq;

    switch (frequency) {
      case RRule.WEEKLY: {
        switch (interval) {
          case 1:
            return "weekly";
          case 2:
            return "biweekly";
          default:
            return `every ${interval} weeks`;
        }
      }
      case RRule.MONTHLY: {
        switch (interval) {
          case 1:
            return "monthly";
          default:
            return `every ${interval} months`;
        }
      }
      case RRule.YEARLY: {
        switch (interval) {
          case 1:
            return "yearly";
          default:
            return `every ${interval} years`;
        }
      }
      default:
        return "(unexpected frequency)";
    }
  }

  return "";
}

export function getLongFrequencyDisplayString(rule: IApiRuleMutate): string {
  if (isTransactionsListRule(rule)) {
    // is list rule
    const count = (rule.exceptionalTransactions ?? []).length;
    return `happens ${count} time${count > 1 ? "s" : ""}`;
  }

  if (isRecurringRule(rule)) {
    const hebrewExtraction = extractHebrew(rule.rrule);
    if (hebrewExtraction) {
      return `every ${convertHebrewMonthToDisplayName(
        hebrewExtraction.byhebrewmonth,
      )} ${hebrewExtraction.byhebrewday}`;
    }

    const rruleset = rrulestr(rule.rrule, { forceset: true }) as RRuleSet;
    const rrules = rruleset.rrules();
    if (rrules.length > 1) {
      return "(too complex)";
    }
    if (rrules.length === 0) {
      const count = (rule.exceptionalTransactions ?? []).length;
      return `happens ${count} time${count > 1 ? "s" : ""}`;
    }
    const rrule = rrules[0];
    return rrule.toText();
  }

  return "";
}

interface Message {
  message: string;
}
export function getRuleWarnings(
  rule: IApiRuleMutate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _parameters: IParameters,
): {
  warnings: Message[];
  errors: Message[];
} {
  const warnings: Message[] = [];
  const errors: Message[] = [];

  if (isRecurringRule(rule)) {
    try {
      rrulestr(rule.rrule, {
        forceset: true,
      });
    } catch {
      errors.push({ message: "Unable to parse rrule." });
      return { warnings, errors };
    }

    const rruleset = rrulestr(rule.rrule, {
      forceset: true,
    }) as RRuleSet;
    if (rruleset.rrules().length > 1) {
      errors.push({ message: "Rule is too complex." });
      return { warnings, errors };
    }
  }

  return {
    warnings,
    errors,
  };
}
