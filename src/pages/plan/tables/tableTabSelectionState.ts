import { effect, signal } from "@preact/signals-core";
import { isDownwardState } from "../../../store/mode";
import { hasGoalsState } from "../../../store/goals";

export enum Tabs {
  TRANSACTIONS = "Transactions",
  FREE_TO_SPEND = "Free balance",
  GOAL_PROGRESS = "Goal Progress",
  EMERGENCY_FUND = "Emergency Fund",
}

const defaultValue = Tabs.TRANSACTIONS;
const storageKey = "tables-tab-selection-state";
const rawValue = localStorage.getItem(storageKey) ?? defaultValue;
const value = ([Tabs.TRANSACTIONS, Tabs.FREE_TO_SPEND] as string[]).includes(
  rawValue,
)
  ? (rawValue as Tabs)
  : defaultValue;
export const tableTabSelectionState = signal<Tabs>(value);
effect(() => {
  localStorage.setItem(storageKey, tableTabSelectionState.value);
});

effect(() => {
  if (
    isDownwardState.value &&
    tableTabSelectionState.value === Tabs.FREE_TO_SPEND
  ) {
    tableTabSelectionState.value = Tabs.TRANSACTIONS;
  }

  if (
    !hasGoalsState.value &&
    tableTabSelectionState.value === Tabs.GOAL_PROGRESS
  ) {
    tableTabSelectionState.value = Tabs.TRANSACTIONS;
  }
});
