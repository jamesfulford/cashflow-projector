import React, { useCallback, useState } from "react";
import { Rule } from "./rule/Rule";
import sortBy from "lodash/sortBy";
import Container from "react-bootstrap/Container";
import { AddEditRule } from "./AddEditRule";
import { useThunkDispatch } from "../../../useDispatch";
import {
  createRule,
  deleteRule,
  updateRule,
} from "../../../store/reducers/rules";
import { useSelector } from "react-redux";
import { getRules } from "../../../store/reducers/rules/getters";
import { IApiRule, IApiRuleMutate } from "../../../services/RulesService";
import { getIsHighLowEnabled } from "../../../store/reducers/flags/getters";

export const RulesContainer = () => {
  const dispatch = useThunkDispatch();

  const {
    rules: { data, loading, error },
  } = useSelector((state) => ({
    rules: getRules(state as any),
  }));

  const { highLowEnabled } = useSelector((state) => ({
    highLowEnabled: getIsHighLowEnabled(state as any),
  }));

  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();

  const createNewRule = useCallback(
    (rule: IApiRuleMutate) => {
      return dispatch(createRule(rule) as any);
    },
    [dispatch],
  );

  const deleteHandler = useCallback(
    (id: string) => {
      return dispatch(deleteRule(id) as any);
    },
    [dispatch],
  );

  const updateExistingRule = useCallback(
    (id: string, rule: IApiRuleMutate) => {
      return dispatch(updateRule(id, rule) as any);
    },
    [dispatch],
  );

  // translate to props
  const onUpdate = useCallback(
    async (rule: IApiRuleMutate) => {
      if (!selectedRuleId) {
        console.warn(
          "Attempted to update rule without rule selected. Ignoring. (this should never happen)",
        );
        return;
      }
      return updateExistingRule(selectedRuleId, rule).then(() =>
        setSelectedRuleId(undefined),
      );
    },
    [selectedRuleId, updateExistingRule],
  );

  const onDelete = useCallback(async () => {
    if (!selectedRuleId) {
      console.warn(
        "Attempted to delete rule without rule selected. Ignoring. (this should never happen)",
      );
      return;
    }
    return deleteHandler(selectedRuleId);
  }, [selectedRuleId, deleteHandler]);

  const onDeselect = useCallback(() => {
    setSelectedRuleId(undefined);
  }, [setSelectedRuleId]);

  if (loading) {
    return (
      <>
        <AddEditRule
          highLowEnabled={highLowEnabled}
          onDeselect={onDeselect}
          onCreate={createNewRule}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
        <div className="spinner-border" role="status">
          <span data-testid="rules-loading" className="visually-hidden"></span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AddEditRule
          highLowEnabled={highLowEnabled}
          onDeselect={onDeselect}
          onCreate={createNewRule}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
        <p data-testid="rules-load-error">
          Oops! Looks like we can't get your rules right now. Try reloading the
          page.
        </p>
      </>
    );
  }

  const rules = data;

  if (!rules?.length) {
    // empty
    return (
      <>
        <AddEditRule
          highLowEnabled={highLowEnabled}
          onDeselect={onDeselect}
          onCreate={createNewRule}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
        <Container data-testid="no-rules-found" className="text-center" />
      </>
    );
  }

  const selectedRule = rules.find((r) => r.id === selectedRuleId);

  const sortedRules = sortBy(rules, (r: IApiRule) => r.value);

  return (
    <>
      <AddEditRule
        highLowEnabled={highLowEnabled}
        onDeselect={onDeselect}
        onCreate={createNewRule}
        onUpdate={onUpdate}
        onDelete={onDelete}
        rule={selectedRule}
        key={selectedRuleId}
      />

      {sortedRules.map((rule) => (
        <Rule
          rule={rule}
          onClick={(id) => {
            console.log(id);
            setSelectedRuleId(id);
          }}
          key={rule.id}
          selected={rule.id === selectedRuleId}
        />
      ))}
    </>
  );
};
