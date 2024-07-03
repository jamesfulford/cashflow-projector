import { computed } from "@preact/signals-core";
import { parametersState, startDateState } from "./parameters";
import { computeEndDate, durationDaysState } from "./displayDateRange";
import { computeMinimumEndDate } from "../services/engine/minimum-end-date";
import { loansState, rulesState, savingsGoalsState } from "./rules";
import { todayState } from "./reconcile";
import { computeLastPaymentDay } from "../services/engine/computeLastPaymentDate";
import { fromDateToString, fromStringToDate } from "../services/engine/rrule";
import { addYears } from "date-fns/addYears";
import { addDays } from "date-fns/addDays";

export const lastPaymentDayResultByRuleIDState = computed(() => {
  // consider payoff and goal reached end criteria
  const lastPaymentDayResultByRuleID = new Map<
    string,
    ReturnType<typeof computeLastPaymentDay>
  >();

  const startDate = startDateState.value;
  const previewEndDate = fromDateToString(
    addYears(fromStringToDate(startDate), 10),
  );

  [...savingsGoalsState.value, ...loansState.value].forEach((r) => {
    // look a fixed time into the future and if we find last final, include as a minimum
    // (expensive computation)
    const lastPaymentDayResult = computeLastPaymentDay(
      r,
      startDate,
      previewEndDate,
    );
    lastPaymentDayResultByRuleID.set(r.id, lastPaymentDayResult);
  });

  return lastPaymentDayResultByRuleID;
});

export const minimumEndDateState = computed(() => {
  const endDateCandidates = [
    // must compute to at least today
    todayState.value,
    // consider `until`, `count` end criteria
    computeMinimumEndDate(rulesState.value, parametersState.value),

    // consider rules with lastPayment behavior
    ...Array.from(lastPaymentDayResultByRuleIDState.value.values())
      .filter((r) => {
        if (!r) return false;
        if (r.result === "complete") return true;
        if (r.result === "incomplete") return true;
      })
      .map((r) => {
        if (!r) return ""; // never happens; cmon typescript
        return r.result === "complete" ? r.day : r.searchedUpToDate;
      }),
  ];

  const minimumEndDate = endDateCandidates.reduce((a: string, x: string) => {
    return a > x ? a : x;
  }); // (list has guaranteed at least length 1, so no error)

  // add 1 day so the chart can show the day after the unusual date
  return fromDateToString(addDays(fromStringToDate(minimumEndDate), 1));
});

function getComputedDurationDays(
  startDate: string,
  minimumEndDate?: string,
): number | undefined {
  if (minimumEndDate) {
    const start = new Date(startDate);
    const computedEndDate = new Date(minimumEndDate);
    return Math.round(
      (computedEndDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
}
const minDaysToComputeState = computed(
  () =>
    getComputedDurationDays(startDateState.value, minimumEndDateState.value) ??
    365,
);

// actual end date to compute based on minimum and on date range selected to view
export const endDateState = computed(() =>
  computeEndDate(
    startDateState.value,
    Math.max(durationDaysState.value, minDaysToComputeState.value),
  ),
);
