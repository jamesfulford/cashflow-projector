import { FlagService } from "../../services/FlagService";
import { IParameters, ParameterService } from "../../services/ParameterService";
import { IApiRuleMutate, RulesService } from "../../services/RulesService";
import { useCallback, useMemo, useState } from "react";
import { ComputationsContainer } from "./ComputationsContainer";
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
  const flags = useMemo(() => fetchFlags(), []);

  const initialParameters = useMemo(() => fetchParameters(), []);
  const [parameters, setRawParameters] = useState(initialParameters);

  const initialRawRules = useMemo(() => fetchRules(), []);
  const [rawRules, setRawRules] = useState(initialRawRules);

  const rules = useMemo(() => {
    return migrateRules(rawRules, parameters);
  }, [rawRules, parameters]);

  //
  // Rule modifications and query invalidations
  //

  const refreshRules = useCallback(() => {
    setRawRules(fetchRules());
  }, []);

  const createRule = useCallback(
    (rule: IApiRuleMutate) => {
      try {
        return createRuleFn(rule);
      } finally {
        refreshRules();
      }
    },
    [refreshRules],
  );
  const updateRule = useCallback(
    (rule: IApiRuleMutate & { id: string }) => {
      try {
        return updateRuleFn(rule);
      } finally {
        refreshRules();
      }
    },
    [refreshRules],
  );
  const deleteRule = useCallback(
    (ruleid: string) => {
      try {
        return deleteRuleFn(ruleid);
      } finally {
        refreshRules();
      }
    },
    [refreshRules],
  );

  const setParameters = useCallback((params: Partial<IParameters>) => {
    try {
      return ParameterService.setParameters(params);
    } finally {
      setRawParameters(ParameterService.fetchParameters());
    }
  }, []);

  //
  // action bundles
  //
  const ruleActions = useMemo(
    () => ({ deleteRule, createRule, updateRule }),
    [deleteRule, createRule, updateRule],
  );
  const parametersActions = useMemo(() => ({ setParameters }), [setParameters]);

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
