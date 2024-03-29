import { computed, signal } from "@preact/signals-core";

import { cleanRawRRuleString } from "../pages/plan/rules/AddEditRule/translation";
import { migrateRules } from "../pages/plan/rules-migration";
import { startDateState } from "./parameters";

// When creating and updating rules
export interface IApiRuleMutate {
  name: string;
  rrule: string;
  value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels?: { [label: string]: any };
}

// Extra service-assigned fields
export interface IApiRule extends IApiRuleMutate {
  id: string;
}

function normalizeRules(rules: IApiRule[], startDate: string): IApiRule[] {
  return migrateRules(rules, startDate).map((r) => {
    return {
      ...r,
      rrule: cleanRawRRuleString(r.rrule),
    };
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
  updatedRule.rrule = cleanRawRRuleString(updatedRule.rrule);

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
