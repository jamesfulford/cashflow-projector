import { computed } from "@preact/signals-core";
import { IParameters, parametersState } from "./parameters";
import { IApiRule, rulesState, updateRule } from "./rules";
import { getGlobal } from "../services/pyodide";
import { computedEndDate, displayEndDate } from "./executionContextParameters";
import { addDate, removeDate } from "../pages/plan/rule-update";

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
  const response = handle(
    rules.map((r) => ({
      ...r,
      labels: r.labels ?? {},
    })),
    parameters,
  ).toJs({
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

export const transactionsState = computed(() => {
  const displayEndDateValue = displayEndDate.value;
  return computedTransactions.value.filter((d) => d.day <= displayEndDateValue);
});

export function deferTransaction(
  transaction: IApiTransaction,
  newDate: string,
) {
  const rule = rulesState.peek().find((f) => f.id === transaction.rule_id);
  if (!rule) return;

  const newRRule = addDate(removeDate(rule.rrule, transaction.day), newDate);
  updateRule({
    ...rule,
    rrule: newRRule,
  });
}

export function skipTransaction(transaction: IApiTransaction) {
  const rule = rulesState.peek().find((f) => f.id === transaction.rule_id);
  if (!rule) return;

  const newRRule = removeDate(rule.rrule, transaction.day);
  updateRule({
    ...rule,
    rrule: newRRule,
  });
}
