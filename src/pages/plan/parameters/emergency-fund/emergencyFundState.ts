import { computed } from "@preact/signals-core";
import { emergencyFundRuleState, rulesState } from "../../../../store/rules";
import { computeTransactions } from "../../../../services/engine/transactions";
import { startDateState } from "../../../../store/parameters";
import {
  fromDateToString,
  fromStringToDate,
} from "../../../../services/engine/rrule";
import { addDays } from "date-fns/addDays";
import { IApiTransaction } from "../../../../store/transactions";
import { addMonths } from "date-fns/addMonths";

export const emergencyFundSimulationRulesState = computed(() => {
  return rulesState.value.filter(
    (r) => r.emergencyScenarioApplicability !== false,
  );
});

export const emergencyFundSimulationTransactionsState = computed(() => {
  const emergencyRules = emergencyFundSimulationRulesState.value;
  const startDate = startDateState.value;

  const endDate = fromDateToString(addDays(fromStringToDate(startDate), 365));

  return computeTransactions(emergencyRules, {
    startDate,
    currentBalance: 0,
    setAside: 0,
    endDate,
  });
});

function computeDepletedDate(
  emergencyFundSimulationTransactions: IApiTransaction[],
  balanceToDeplete: number,
) {
  const depletingTransaction = emergencyFundSimulationTransactions.find(
    (t) => -t.calculations.balance > balanceToDeplete,
  );
  return depletingTransaction?.day;
}

export const fundDepletedDateState = computed(() => {
  const emergencyFundRule = emergencyFundRuleState.value;
  if (!emergencyFundRule) return;
  const { progress } = emergencyFundRule;
  return computeDepletedDate(
    emergencyFundSimulationTransactionsState.value,
    progress,
  );
});

export const emergencyFundAmountNeeded1MonthState = computed<
  [string, number] | undefined
>(() => {
  const targetDate = fromDateToString(addMonths(startDateState.value, 1));
  const transaction = emergencyFundSimulationTransactionsState.value.find(
    (t) => t.day > targetDate,
  );
  return transaction
    ? [transaction.day, -transaction.calculations.balance]
    : undefined;
});
export const emergencyFundAmountNeeded3MonthsState = computed<
  [string, number] | undefined
>(() => {
  const targetDate = fromDateToString(addMonths(startDateState.value, 3));
  const transaction = emergencyFundSimulationTransactionsState.value.find(
    (t) => t.day > targetDate,
  );
  return transaction
    ? [transaction.day, -transaction.calculations.balance]
    : undefined;
});
export const emergencyFundAmountNeeded6MonthsState = computed<
  [string, number] | undefined
>(() => {
  const targetDate = fromDateToString(addMonths(startDateState.value, 6));
  const transaction = emergencyFundSimulationTransactionsState.value.find(
    (t) => t.day > targetDate,
  );
  return transaction
    ? [transaction.day, -transaction.calculations.balance]
    : undefined;
});
export const emergencyFundAmountNeeded1YearState = computed<
  [string, number] | undefined
>(() => {
  const transaction = emergencyFundSimulationTransactionsState.value.at(-1);
  return transaction
    ? [transaction.day, -transaction.calculations.balance]
    : undefined;
});
