import { useCallback, useEffect, useMemo, useState } from "react";
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
import Spinner from "react-bootstrap/esm/Spinner";
import { ExecutionContextParametersService } from "../../services/ExecutionContextParametersService";
import { DurationSelector } from "./parameters/DurationSelector";

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

const Loading = () => {
  return (
    <Container className="justify-content-middle text-center mt-5 mb-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
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
const fetchExecutionContextParameters =
  ExecutionContextParametersService.getExecutionContextParameters.bind(
    ExecutionContextParametersService,
  );
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

  //
  // Rule modifications and query invalidations
  //

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

  if (flagsError) {
    return <Error message="Failed to fetch feature flags." />;
  }
  if (parametersError) {
    return <Error message="Failed to fetch parameters." />;
  }
  if (rulesError) {
    return <Error message="Failed to fetch rules." />;
  }
  if (executionContextParametersError) {
    return <Error message="Failed to compute execution context parameters." />;
  }
  if (daybydaysError) {
    return <Error message="Failed to fetch daily balances." />;
  }
  if (transactionsError) {
    return <Error message="Failed to fetch projected transactions." />;
  }

  if (
    !flags ||
    !parameters ||
    !executionContextParameters ||
    !rules ||
    !daybydays ||
    !transactions
  ) {
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
                height="45vh"
              />
              <DurationSelector />
              <TransactionsContainer transactions={transactions} />
            </>
          ) : (
            <Container className="justify-content-middle text-center mt-5 mb-5">
              <h3>Welcome! Start by adding a rule.</h3>
            </Container>
          )}
        </Col>
      </Row>
    </div>
  );
};
