import { computed } from "@preact/signals-core";
import { parametersState } from "./parameters";
import { endDateState } from "./computationDates";
import { displayEndDateState } from "./displayDateRange";
import { computeDayByDays } from "../services/engine/daybydays";
import { transactionsState } from "./transactions";

const computedDayByDays = computed(() => {
  console.time("computeDayByDays");
  try {
    return computeDayByDays(transactionsState.value, {
      ...parametersState.value,
      endDate: endDateState.value,
    });
  } finally {
    console.timeEnd("computeDayByDays");
  }
});
export const daybydaysState = computed(() => {
  const displayEndDateValue = displayEndDateState.value;
  return computedDayByDays.value.filter((d) => d.date <= displayEndDateValue);
});

// derived state

export const lowestFreeToSpendState = computed(
  () => daybydaysState.value.at(0)?.working_capital.low,
);
export const isBelowSafetyNetState = computed(
  () => lowestFreeToSpendState.value && lowestFreeToSpendState.value < 0,
);
