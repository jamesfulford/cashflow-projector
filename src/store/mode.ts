import { computed } from "@preact/signals-core";
import { RuleType, rulesState } from "./rules";
import { transactionsState } from "./transactions";

export const totalIncomeState = computed(() => {
  const incomeRules = rulesState.value.filter((r) => {
    return r.type === RuleType.INCOME;
  });
  const incomeRuleIDs = new Set(incomeRules.map((r) => r.id));
  return transactionsState.value
    .filter((t) => incomeRuleIDs.has(t.rule_id))
    .map((t) => t.value)
    .reduce((a, x) => a + x, 0);
});

export const totalExpenseState = computed(() => {
  const expenseRules = rulesState.value.filter(
    (r) => r.type === RuleType.EXPENSE,
  );
  const expenseRuleIDs = new Set(expenseRules.map((r) => r.id));
  return transactionsState.value
    .filter((t) => expenseRuleIDs.has(t.rule_id))
    .map((t) => t.value)
    .reduce((a, x) => a + x, 0);
});

export const isIncomelessState = computed(() => totalIncomeState.value <= 0);
export const isDownwardState = computed(() => {
  return totalIncomeState.value < Math.abs(totalExpenseState.value);
});
