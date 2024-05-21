import { computed } from "@preact/signals-core";
import { parametersState } from "./parameters";
import {
  ExceptionalTransaction,
  RecurringRule,
  isRecurringRule,
  isTransactionsListRule,
  rulesState,
  updateRule,
} from "./rules";
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
  isLastPayment?: true;
  state?: number; // on loan, is balance; on goal, is progress
}

export const computedTransactionsState = computed(() => {
  const rules = rulesState.value;
  const parameters = {
    ...parametersState.value,
    endDate: endDateState.value,
  };
  return computeTransactions(rules, parameters);
});

export const transactionsState = computed(() => {
  const displayEndDateValue = displayEndDateState.value;
  return computedTransactionsState.value.filter(
    (d) => d.day <= displayEndDateValue,
  );
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

    if (isTransactionsListRule(rule)) {
      const newExceptionalTransactions = rule.exceptionalTransactions.map(
        (t) => {
          if (t.id !== transaction.exceptionalTransactionID) return t;

          return {
            ...t,
            day: newDate,
          };
        },
      );
      updateRule({
        ...rule,
        exceptionalTransactions: newExceptionalTransactions,
      });
    }
    if (isRecurringRule(rule)) {
      const newExceptionalTransactions = rule.exceptionalTransactions.map(
        (t) => {
          if (t.id !== transaction.exceptionalTransactionID) return t;

          return {
            ...t,
            day: newDate,
          };
        },
      );
      updateRule({
        ...rule,
        exceptionalTransactions: newExceptionalTransactions,
      });
    }
  } else {
    // if not exceptional transaction, must be an rrule transaction
    // which means rule.rrule exists
    const recurringRule = rule as RecurringRule & { id: string };

    // remove date from rrule and add exceptional transaction
    const newRRule = removeDate(recurringRule.rrule, transaction.day);
    const newExceptionalTransaction: ExceptionalTransaction = {
      id: `${Date.now()}`,
      day: newDate,
    };

    updateRule({
      ...recurringRule,
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

    if (isTransactionsListRule(rule)) {
      const newExceptionalTransactions = rule.exceptionalTransactions.map(
        (t) => {
          if (t.id !== transaction.exceptionalTransactionID) return t;

          return {
            ...t,
            name: newName,
          };
        },
      );
      updateRule({
        ...rule,
        exceptionalTransactions: newExceptionalTransactions,
      });
    }
    if (isRecurringRule(rule)) {
      const newExceptionalTransactions = rule.exceptionalTransactions.map(
        (t) => {
          if (t.id !== transaction.exceptionalTransactionID) return t;

          return {
            ...t,
            name: newName,
          };
        },
      );
      updateRule({
        ...rule,
        exceptionalTransactions: newExceptionalTransactions,
      });
    }
  } else {
    // if not exceptional transaction, must be an rrule transaction
    // which means rule.rrule exists
    const recurringRule = rule as RecurringRule & { id: string };

    const newRRule = removeDate(recurringRule.rrule, transaction.day);
    const newExceptionalTransaction: ExceptionalTransaction = {
      id: `${Date.now()}`,
      day: transaction.day,
      name: newName,
    };
    updateRule({
      ...recurringRule,
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

    if (isTransactionsListRule(rule)) {
      const newExceptionalTransactions = rule.exceptionalTransactions.map(
        (t) => {
          if (t.id !== transaction.exceptionalTransactionID) return t;

          return {
            ...t,
            value: newValue,
          };
        },
      );
      updateRule({
        ...rule,
        exceptionalTransactions: newExceptionalTransactions,
      });
    }
    if (isRecurringRule(rule)) {
      const newExceptionalTransactions = rule.exceptionalTransactions.map(
        (t) => {
          if (t.id !== transaction.exceptionalTransactionID) return t;

          return {
            ...t,
            value: newValue,
          };
        },
      );
      updateRule({
        ...rule,
        exceptionalTransactions: newExceptionalTransactions,
      });
    }
  } else {
    // if not exceptional transaction, must be an rrule transaction
    // which means rule.rrule exists
    const recurringRule = rule as RecurringRule & { id: string };

    const newRRule = removeDate(recurringRule.rrule, transaction.day);
    const newExceptionalTransaction: ExceptionalTransaction = {
      id: `${Date.now()}`,
      day: transaction.day,
      value: newValue,
    };
    updateRule({
      ...recurringRule,
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

    if (isRecurringRule(rule))
      updateRule({
        ...rule,
        exceptionalTransactions: rule.exceptionalTransactions.filter(
          (t) => t.id !== transaction.exceptionalTransactionID,
        ),
      });
    if (isTransactionsListRule(rule))
      updateRule({
        ...rule,
        exceptionalTransactions: rule.exceptionalTransactions.filter(
          (t) => t.id !== transaction.exceptionalTransactionID,
        ),
      });
  } else {
    // if not exceptional transaction, must be an rrule transaction
    // which means rule.rrule exists
    const recurringRule = rule as RecurringRule & { id: string };

    const newRRule = removeDate(recurringRule.rrule, transaction.day);
    updateRule({
      ...recurringRule,
      rrule: newRRule,
    });
  }
}
