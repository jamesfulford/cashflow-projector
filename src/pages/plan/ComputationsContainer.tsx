import { useCallback, useEffect, useMemo, useState } from "react";

import { DayByDayService } from "../../services/DayByDayService";
import { durationDaysState } from "../../store";
import {
  IApiTransaction,
  TransactionsService,
} from "../../services/TransactionsService";
import { ExecutionContextParametersService } from "../../services/ExecutionContextParametersService";
import { IParameters } from "../../services/ParameterService";
import { IParametersActions, IRuleActions } from "./PlanProvider";
import { IApiRule } from "../../services/RulesService";
import { Loading } from "./Loading";
import { initializeEngine } from "../../services/pyodide";
import { IFlags } from "../../services/FlagService";
import { PlanLayout } from "./PlanLayout";
import { addDate, removeDate } from "./rule-update";

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

const fetchExecutionContextParameters =
  ExecutionContextParametersService.getExecutionContextParameters.bind(
    ExecutionContextParametersService,
  );

export interface TransactionActions {
  deferTransaction: (
    transaction: IApiTransaction,
    newDate: string,
  ) => Promise<void>;
  skipTransaction: (transaction: IApiTransaction) => Promise<void>;
}

interface ComputationsContainerProps {
  rules: IApiRule[];
  ruleActions: IRuleActions;

  parameters: IParameters;
  parametersActions: IParametersActions;

  flags: IFlags;
}
export function ComputationsContainer(props: ComputationsContainerProps) {
  // this layer should just initialize the pyodide engine
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    initializeEngine().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return <Loading />;
  }
  return <PureComputationsContainer {...props} />;
}

function computeEndDate(startDate: string, daysToCompute: number) {
  const newEndDate = new Date(
    new Date(startDate).getTime() + daysToCompute * 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .split("T")[0];
  return newEndDate;
}

export function PureComputationsContainer({
  parameters,
  parametersActions,
  rules,
  ruleActions,
  flags,
}: ComputationsContainerProps) {
  // ExecutionContextParameters are values derived directly from parameters and rules,
  // especially `minimumEndDate`.
  const executionContextParameters = useMemo(() => {
    return fetchExecutionContextParameters(rules, parameters);
  }, [parameters, rules]);

  const minimumDaysToCompute =
    getComputedDurationDays(
      parameters.startDate,
      executionContextParameters.minimumEndDate,
    ) ?? 0;

  const [endDate, setEndDate] = useState<string>(
    computeEndDate(
      parameters.startDate,
      Math.max(durationDaysState.peek(), minimumDaysToCompute),
    ),
  );
  useEffect(() => {
    return durationDaysState.subscribe((durationDays) => {
      setEndDate(
        computeEndDate(
          parameters.startDate,
          Math.max(durationDays, minimumDaysToCompute),
        ),
      );
    });
  }, [minimumDaysToCompute, parameters.startDate]);

  const [displayEndDate, setDisplayEndDate] = useState<string>(
    computeEndDate(parameters.startDate, durationDaysState.peek()),
  );
  useEffect(() => {
    return durationDaysState.subscribe((durationDays) => {
      setDisplayEndDate(computeEndDate(parameters.startDate, durationDays));
    });
  }, [parameters]);

  //
  // day by days
  //
  const daybydays = useMemo(() => {
    rules;
    const rawDayByDays = DayByDayService.fetchDayByDays(
      {
        ...parameters,
        endDate,
      },
      flags!.highLowEnabled,
    );
    return {
      ...rawDayByDays,
      daybydays: rawDayByDays.daybydays.filter((d) => d.date <= displayEndDate),
    };
  }, [displayEndDate, endDate, flags, parameters, rules]);

  //
  // transactions
  //
  const transactions = useMemo(() => {
    rules;
    // TODO: have all values be passed to service, not pulled from other services
    const rawTransactions = TransactionsService.fetchTransactions({
      ...parameters,
      endDate,
    });
    return rawTransactions.filter((d) => d.day <= displayEndDate);
  }, [displayEndDate, endDate, parameters, rules]);

  const deferTransaction = useCallback(
    async (transaction: IApiTransaction, newDate: string) => {
      const rule = rules.find((f) => f.id === transaction.rule_id);
      if (!rule) return; // this shouldn't happen

      const newRRule = addDate(
        removeDate(rule.rrule, transaction.day),
        newDate,
      );
      await ruleActions.updateRule({
        ...rule,
        rrule: newRRule,
      });
    },
    [ruleActions, rules],
  );
  const skipTransaction = useCallback(
    async (transaction: IApiTransaction) => {
      const rule = rules.find((f) => f.id === transaction.rule_id);
      if (!rule) return; // this shouldn't happen

      const newRRule = removeDate(rule.rrule, transaction.day);
      await ruleActions.updateRule({
        ...rule,
        rrule: newRRule,
      });
    },
    [ruleActions, rules],
  );

  const transactionActions: TransactionActions = useMemo(
    () => ({ deferTransaction, skipTransaction }),
    [deferTransaction, skipTransaction],
  );

  return (
    <PlanLayout
      rules={rules}
      ruleActions={ruleActions}
      parameters={parameters}
      parametersActions={parametersActions}
      flags={flags}
      transactions={transactions}
      transactionActions={transactionActions}
      daybydays={daybydays}
    />
  );
}
