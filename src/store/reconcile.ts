import { computed, signal } from "@preact/signals-core";
import {
  currentBalanceState,
  setParameters,
  startDateState,
} from "./parameters";
import { deferTransaction, transactionsState } from "./transactions";
import { RuleType, rulesState, updateRule } from "./rules";
import { fromDateToString, fromStringToDate } from "../services/engine/rrule";
import { addDays } from "date-fns/addDays";

function currentDateLocalTimezone() {
  const nowDate = new Date();
  return `${nowDate.getFullYear()}-${(nowDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${nowDate.getDate().toString().padStart(2, "0")}`;
}
// actual date, not parameters startDate
export const todayState = signal<string>(currentDateLocalTimezone());
// update actual date intermittently
const intervalID = setInterval(
  () => {
    todayState.value = currentDateLocalTimezone();
  },
  5 * 60 * 1000,
);
if (import.meta.hot) {
  import.meta.hot.dispose(() => clearInterval(intervalID));
}

export const reconciliationRequiredState = computed(
  () => todayState.value !== startDateState.value,
);

// whether to apply savings goal transactions or not
export const skipTransferState = signal(false);

export const reconciliationTransactionsState = computed(() => {
  const todayDate = todayState.value;
  const startDate = startDateState.value;
  return transactionsState.value.filter(
    (t) => t.day >= startDate && t.day < todayDate,
  );
});

export const transactionsToApplyState = computed(() => {
  const todayDate = todayState.value;

  const rules = rulesState.value;
  const skipSavingsGoalTransactions = skipTransferState.value;

  return transactionsState.value
    .filter((t) => t.day < todayDate)
    .filter((t) => {
      const rule = rules.find((r) => r.id === t.rule_id);
      if (!rule) return false;
      if (skipSavingsGoalTransactions) {
        return rule.type !== RuleType.SAVINGS_GOAL;
      }
      return true;
    });
});

export const reconciliationExpectedBalanceState = computed(() => {
  let expectedBalance = currentBalanceState.value;

  transactionsToApplyState.value.forEach((t) => {
    expectedBalance += t.value;
  });

  return expectedBalance;
});

export function finishReconciliation({ newBalance }: { newBalance: number }) {
  const reconciliationTransactions = reconciliationTransactionsState.value;

  // if user says they aren't going to transfer,
  // then defer all transactions to tomorrow
  if (skipTransferState.peek()) {
    reconciliationTransactions
      .filter((t) => {
        const rule = rulesState.value.find((r) => r.id === t.rule_id);
        if (!rule) return false;
        return rule.type === RuleType.SAVINGS_GOAL;
      })
      .forEach((t) => {
        deferTransaction(
          t,
          fromDateToString(addDays(fromStringToDate(todayState.peek()), 1)),
        );
      });
  }

  setParameters({
    startDate: todayState.peek(),
    currentBalance: newBalance,
  });

  // apply savings goal progress
  reconciliationTransactions.forEach((t) => {
    const rule = rulesState.value.find((r) => r.id === t.rule_id);
    if (!rule) return;

    if (rule.type === RuleType.SAVINGS_GOAL) {
      updateRule({
        ...rule,
        progress: rule.progress + -t.value,
      });
    }
  });
}
