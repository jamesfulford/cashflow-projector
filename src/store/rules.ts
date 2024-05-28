import { computed, signal } from "@preact/signals-core";

import { cleanRawRRuleString } from "../pages/plan/rules/AddEditRule/translation";
import { migrateRules } from "../pages/plan/rules-migration";
import { startDateState } from "./parameters";
import { lastPaymentDayResultByRuleIDState } from "./computationDates";
import { LastPaymentDayResult } from "../services/engine/computeLastPaymentDate";

export const currentVersion = 1;
// when changing: make sure to update defaultValues in translation.ts

export interface ExceptionalTransaction {
  id: string;
  day: string;
  name?: string; // override
  value?: number; // override
}
export type RequiredExceptionalTransaction = Required<ExceptionalTransaction>;

export enum RuleType {
  INCOME = "income",
  EXPENSE = "expense", // if changing: make sure to update defaultValues in translation.ts
  SAVINGS_GOAL = "savings_goal",
  LOAN = "loan",
  TRANSACTIONS_LIST = "transactions_list",
}

export type BaseRule = {
  name: string;
  version: typeof currentVersion;
};
export type BaseRecurringRule = BaseRule & {
  rrule: string;
  value: number;
  exceptionalTransactions: ExceptionalTransaction[];
};
export type IncomeRuleMutate = BaseRecurringRule & { type: RuleType.INCOME };
export type ExpenseRuleMutate = BaseRecurringRule & { type: RuleType.EXPENSE };
export type SavingsGoalRuleMutate = BaseRecurringRule & {
  type: RuleType.SAVINGS_GOAL;
  progress: number; // non-negative, <= goal
  goal: number; // positive (non-zero)
};
export type LoanRuleMutate = BaseRecurringRule & {
  type: RuleType.LOAN;
  balance: number; // positive
  apr: number; // ex: 0.08 is 8%
  compoundingsYearly: number; // 1=annually, 12=monthly, 365=daily
};

export type RecurringRuleMutate =
  | IncomeRuleMutate
  | ExpenseRuleMutate
  | SavingsGoalRuleMutate
  | LoanRuleMutate;

export type TransactionsListRuleMutate = BaseRule & {
  type: RuleType.TRANSACTIONS_LIST;
  exceptionalTransactions: RequiredExceptionalTransaction[]; // name and value are required
};

export type IApiRuleMutate = RecurringRuleMutate | TransactionsListRuleMutate;

export function isRecurringRule(
  rule: IApiRuleMutate,
): rule is RecurringRuleMutate {
  return (
    rule.type === RuleType.EXPENSE ||
    rule.type === RuleType.INCOME ||
    rule.type === RuleType.LOAN ||
    rule.type === RuleType.SAVINGS_GOAL
  );
}

export function isTransactionsListRule(
  rule: IApiRuleMutate,
): rule is TransactionsListRuleMutate {
  return rule.type === RuleType.TRANSACTIONS_LIST;
}

type ServiceAssignedFields = { id: string };

export type IncomeRule = IncomeRuleMutate & ServiceAssignedFields;
export type ExpenseRule = ExpenseRuleMutate & ServiceAssignedFields;
export type SavingsGoalRule = SavingsGoalRuleMutate & ServiceAssignedFields;
export type LoanRule = LoanRuleMutate & ServiceAssignedFields;
export type TransactionsListRule = TransactionsListRuleMutate &
  ServiceAssignedFields;

export type RecurringRule =
  | IncomeRule
  | ExpenseRule
  | SavingsGoalRule
  | LoanRule;

export type IApiRule =
  | IncomeRule
  | ExpenseRule
  | SavingsGoalRule
  | LoanRule
  | TransactionsListRule;

function normalizeRules(rules: IApiRule[], startDate: string): IApiRule[] {
  return migrateRules(rules, startDate).map((r) => {
    if (isRecurringRule(r))
      return {
        ...r,
        rrule: cleanRawRRuleString(r.rrule),
      };
    return r;
  });
}

const rawRulesState = signal<IApiRule[]>([]);

function getRules() {
  return rawRulesState.peek();
}
function setRules(rules: IApiRule[]) {
  rawRulesState.value = normalizeRules(rules, startDateState.peek());
}

export function createRule(rule: IApiRuleMutate): IApiRule {
  const currentRules = getRules();
  const newRule = { ...rule, id: String(Date.now()) };
  setRules([...currentRules, newRule]);
  return newRule;
}

export function batchCreateRules(rules: IApiRuleMutate[]): IApiRule[] {
  const currentRules = getRules();
  const now = Date.now();
  const newRules = rules.map((rule, i) => ({
    ...rule,
    id: String(now) + "-" + i,
  }));
  setRules([...currentRules, ...newRules]);
  return newRules;
}

export function updateRule({ id, ...rule }: IApiRule): IApiRule {
  const currentRules = getRules();

  const foundRule = currentRules.find((r) => r.id === id);
  if (!foundRule) throw new Error(`could not find rule with id ${id}`);

  const updatedRule = {
    ...foundRule,
    ...rule,
  };
  if (isRecurringRule(updatedRule)) {
    updatedRule.rrule = cleanRawRRuleString(updatedRule.rrule);
  }

  const updatedRules = currentRules.map((r) => {
    if (r.id !== id) return r;
    return updatedRule;
  });
  setRules(updatedRules);
  return updatedRule;
}

export function deleteRule(ruleid: string): void {
  const currentRules = getRules();
  const newRules = currentRules.filter((r) => r.id !== ruleid);
  setRules(newRules);
}

export const rulesState = computed(() => rawRulesState.value);

export const loadRules = setRules;

export const savingsGoalsState = computed(() => {
  return rulesState.value.filter(
    (r) => r.type === RuleType.SAVINGS_GOAL,
  ) as SavingsGoalRule[];
});

export const loansState = computed(() => {
  return rulesState.value.filter((r) => r.type === RuleType.LOAN) as LoanRule[];
});

export const enhancedSavingsGoalsState = computed(() => {
  const lastPaymentDayResultByRuleID = lastPaymentDayResultByRuleIDState.value;
  return savingsGoalsState.value.map((r) => {
    return {
      ...r,
      lastPaymentDayResult: lastPaymentDayResultByRuleID.get(
        r.id,
      ) as LastPaymentDayResult,
    };
  });
});
