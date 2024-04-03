import { RRule, Options } from "rrule";
import { IApiRuleMutate } from "../../../../store/rules";

export const YEARLY_HEBREW = "YEARLY-HEBREW";

export type SupportedFrequency =
  | typeof RRule.YEARLY
  | typeof RRule.MONTHLY
  | typeof RRule.WEEKLY
  | typeof YEARLY_HEBREW;

export type BaseWorkingState = Omit<IApiRuleMutate, "rrule" | "value"> & {
  value: string;
};
export interface RecurringWorkingState extends BaseWorkingState {
  ruleType: "recurring";

  // omit overrides
  rrule: Partial<
    Omit<Options, "freq" | "dtstart" | "byweekday" | "until"> & {
      freq: SupportedFrequency;

      dtstart?: string;
      until?: string;

      byweekday?: number[] | null;

      byhebrewmonth?: number;
      byhebrewday?: number;

      exdates: string[];
    }
  >;
}
export interface ListWorkingState extends BaseWorkingState {
  ruleType: "list";
}

export type WorkingState = RecurringWorkingState | ListWorkingState;
