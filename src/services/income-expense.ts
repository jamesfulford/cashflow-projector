import { IApiRule } from "../store/rules";

export function isIncome(rule: IApiRule) {
  if (rule.rrule) return rule.value > 0;
  return (
    rule.exceptionalTransactions
      .map((t) => t.value ?? 0)
      .reduce((a, x) => a + x, 0) > 0
  );
}
export function isExpense(rule: IApiRule) {
  if (rule.rrule) return rule.value < 0;
  return (
    rule.exceptionalTransactions
      .map((t) => t.value ?? 0)
      .reduce((a, x) => a + x, 0) < 0
  );
}
