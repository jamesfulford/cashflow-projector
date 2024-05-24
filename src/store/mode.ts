import { computed } from "@preact/signals-core";
import { transactionsState } from "./transactions";

export const totalIncomeState = computed(() => {
  return transactionsState.value
    .filter((t) => t.value > 0)
    .map((t) => t.value)
    .reduce((a, x) => a + x, 0);
});

export const totalExpenseState = computed(() => {
  return transactionsState.value
    .filter((t) => t.value < 0)
    .map((t) => t.value)
    .reduce((a, x) => a + x, 0);
});

export const isIncomelessState = computed(() => totalIncomeState.value <= 0);
export const isDownwardState = computed(() => {
  return totalIncomeState.value < Math.abs(totalExpenseState.value);
});
