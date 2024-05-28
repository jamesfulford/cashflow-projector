import { addYears } from "date-fns/addYears";
import { LoanRule, SavingsGoalRule } from "../../store/rules";
import { fromDateToString, fromStringToDate } from "./rrule";
import { computeTransactions } from "./transactions";

export type LastPaymentDayResult =
  | { result: "complete"; day: string }
  | { result: "incomplete"; searchedUpToDate: string };
export function computeLastPaymentDay(
  rule: LoanRule | SavingsGoalRule,
  startDate: string,
  endDate: string,
): LastPaymentDayResult {
  const minimumComputation = fromDateToString(
    addYears(fromStringToDate(startDate), 10),
  );
  const previewEndDate =
    endDate > minimumComputation ? endDate : minimumComputation;

  const transactions = computeTransactions([rule], {
    startDate,
    endDate: previewEndDate,
    currentBalance: 0,
    setAside: 0,
  });
  const finalTransaction = transactions.at(-1);
  if (!finalTransaction) return { result: "complete", day: startDate };
  if (!finalTransaction.isLastPayment)
    return { result: "incomplete", searchedUpToDate: previewEndDate };
  return { result: "complete", day: finalTransaction.day };
}
