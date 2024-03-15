import { computed, effect, signal } from "@preact/signals-core";
import { daybydaysState } from "./daybydays";

export interface IParameters {
  currentBalance: number;
  setAside: number;
  startDate: string;
}
export const defaultParameters: IParameters = {
  currentBalance: 2000,
  setAside: 1000,
  startDate: new Date().toISOString().split("T")[0],
};

// migrate from localstorage to session storage
const localStorageParametersRaw = localStorage.getItem("parameters");

const persistedParameters = JSON.parse(
  localStorageParametersRaw || JSON.stringify(defaultParameters),
) as IParameters;
const rawParametersState = signal<IParameters>(persistedParameters);

export function setParameters(params: Partial<IParameters>) {
  rawParametersState.value = {
    ...rawParametersState.peek(),
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
  daybydaysState.value.daybydays.length
    ? daybydaysState.value.daybydays[0].working_capital.low
    : currentBalanceState.value,
);
export const balanceWillZeroState = computed(
  () => freeToSpendState.value + setAsideState.value < 0,
);
