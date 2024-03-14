import { useCallback, useEffect, useMemo, useState } from "react";

import { Loading } from "./Loading";
import { initializeEngine } from "../../services/pyodide";
import { PlanLayout } from "./PlanLayout";
import { addDate, removeDate } from "./rule-update";
import {
  createRule,
  deleteRule,
  rulesState,
  updateRule,
} from "../../store/rules";
import { useSignalValue } from "../../store/useSignalValue";
import { parametersState, setParameters } from "../../store/parameters";
import { IApiTransaction, transactions } from "../../store/transactions";
import { daybydays } from "../../store/daybydays";
import { flagsState } from "../../store/flags";

export interface TransactionActions {
  deferTransaction: (
    transaction: IApiTransaction,
    newDate: string,
  ) => Promise<void>;
  skipTransaction: (transaction: IApiTransaction) => Promise<void>;
}

export function ComputationsContainer() {
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
  return <PureComputationsContainer />;
}

export function PureComputationsContainer() {
  const rules = useSignalValue(rulesState);
  const ruleActions = useMemo(
    () => ({ updateRule, createRule, deleteRule }),
    [],
  );

  const parameters = useSignalValue(parametersState);
  const parametersActions = useMemo(() => ({ setParameters }), []);

  const _transactions = useSignalValue(transactions);
  const _daybydays = useSignalValue(daybydays);

  const flags = useSignalValue(flagsState);

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
      transactions={_transactions}
      transactionActions={transactionActions}
      daybydays={_daybydays}
    />
  );
}
