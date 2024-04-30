import { computed } from "@preact/signals-core";
import { daybydaysState } from "./daybydays";
import { setAsideState } from "./parameters";

export const safetyNetViolatedDayByDayState = computed(() => {
  const daybydays = daybydaysState.value;
  const setAside = setAsideState.value;
  return daybydays.find((d) => d.balance.low < setAside);
});
export const zeroViolatedDayByDayState = computed(() => {
  const daybydays = daybydaysState.value;
  return daybydays.find((d) => d.balance.low < 0);
});
