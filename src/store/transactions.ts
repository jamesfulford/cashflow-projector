import { computed } from "@preact/signals-core";
import { IParameters, parametersState } from "./parameters";
import { IApiRule, rulesState } from "./rules";
import { getGlobal } from "../services/pyodide";
import { computedEndDate, displayEndDate } from "./executionContextParameters";

export interface IApiTransaction {
  rule_id: string;
  id: string;
  name: string;
  value: number;
  day: string;
  calculations: {
    balance: number;
    working_capital: number;
  };
}

interface IApiParameters extends IParameters {
  endDate: string;
}

function computeTransactions(
  rules: IApiRule[],
  parameters: IApiParameters,
): IApiTransaction[] {
  const handle = getGlobal("get_transactions");
  const response = handle(rules, parameters).toJs({
    dict_converter: Object.fromEntries,
  });
  const rawTransactions = response.transactions as IApiTransaction[];
  return rawTransactions;
}

const computedTransactions = computed(() => {
  const rules = rulesState.value;
  const parameters = {
    ...parametersState.value,
    endDate: computedEndDate.value,
  };

  return computeTransactions(rules, parameters);
});

export const transactions = computed(() => {
  const displayEndDateValue = displayEndDate.value;
  return computedTransactions.value.filter((d) => d.day <= displayEndDateValue);
});
