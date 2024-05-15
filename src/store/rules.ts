import { computed, signal } from "@preact/signals-core";

import { cleanRawRRuleString } from "../pages/plan/rules/AddEditRule/translation";
import { migrateRules } from "../pages/plan/rules-migration";
import { startDateState } from "./parameters";

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
  TRANSACTIONS_LIST = "transactions_list",
}

export type BaseRule = {
  name: string;
  version: typeof currentVersion;
};
export type RecurringRule = BaseRule & {
  type: RuleType.EXPENSE | RuleType.INCOME;
  rrule: string;
  value: number;
  exceptionalTransactions: ExceptionalTransaction[];
};
export type TransactionsListRule = BaseRule & {
  type: RuleType.TRANSACTIONS_LIST;
  exceptionalTransactions: RequiredExceptionalTransaction[]; // name and value are required
};

export type IApiRuleMutate = RecurringRule | TransactionsListRule;

export function isRecurringRule(rule: IApiRuleMutate): rule is RecurringRule {
  return rule.type === RuleType.EXPENSE || rule.type === RuleType.INCOME;
}

export function isTransactionsListRule(
  rule: IApiRuleMutate,
): rule is TransactionsListRule {
  return rule.type === RuleType.TRANSACTIONS_LIST;
}

// Extra service-assigned fields
export type IApiRule = IApiRuleMutate & {
  id: string;
};

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

// migrate away from localstorage: still read from localstorage for now
const localStorageRulesRaw = localStorage.getItem("rules") ?? "[]";
const rawRulesState = signal<IApiRule[]>(
  JSON.parse(localStorageRulesRaw) as IApiRule[],
);

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

export function updateRule({
  id,
  ...rule
}: IApiRuleMutate & { id: string }): IApiRule {
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
