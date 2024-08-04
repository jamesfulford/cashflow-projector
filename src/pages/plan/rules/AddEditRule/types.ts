import { RRule, Options } from "rrule";
import {
  BaseRule,
  ExceptionalTransaction,
  RequiredExceptionalTransaction,
  RuleType,
} from "../../../../store/rules";

export const YEARLY_HEBREW = "YEARLY-HEBREW";

export type SupportedFrequency =
  | typeof RRule.YEARLY
  | typeof RRule.MONTHLY
  | typeof RRule.WEEKLY
  | typeof YEARLY_HEBREW;

export type BaseWorkingState = BaseRule;
export type RecurringWorkingState = BaseWorkingState &
  ({
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
    value: string;
    exceptionalTransactions: ExceptionalTransaction[];
  } & (
    | {
        type: RuleType.INCOME | RuleType.EXPENSE;
      }
    | {
        type: RuleType.SAVINGS_GOAL;
        progress: number;
        goal: number;
        isEmergencyFund: boolean;
      }
    | {
        type: RuleType.LOAN;
        balance: number;
        apr: number;
        compoundingsYearly: number;
      }
  ));
export interface ListWorkingState extends BaseWorkingState {
  ruleType: "list";
  type: RuleType.TRANSACTIONS_LIST;
  exceptionalTransactions: RequiredExceptionalTransaction[];
}

export type WorkingState = RecurringWorkingState | ListWorkingState;

export function isRecurringWorkingState(
  ws: WorkingState,
): ws is RecurringWorkingState {
  return ws.ruleType === "recurring";
}
export function isTransactionsListWorkingState(
  ws: WorkingState,
): ws is ListWorkingState {
  return ws.ruleType === "list";
}
