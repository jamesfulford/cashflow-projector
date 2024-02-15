import { useCallback, useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
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

export function PureComputationsContainer({
  parameters,
  parametersActions,
  rules,
  ruleActions,
  flags,
}: ComputationsContainerProps) {
  // ExecutionContextParameters are values derived directly from parameters and rules,
  // especially `minimumEndDate`.
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const getExecutionContextParameters = useCallback(() => {
    if (!rules) return;
    if (!parameters) return;
    return fetchExecutionContextParameters(rules, parameters);
  }, [rules, parameters]);
  const {
    data: executionContextParameters,
    error: executionContextParametersError,
  } = useQuery({
    queryKey: ["executionContextParameters", rules, parameters],
    queryFn: getExecutionContextParameters,
    enabled: Boolean(rules && parameters),
  });

  useEffect(() => {
    if (!executionContextParameters) return;
    if (!parameters?.startDate) return;
    const minimumDaysToCompute =
      getComputedDurationDays(
        parameters?.startDate,
        executionContextParameters.minimumEndDate,
      ) ?? 0;

    return durationDaysState.subscribe((durationDays) => {
      const daysToCompute = Math.max(durationDays, minimumDaysToCompute);
      const newEndDate = new Date(
        new Date(parameters.startDate).getTime() +
          daysToCompute * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];

      setEndDate(newEndDate);
    });
  }, [executionContextParameters, parameters?.startDate]);

  const [displayEndDate, setDisplayEndDate] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!parameters) return;
    return durationDaysState.subscribe((durationDays) => {
      const newDisplayEndDate = new Date(
        new Date(parameters.startDate).getTime() +
          durationDays * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];

      setDisplayEndDate(newDisplayEndDate);
    });
  }, [parameters]);

  //
  // day by days
  //
  const fetchDayByDays = useCallback(async () => {
    if (!parameters) return;
    if (!endDate) return;

    return DayByDayService.fetchDayByDays(
      {
        ...parameters,
        endDate,
      },
      flags!.highLowEnabled,
    );
  }, [endDate, flags, parameters]);
  const { data: rawDayByDays, error: daybydaysError } = useQuery({
    queryKey: ["daybydays", endDate, parameters],
    queryFn: fetchDayByDays,
    enabled: Boolean(endDate && parameters),
  });
  const daybydays = useMemo(() => {
    if (!rawDayByDays) return;
    if (!displayEndDate) return;
    return {
      ...rawDayByDays,
      daybydays: rawDayByDays.daybydays.filter((d) => d.date <= displayEndDate),
    };
  }, [rawDayByDays, displayEndDate]);

  //
  // transactions
  //
  const fetchTransactions = useCallback(() => {
    if (!parameters) return;
    if (!endDate) return;

    return TransactionsService.fetchTransactions({
      ...parameters,
      endDate,
    });
  }, [endDate, parameters]);
  const { data: rawTransactions, error: transactionsError } = useQuery({
    queryKey: ["transactions", endDate, parameters],
    queryFn: fetchTransactions,
    enabled: Boolean(endDate && parameters),
  });

  const transactions = useMemo(() => {
    if (!displayEndDate) return;
    if (!rawTransactions) return;
    return rawTransactions.filter((d) => d.day <= displayEndDate);
  }, [displayEndDate, rawTransactions]);

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

  if (executionContextParametersError) {
    throw new Error("Failed to compute execution context parameters.");
  }
  if (daybydaysError) {
    throw new Error("Failed to fetch daily balances.");
  }
  if (transactionsError) {
    throw new Error("Failed to fetch projected transactions.");
  }

  if (!executionContextParameters || !daybydays || !transactions) {
    return <Loading />;
  }

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
