import { computed } from "@preact/signals-core";
import { IParameters, parametersState } from "./parameters";
import { IApiRule, rulesState } from "./rules";
import { getGlobal } from "../services/pyodide";

interface ExecutionContextParameters extends IParameters {
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
