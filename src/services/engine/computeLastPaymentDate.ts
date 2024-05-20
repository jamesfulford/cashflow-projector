import { addYears } from "date-fns/addYears";
import { IApiRuleMutate, RuleType } from "../../store/rules";
import { fromDateToString, fromStringToDate } from "./rrule";
import { computeTransactions } from "./transactions";

export function computeLastPaymentDay(
  rule: IApiRuleMutate,
  startDate: string,
  endDate: string,
):
  | undefined
  | { result: "complete"; day: string }
  | { result: "incomplete"; searchedUpToDate: string } {
  if (rule.type !== RuleType.SAVINGS_GOAL && rule.type !== RuleType.LOAN)
    return;

  const minimumComputation = fromDateToString(
    addYears(fromStringToDate(startDate), 10),
  );
  const previewEndDate =
    endDate > minimumComputation ? endDate : minimumComputation;

  const transactions = computeTransactions(
    [
      {
        id: "preview",
        ...rule,
      },
    ],
    {
      startDate,
      endDate: previewEndDate,
      currentBalance: 0,
      setAside: 0,
    },
  );
  const finalTransaction = transactions.at(-1);
  if (!finalTransaction) return;
  if (!finalTransaction.isLastPayment)
    return { result: "incomplete", searchedUpToDate: previewEndDate };
  return { result: "complete", day: finalTransaction.day };
}
