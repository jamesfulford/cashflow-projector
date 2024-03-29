import { computed, signal } from "@preact/signals-core";
import { startDateState } from "./parameters";
import { fromDateToString, fromStringToDate } from "../services/engine/rrule";
import { addDays } from "date-fns/addDays";

export function computeEndDate(startDate: string, daysToCompute: number) {
  return fromDateToString(addDays(fromStringToDate(startDate), daysToCompute));
}

export const durationDaysState = signal(365); // use this state to control how far ahead to see

// do not show any derived values beyond this date
export const displayEndDateState = computed(() =>
  computeEndDate(startDateState.value, durationDaysState.value),
);
