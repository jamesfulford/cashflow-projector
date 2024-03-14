import { computed, signal } from "@preact/signals-core";

export interface IParameters {
  currentBalance: number;
  setAside: number;
  startDate: string;
}

const rawParametersState = signal<IParameters>(
  JSON.parse(
    localStorage.getItem("parameters") ||
      JSON.stringify({
        currentBalance: 2000,
        setAside: 1000,
        startDate: new Date().toISOString().split("T")[0],
      }),
  ),
);

export function setParameters(params: Partial<IParameters>) {
  rawParametersState.value = {
    ...rawParametersState.peek(),
    ...params,
  };
}

export const parametersState = computed(() => rawParametersState.value);
