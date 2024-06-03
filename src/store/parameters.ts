import { computed, signal } from "@preact/signals-core";
import { daybydaysState } from "./daybydays";
import { format } from "date-fns/format";

export interface IParameters {
  currentBalance: number;
  setAside: number;
  startDate: string;
}
export const defaultParameters: IParameters = {
  currentBalance: 2000,
  setAside: 0,
  startDate: format(new Date(), "yyyy-MM-dd"),
};

const rawParametersState = signal<IParameters>(defaultParameters);

export function setParameters(params: Partial<IParameters>) {
  const previousParams = rawParametersState.peek();
  rawParametersState.value = {
    ...previousParams,
    ...params,
  };
}

export const parametersState = computed(() => rawParametersState.value);
export const currentBalanceState = computed(
  () => parametersState.value.currentBalance,
);
export const startDateState = computed(() => parametersState.value.startDate);
export const setAsideState = computed(() => parametersState.value.setAside);

export const freeToSpendState = computed(() =>
  daybydaysState.value.length
    ? daybydaysState.value[0].working_capital.low
    : currentBalanceState.value,
);
export const balanceWillZeroState = computed(
  () => freeToSpendState.value + setAsideState.value < 0,
);
