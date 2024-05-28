import { computed } from "@preact/signals-core";
import { transactionsState } from "./transactions";
import { RuleType, loansState, rulesState, savingsGoalsState } from "./rules";
import { totalExpenseState, totalIncomeState } from "./mode";

export const expenseRatioState = computed(() => {
  if (totalIncomeState.value <= 0) return;
  return (100 * Math.abs(totalExpenseState.value)) / totalIncomeState.value;
});

export const rawImpactState = computed(() => {
  const impacts = new Map(rulesState.value.map((r) => [r.id, 0]));

  transactionsState.value.forEach((t) => {
    const currentImpactOfRule = impacts.get(t.rule_id) ?? 0;
    impacts.set(t.rule_id, currentImpactOfRule + t.value);
  });

  return impacts;
});

export const rawExpenseSharesState = computed(() => {
  return new Map(
    Array.from(rawImpactState.value.entries()).filter((entry) => entry[1] <= 0),
  );
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

export const impactScoresState = computed(() => {
  const totalIncome = totalIncomeState.value;
  return new Map(
    Array.from(rawImpactState.value.entries()).map(
      ([id, score]: [string, number]) => [id, (100 * score) / totalIncome],
    ),
  );
});

// expense breakdown

export const loanRatioState = computed(() => {
  if (totalIncomeState.value <= 0) return;
  const loanRuleIDs = new Set(loansState.value.map((r) => r.id));
  const totalLoanExpense = Array.from(rawExpenseSharesState.value.entries())
    .filter((tuple_id_impact) => loanRuleIDs.has(tuple_id_impact[0]))
    .map((tuple_id_impact) => tuple_id_impact[1])
    .reduce((a, x) => a + x, 0);
  return (100 * Math.abs(totalLoanExpense)) / totalIncomeState.value;
});
export const goalRatioState = computed(() => {
  if (totalIncomeState.value <= 0) return;
  const goalRuleIDs = new Set(savingsGoalsState.value.map((r) => r.id));
  const totalGoalExpense = Array.from(rawExpenseSharesState.value.entries())
    .filter((tuple_id_impact) => goalRuleIDs.has(tuple_id_impact[0]))
    .map((tuple_id_impact) => tuple_id_impact[1])
    .reduce((a, x) => a + x, 0);
  return (100 * Math.abs(totalGoalExpense)) / totalIncomeState.value;
});
export const baseExpenseRatioState = computed(() => {
  if (totalIncomeState.value <= 0) return;
  const baseExpenseRuleIDs = new Set(
    rulesState.value
      .filter((r) => r.type === RuleType.EXPENSE)
      .map((r) => r.id),
  );
  const totalBaseExpense = Array.from(rawExpenseSharesState.value.entries())
    .filter((tuple_id_impact) => baseExpenseRuleIDs.has(tuple_id_impact[0]))
    .map((tuple_id_impact) => tuple_id_impact[1])
    .reduce((a, x) => a + x, 0);
  return (100 * Math.abs(totalBaseExpense)) / totalIncomeState.value;
});
