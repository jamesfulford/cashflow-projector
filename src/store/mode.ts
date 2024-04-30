import { computed } from "@preact/signals-core";
import { rulesState } from "./rules";
import { isExpense, isIncome } from "../services/income-expense";
import { transactionsState } from "./transactions";

export const totalIncomeState = computed(() => {
  const incomeRules = rulesState.value.filter(isIncome);
  const incomeRuleIDs = new Set(incomeRules.map((r) => r.id));
  return transactionsState.value
    .filter((t) => incomeRuleIDs.has(t.rule_id))
    .map((t) => t.value)
    .reduce((a, x) => a + x);
});

export const totalExpenseState = computed(() => {
  const expenseRules = rulesState.value.filter(isExpense);
  const expenseRuleIDs = new Set(expenseRules.map((r) => r.id));
  return transactionsState.value
    .filter((t) => expenseRuleIDs.has(t.rule_id))
    .map((t) => t.value)
    .reduce((a, x) => a + x);
});

export const isIncomelessState = computed(() => totalIncomeState.value <= 0);
export const isDownwardState = computed(() => {
  return totalIncomeState.value < Math.abs(totalExpenseState.value);
});
