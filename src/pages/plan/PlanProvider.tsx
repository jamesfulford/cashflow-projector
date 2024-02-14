import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlagService } from "../../services/FlagService";
import { ParameterService } from "../../services/ParameterService";
import { IApiRuleMutate, RulesService } from "../../services/RulesService";
import { useCallback, useMemo } from "react";
import { ComputationsContainer } from "./ComputationsContainer";
import { Loading } from "./Loading";
import { migrateRules } from "./rules-migration";

const fetchFlags = FlagService.fetchFlags.bind(FlagService);

const fetchParameters = ParameterService.fetchParameters.bind(ParameterService);
const setParametersFn = ParameterService.setParameters.bind(ParameterService);

export interface IParametersActions {
  setParameters: typeof setParametersFn;
}

const fetchRules = RulesService.fetchRules.bind(RulesService);
const createRuleFn = RulesService.createRule.bind(RulesService);
const deleteRuleFn = RulesService.deleteRule.bind(RulesService);
const updateRuleFn = (rule: IApiRuleMutate & { id: string }) =>
  RulesService.updateRule(rule.id, rule);

export interface IRuleActions {
  deleteRule: typeof deleteRuleFn;
  createRule: typeof createRuleFn;
  updateRule: typeof updateRuleFn;
}

export const PlanProvider = () => {
  const { data: flags, error: flagsError } = useQuery({
    queryKey: ["flags"],
    queryFn: fetchFlags,
  });
  const { data: parameters, error: parametersError } = useQuery({
    queryKey: ["parameters"],
    queryFn: fetchParameters,
  });

  const { data: rawRules, error: rulesError } = useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
    enabled: Boolean(flags && parameters),
  });
  const rules = useMemo(
    () => rawRules && parameters && migrateRules(rawRules, parameters),
    [rawRules, parameters],
  );

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

  //
  // parameters modification and query invalidations
  //
  const { mutateAsync: setParameters } = useMutation({
    mutationFn: setParametersFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameters"] });
      queryClient.invalidateQueries({ queryKey: ["daybydays"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  //
  // action bundles
  //
  const ruleActions = useMemo(
    () => ({ deleteRule, createRule, updateRule }),
    [deleteRule, createRule, updateRule],
  );
  const parametersActions = useMemo(() => ({ setParameters }), [setParameters]);

  if (flagsError) {
    throw new Error("Failed to fetch feature flags.");
  }
  if (parametersError) {
    throw new Error("Failed to fetch parameters.");
  }
  if (rulesError) {
    throw new Error("Failed to fetch rules.");
  }

  if (!flags || !parameters || !rules) {
    return <Loading />;
  }

  return (
    <ComputationsContainer
      rules={rules}
      ruleActions={ruleActions}
      parameters={parameters}
      parametersActions={parametersActions}
      flags={flags}
    />
  );
};
