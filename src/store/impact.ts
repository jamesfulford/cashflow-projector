import { computed } from "@preact/signals-core";
import { transactionsState } from "./transactions";
import { IApiRule, rulesState } from "./rules";

// scores
// for income: what share of income is attributed to this rule, net exceptions?
// for expenses: how much of income is spent on this rule, net exceptions?

function isIncome(rule: IApiRule) {
  if (rule.rrule) return rule.value > 0;
  return (
    rule.exceptionalTransactions
      .map((t) => t.value ?? 0)
      .reduce((a, x) => a + x, 0) > 0
  );
}
function isExpense(rule: IApiRule) {
  if (rule.rrule) return rule.value < 0;
  return (
    rule.exceptionalTransactions
      .map((t) => t.value ?? 0)
      .reduce((a, x) => a + x, 0) < 0
  );
}

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

export const totalIncomeState = computed(() => {
  return Array.from(rawIncomeSharesState.value.values()).reduce(
    (a, x) => a + x,
    0,
  );
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

export const totalExpenseState = computed(() => {
  return Array.from(rawExpenseSharesState.value.values()).reduce(
    (a, x) => a + x,
    0,
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
