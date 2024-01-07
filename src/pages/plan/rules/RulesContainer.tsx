import { useCallback, useState } from "react";
import { Rule } from "./rule/Rule";
import sortBy from "lodash/sortBy";
import Container from "react-bootstrap/Container";
import { AddEditRule } from "./AddEditRule";
import { IApiRule, IApiRuleMutate } from "../../../services/RulesService";
import { IFlags } from "../../../services/FlagService";

export const RulesContainer = ({
  rules,
  flags: { highLowEnabled },
  createRule,
  deleteRule,
  updateRule,
}: {
  rules: IApiRule[];
  flags: IFlags;
  createRule: (rule: IApiRuleMutate) => Promise<IApiRule>;
  deleteRule: (ruleid: string) => Promise<void>;
  updateRule: (rule: IApiRuleMutate & { id: string }) => Promise<IApiRule>;
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();

  const onUpdate = useCallback(
    async (rule: IApiRuleMutate) => {
      if (!selectedRuleId) {
        console.warn(
          "Attempted to update rule without rule selected. Ignoring. (this should never happen)",
        );
        return;
      }
      const updatedRule = {
        ...rule,
        id: selectedRuleId,
      };
      return updateRule(updatedRule).then(() => setSelectedRuleId(undefined));
    },
    [selectedRuleId, updateRule],
  );

  const onDelete = useCallback(async () => {
    if (!selectedRuleId) {
      console.warn(
        "Attempted to delete rule without rule selected. Ignoring. (this should never happen)",
      );
      return;
    }
    return deleteRule(selectedRuleId);
  }, [selectedRuleId, deleteRule]);

  const onDeselect = useCallback(() => {
    setSelectedRuleId(undefined);
  }, [setSelectedRuleId]);
  const onCreate = useCallback(
    async (rule: IApiRuleMutate) => {
      await createRule(rule);
    },
    [createRule],
  );

  if (!rules?.length) {
    // empty
    return (
      <>
        <AddEditRule
          highLowEnabled={highLowEnabled}
          onDeselect={onDeselect}
          onCreate={onCreate}
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
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        rule={selectedRule}
        key={selectedRuleId}
      />

      <div
        style={{
          overflowY: "auto",
          height: "50vh",
        }}
      >
        {sortedRules.map((rule) => (
          <Rule
            rule={rule}
            onClick={(id) => {
              setSelectedRuleId(id);
            }}
            key={rule.id}
            selected={rule.id === selectedRuleId}
          />
        ))}
      </div>
    </>
  );
};
