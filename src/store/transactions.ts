import { computed } from "@preact/signals-core";
import { parametersState } from "./parameters";
import { rulesState, updateRule } from "./rules";
import { addDate, removeDate } from "../pages/plan/rule-update";
import { endDateState } from "./computationDates";
import { displayEndDateState } from "./displayDateRange";
import { computeTransactions } from "../services/engine/transactions";

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

const computedTransactions = computed(() => {
  const rules = rulesState.value;
  const parameters = {
    ...parametersState.value,
    endDate: endDateState.value,
  };

  return computeTransactions(rules, parameters);
});

export const transactionsState = computed(() => {
  const displayEndDateValue = displayEndDateState.value;
  return computedTransactions.value.filter((d) => d.day <= displayEndDateValue);
});

// virtual actions

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
