import { computed } from "@preact/signals-core";
import { transactionsState } from "./transactions";
import { RuleType, rulesState } from "./rules";
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
  const expenseRules = rulesState.value.filter(
    (r) => r.type === RuleType.EXPENSE,
  );
  const expenseRuleIDs = new Set(expenseRules.map((r) => r.id));

  return new Map(
    Array.from(rawImpactState.value.entries()).filter((entry) =>
      expenseRuleIDs.has(entry[0]),
    ),
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
