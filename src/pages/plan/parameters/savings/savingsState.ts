import { computed, signal } from "@preact/signals-core";
import { fromDateToString } from "../../../../services/engine/rrule";
import { todayState } from "../../../../store/reconcile";
import {
  enhancedSavingsGoalsState,
  savingsGoalsState,
} from "../../../../store/rules";

export const savingsBalanceState = signal(800);
export const savingsLastUpdatedDateState = signal(fromDateToString(new Date()));

export interface SavingsParameters {
  balance: number;
  lastUpdatedDate: string;
}

export const savingsParametersState = computed<SavingsParameters>(() => {
  return {
    balance: savingsBalanceState.value,
    lastUpdatedDate: savingsLastUpdatedDateState.value,
  };
});
export const defaultSavingsParameters = savingsParametersState.peek();

export function loadSavingsParameters(_parameters?: SavingsParameters) {
  const parameters = _parameters ?? defaultSavingsParameters; // migration; if no savings parameters, use defaults

  savingsBalanceState.value = parameters.balance;
  savingsLastUpdatedDateState.value = parameters.lastUpdatedDate;
}

export const savingsReconciliationRequiredState = computed(() => {
  // if it is a new month, request reconciliation
  const lastUpdatedYearMonth = savingsLastUpdatedDateState.value
    .split("-")
    .slice(0, 2)
    .join("-");
  const todayYearMonth = todayState.value.split("-").slice(0, 2).join("-");
  return todayYearMonth !== lastUpdatedYearMonth;
});

export const totalProgressState = computed(() =>
  savingsGoalsState.value.map((r) => r.progress).reduce((a, x) => a + x, 0),
);
export const totalGoalState = computed(() =>
  savingsGoalsState.value.map((r) => r.goal).reduce((a, x) => a + x, 0),
);
export const goalWithLatestFinalPaymentDayResultState = computed(() =>
  enhancedSavingsGoalsState.value.reduce((bestRule, r) => {
    const bestRuleDay =
      bestRule.lastPaymentDayResult.result === "incomplete"
        ? bestRule.lastPaymentDayResult.searchedUpToDate
        : bestRule.lastPaymentDayResult.day;
    const rDay =
      r.lastPaymentDayResult.result === "incomplete"
        ? r.lastPaymentDayResult.searchedUpToDate
        : r.lastPaymentDayResult.day;

    return bestRuleDay > rDay ? bestRule : r;
  }),
);
export const unallocatedSavingsState = computed(
  () => savingsBalanceState.value - totalProgressState.value,
);

export const insufficientSavingsForAllocationsState = computed(() => {
  return unallocatedSavingsState.value < 0;
});
