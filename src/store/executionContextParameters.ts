import { computed } from "@preact/signals-core";
import { IParameters, parametersState } from "./parameters";
import { IApiRule, rulesState } from "./rules";
import { getGlobal } from "../services/pyodide";
import { MINIMUM_DAYS, durationDaysState } from "./dates";

export interface ExecutionContextParameters extends IParameters {
  endDate: string;
  minimumEndDate?: string;
}

function getExecutionContextParameters(
  rules: IApiRule[],
  parameters: IParameters,
): ExecutionContextParameters {
  const handle = getGlobal("compute_context_parameters");
  const response = handle(
    rules.map((r) => ({
      ...r,
      labels: r.labels ?? {},
    })),
    parameters,
  ).toJs({
    dict_converter: Object.fromEntries,
  });

  return response.params as ExecutionContextParameters;
}

export const executionContextParameters = computed(() =>
  getExecutionContextParameters(rulesState.value, parametersState.value),
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
export const minimumDaysToCompute = computed(
  () =>
    getComputedDurationDays(
      parametersState.value.startDate,
      executionContextParameters.value.minimumEndDate,
    ) ?? MINIMUM_DAYS,
);

function computeEndDate(startDate: string, daysToCompute: number) {
  const newEndDate = new Date(
    new Date(startDate).getTime() + daysToCompute * 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .split("T")[0];
  return newEndDate;
}
export const computedEndDate = computed(() =>
  computeEndDate(
    parametersState.value.startDate,
    Math.max(durationDaysState.value, minimumDaysToCompute.value),
  ),
);

export const displayEndDate = computed(() =>
  computeEndDate(parametersState.value.startDate, durationDaysState.value),
);
