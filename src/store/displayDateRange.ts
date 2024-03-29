import { computed, signal } from "@preact/signals-core";
import { startDateState } from "./parameters";

export function computeEndDate(startDate: string, daysToCompute: number) {
  const newEndDate = new Date(
    new Date(startDate).getTime() + daysToCompute * 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .split("T")[0];
  return newEndDate;
}

export const durationDaysState = signal(365); // use this state to control how far ahead to see

// do not show any derived values beyond this date
export const displayEndDateState = computed(() =>
  computeEndDate(startDateState.value, durationDaysState.value),
);
