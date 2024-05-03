import { effect, signal } from "@preact/signals-core";
import { isDownwardState } from "../../../store/mode";

export enum TableTabs {
  TRANSACTIONS = "Transactions",
  FREE_TO_SPEND = "Free to spend",
}

const defaultValue = TableTabs.TRANSACTIONS;
const storageKey = "tables-tab-selection-state";
const rawValue = localStorage.getItem(storageKey) ?? defaultValue;
const value = (
  [TableTabs.TRANSACTIONS, TableTabs.FREE_TO_SPEND] as string[]
).includes(rawValue)
  ? (rawValue as TableTabs)
  : defaultValue;
export const tableTabSelectionState = signal<TableTabs>(value);
effect(() => {
  localStorage.setItem(storageKey, tableTabSelectionState.value);
});

effect(() => {
  if (
    isDownwardState.value &&
    tableTabSelectionState.value === TableTabs.FREE_TO_SPEND
  ) {
    tableTabSelectionState.value = TableTabs.TRANSACTIONS;
  }
});
