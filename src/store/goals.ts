import { computed } from "@preact/signals-core";
import { enhancedSavingsGoalsState, savingsGoalsState } from "./rules";

export const hasGoalsState = computed(() => totalGoalState.value > 0);
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
