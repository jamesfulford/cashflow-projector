import { effect, signal } from "@preact/signals-core";

export enum RulesTab {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

const storageKey = "rules-tab-selection-state";
const rawValue = localStorage.getItem(storageKey) ?? RulesTab.EXPENSE;
const value = ([RulesTab.EXPENSE, RulesTab.INCOME] as string[]).includes(
  rawValue,
)
  ? (rawValue as RulesTab)
  : RulesTab.EXPENSE;
export const rulesTabSelectionState = signal<RulesTab>(value);
effect(() => {
  localStorage.setItem(storageKey, rulesTabSelectionState.value);
});
