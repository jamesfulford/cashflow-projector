import { useCallback, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { RulesContainer } from "./rules/RulesContainer";
import { TransactionsContainer } from "./transactions/TransactionsContainer";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { DayByDayContainer } from "./daybyday/DayByDayContainer";
import { ParametersContainer } from "./parameters/ParametersContainer";

import "./Plan.css";
import { initializeEngine } from "../../services/pyodide";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlagService } from "../../services/FlagService";
import { ParameterService } from "../../services/ParameterService";
import { IApiRuleMutate, RulesService } from "../../services/RulesService";
import { DayByDayService } from "../../services/DayByDayService";
import { durationDaysState } from "../../store";
import { TransactionsService } from "../../services/TransactionsService";
import { Reconciler } from "./parameters/Reconciler";

const Loading = () => {
  return (
    <Container className="justify-content-middle text-center mt-5 mb-5">
      <div className="spinner-border text-light" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </Container>
  );
};

const Error = ({ message }: { message?: string }) => {
  return (
    <Container className="justify-content-middle text-center mt-5 mb-5">
      <span className="text-danger">
        {message || "An error occurred. Please reload the page."}
      </span>
    </Container>
  );
};

export const PlanContainer = () => {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    initializeEngine().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return <Loading />;
  }
  return <PlanContainerLoadContext />;
};

const fetchFlags = FlagService.fetchFlags.bind(FlagService);
const fetchParameters = ParameterService.fetchParameters.bind(ParameterService);
const fetchRules = RulesService.fetchRules.bind(RulesService);
const createRuleFn = RulesService.createRule.bind(RulesService);
const deleteRuleFn = RulesService.deleteRule.bind(RulesService);
const updateRuleFn = (rule: IApiRuleMutate & { id: string }) =>
  RulesService.updateRule(rule.id, rule);
const setParametersFn = ParameterService.setParameters.bind(ParameterService);

const PlanContainerLoadContext = () => {
  const { data: flags, error: flagsError } = useQuery({
    queryKey: ["flags"],
    queryFn: fetchFlags,
  });
  const { data: parameters, error: parametersError } = useQuery({
    queryKey: ["parameters"],
    queryFn: fetchParameters,
  });

  const { data: rules, error: rulesError } = useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
    enabled: Boolean(flags && parameters),
  });

  //
  // day by days
  //
  const fetchDayByDays = useCallback(() => {
    if (!parameters) return;
    const durationDays = durationDaysState.peek();
    const endDate = new Date(
      new Date(parameters.startDate).getTime() +
        durationDays * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split("T")[0];

    return DayByDayService.fetchDayByDays(
      {
        ...parameters,
        endDate,
      },
      flags!.highLowEnabled,
    );
  }, [parameters]);
  const { data: daybydays, error: daybydaysError } = useQuery({
    queryKey: ["daybydays", parameters],
    queryFn: fetchDayByDays,
    enabled: Boolean(parameters),
  });

  //
  // transactions
  //
  const fetchTransactions = useCallback(() => {
    if (!parameters) return;
    const durationDays = durationDaysState.peek();
    const endDate = new Date(
      new Date(parameters.startDate).getTime() +
        durationDays * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split("T")[0];

    return TransactionsService.fetchTransactions({
      ...parameters,
      endDate,
    });
  }, [parameters]);
  const { data: transactions, error: transactionsError } = useQuery({
    queryKey: ["transactions", parameters],
    queryFn: fetchTransactions,
    enabled: Boolean(parameters),
  });

  const queryClient = useQueryClient();
  const { mutateAsync: createRule } = useMutation({
    mutationFn: createRuleFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["daybydays"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
  const { mutateAsync: updateRule } = useMutation({
    mutationFn: updateRuleFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["daybydays"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
  const { mutateAsync: deleteRule } = useMutation({
    mutationFn: deleteRuleFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["daybydays"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const { mutateAsync: setParameters } = useMutation({
    mutationFn: setParametersFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameters"] });
      queryClient.invalidateQueries({ queryKey: ["daybydays"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // if duration changes, recompute
  useEffect(() => {
    let isFirstUpdate = true;
    return durationDaysState.subscribe(() => {
      if (isFirstUpdate) {
        isFirstUpdate = false;
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["parameters"] });
      queryClient.invalidateQueries({ queryKey: ["daybydays"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    });
  }, [durationDaysState]);

  if (flagsError) {
    return <Error message="Failed to fetch feature flags." />;
  }
  if (parametersError) {
    return <Error message="Failed to fetch parameters." />;
  }
  if (rulesError) {
    return <Error message="Failed to fetch rules." />;
  }
  if (daybydaysError) {
    return <Error message="Failed to fetch daily balances." />;
  }
  if (transactionsError) {
    return <Error message="Failed to fetch projected transactions." />;
  }

  if (!flags || !parameters || !rules || !daybydays || !transactions) {
    return <Loading />;
  }

  const hasRules = !!rules.length;
  return (
    <div className="plancontainer">
      <Row>
        <Col lg={3}>
          <Reconciler
            parameters={parameters}
            daybydays={daybydays}
            setParameters={setParameters}
          />
          <ParametersContainer
            parameters={parameters}
            setParameters={setParameters}
          />
          <RulesContainer
            rules={rules}
            flags={flags}
            createRule={createRule}
            deleteRule={deleteRule}
            updateRule={updateRule}
          />
        </Col>
        <Col lg={9}>
          {hasRules ? (
            <>
              <DayByDayContainer
                flags={flags}
                daybydays={daybydays}
                parameters={parameters}
              />
              <TransactionsContainer transactions={transactions} />
            </>
          ) : (
            <Container className="justify-content-middle text-center mt-5 mb-5">
              <h3 className="text-light">Welcome! Start by adding a rule.</h3>
            </Container>
          )}
        </Col>
      </Row>
    </div>
  );
};
