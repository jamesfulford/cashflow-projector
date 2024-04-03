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
    // is rrule transaction
    // therefore .rrule exists
    const newRRule = removeDate(rule.rrule as string, transaction.day);
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

export function renameTransaction(
  transaction: IApiTransaction,
  newName: string,
) {
  const rule = rulesState.peek().find((f) => f.id === transaction.rule_id);
  if (!rule) return;

  const exceptionalTransaction =
    transaction.exceptionalTransactionID !== undefined ||
    rule.exceptionalTransactions.find(
      (t) => t.id === transaction.exceptionalTransactionID,
    );

  if (exceptionalTransaction !== undefined) {
    // is an existing exceptional transaction

    const newExceptionalTransactions = rule.exceptionalTransactions.map((t) => {
      if (t.id !== transaction.exceptionalTransactionID) return t;

      return {
        ...t,
        name: newName,
      };
    });
    updateRule({
      ...rule,
      exceptionalTransactions: newExceptionalTransactions,
    });
  } else {
    // is an rrule transaction
    // therefore .rrule exists
    const newRRule = removeDate(rule.rrule as string, transaction.day);
    const newExceptionalTransaction: ExceptionalTransaction = {
      id: `${Date.now()}`,
      day: transaction.day,
      name: newName,
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

export function revalueTransaction(
  transaction: IApiTransaction,
  newValue: number,
) {
  const rule = rulesState.peek().find((f) => f.id === transaction.rule_id);
  if (!rule) return;

  const exceptionalTransaction =
    transaction.exceptionalTransactionID !== undefined ||
    rule.exceptionalTransactions.find(
      (t) => t.id === transaction.exceptionalTransactionID,
    );

  if (exceptionalTransaction !== undefined) {
    // is an existing exceptional transaction

    const newExceptionalTransactions = rule.exceptionalTransactions.map((t) => {
      if (t.id !== transaction.exceptionalTransactionID) return t;

      return {
        ...t,
        value: newValue,
      };
    });
    updateRule({
      ...rule,
      exceptionalTransactions: newExceptionalTransactions,
    });
  } else {
    // is an rrule transaction
    // therefore .rrule exists
    const newRRule = removeDate(rule.rrule as string, transaction.day);
    const newExceptionalTransaction: ExceptionalTransaction = {
      id: `${Date.now()}`,
      day: transaction.day,
      value: newValue,
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

  const exceptionalTransaction =
    transaction.exceptionalTransactionID !== undefined ||
    rule.exceptionalTransactions.find(
      (t) => t.id === transaction.exceptionalTransactionID,
    );

  if (exceptionalTransaction !== undefined) {
    // is an existing exceptional transaction

    updateRule({
      ...rule,
      exceptionalTransactions: rule.exceptionalTransactions.filter(
        (t) => t.id !== transaction.exceptionalTransactionID,
      ),
    });
  } else {
    // is an rrule transaction
    // therefore .rrule exists
    const newRRule = removeDate(rule.rrule as string, transaction.day);
    updateRule({
      ...rule,
      rrule: newRRule,
    });
  }
}
