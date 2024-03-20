import { computed } from "@preact/signals-core";
import { parametersState, startDateState } from "./parameters";
import { computeEndDate, durationDaysState } from "./displayDateRange";
import { computeMinimumEndDate } from "../services/engine/minimum-end-date";
import { rulesState } from "./rules";

export const minimumEndDateState = computed(() =>
  computeMinimumEndDate(rulesState.value, parametersState.value),
);

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
