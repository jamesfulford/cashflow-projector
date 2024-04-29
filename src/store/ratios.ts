import { computed } from "@preact/signals-core";
import { transactionsState } from "./transactions";
import { rulesState } from "./rules";
import { isExpense, isIncome } from "../services/income-expense";
import { totalExpenseState, totalIncomeState } from "./mode";

// scores
// for income: what share of income is attributed to this rule, net exceptions
// for expenses: how much of income is spent on this rule, net exceptions

export const expenseRatioState = computed(() => {
  if (totalIncomeState.value <= 0) return;
  return (100 * Math.abs(totalExpenseState.value)) / totalIncomeState.value;
});

export const rawIncomeSharesState = computed(() => {
  const incomeRules = rulesState.value.filter(isIncome);
  const incomeRuleIDs = new Set(incomeRules.map((r) => r.id));

  const shares = new Map(incomeRules.map((r) => [r.id, 0]));

  transactionsState.value
    .filter((t) => incomeRuleIDs.has(t.rule_id))
    .forEach((t) => {
      const score = shares.get(t.rule_id) ?? 0;
      shares.set(t.rule_id, score + t.value);
    });

  return shares;
});

export const rawExpenseSharesState = computed(() => {
  const expenseRules = rulesState.value.filter(isExpense);
  const expenseRuleIDs = new Set(expenseRules.map((r) => r.id));

  const shares = new Map(expenseRules.map((r) => [r.id, 0]));

  transactionsState.value
    .filter((t) => expenseRuleIDs.has(t.rule_id))
    .forEach((t) => {
      const score = shares.get(t.rule_id) ?? 0;
      shares.set(t.rule_id, score + t.value);
    });

  return shares;
});

export const expenseSharesState = computed(() => {
  const totalExpense = totalExpenseState.value;
  return new Map(
    Array.from(rawExpenseSharesState.value.entries()).map(([id, value]) => [
      id,
      (100 * value) / totalExpense,
    ]),
  );
});

export const rawImpactState = computed(() => {
  return new Map([
    ...rawIncomeSharesState.value.entries(),
    ...rawExpenseSharesState.value.entries(),
  ]);
});

export const impactScoresState = computed(() => {
  const totalIncome = totalIncomeState.value;
  return new Map(
    Array.from(rawImpactState.value.entries()).map(
      ([id, score]: [string, number]) => [id, (100 * score) / totalIncome],
    ),
  );
});
