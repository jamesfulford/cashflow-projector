import { computed } from "@preact/signals-core";
import { parametersState } from "./parameters";
import { ExceptionalTransaction, rulesState, updateRule } from "./rules";
import { removeDate } from "../pages/plan/rule-update";
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
  exceptionalTransactionID?: string;
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

  if (transaction.exceptionalTransactionID !== undefined) {
    // is an exceptional transaction
    const newExceptionalTransactions = rule.exceptionalTransactions.map((t) => {
      if (t.id !== transaction.exceptionalTransactionID) return t;

      return {
        ...t,
        day: newDate,
      };
    });
    updateRule({
      ...rule,
      exceptionalTransactions: newExceptionalTransactions,
    });
  } else {
    const newRRule = removeDate(rule.rrule, transaction.day);
    const newExceptionalTransaction: ExceptionalTransaction = {
      id: `${Date.now()}`,
      day: newDate,
    };
    updateRule({
      ...rule,
      rrule: newRRule,
      exceptionalTransactions: [
        ...rule.exceptionalTransactions,
        newExceptionalTransaction,
      ],
    });
  }
}

export function skipTransaction(transaction: IApiTransaction) {
  const rule = rulesState.peek().find((f) => f.id === transaction.rule_id);
  if (!rule) return;

  if (transaction.exceptionalTransactionID !== undefined) {
    // is an exceptional transaction
    updateRule({
      ...rule,
      exceptionalTransactions: rule.exceptionalTransactions.filter(
        (t) => t.id !== transaction.exceptionalTransactionID,
      ),
    });
  } else {
    // is an rrule transaction
    const newRRule = removeDate(rule.rrule, transaction.day);
    updateRule({
      ...rule,
      rrule: newRRule,
    });
  }
}
