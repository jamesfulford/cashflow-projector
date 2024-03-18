import { RRule, Options } from "rrule";
import { IApiRuleMutate } from "../../../../store/rules";

export const ONCE = "ONCE";
export const YEARLY_HEBREW = "YEARLY-HEBREW";

export type SupportedFrequency =
  | typeof RRule.YEARLY
  | typeof RRule.MONTHLY
  | typeof RRule.WEEKLY
  | typeof ONCE
  | typeof YEARLY_HEBREW;

export type WorkingState = Omit<Omit<IApiRuleMutate, "rrule">, "value"> & {
  // omit overrides
  rrule: Partial<
    Omit<Omit<Omit<Omit<Options, "freq">, "dtstart">, "byweekday">, "until"> & {
      freq: SupportedFrequency;

      dtstart?: string;
      until?: string;

      byweekday?: number[] | null;

      byhebrewmonth?: number;
      byhebrewday?: number;

      rdates: string[];
      exdates: string[];
    }
  >;
  value: string;
};
