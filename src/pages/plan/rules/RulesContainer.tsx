import { useCallback, useEffect, useRef, useState } from "react";
import Container from "react-bootstrap/Container";
import { AddEditRule } from "./AddEditRule";
import { IApiRule, IApiRuleMutate } from "../../../store/rules";
import { IFlags } from "../../../store/flags";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/esm/Button";
import { IParameters } from "../../../store/parameters";
import { RulesDisplay } from "./RulesDisplay";

export const RulesContainer = ({
  rules,
  ruleActions,

  flags: { highLowEnabled },
  parameters,
}: {
  rules: IApiRule[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ruleActions: any;

  flags: IFlags;
  parameters: IParameters;
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();
  const [targetForDeleteRuleId, setTargetForDeleteRuleId] = useState<
    string | undefined
  >();

  const onUpdate = useCallback(
    (rule: IApiRuleMutate) => {
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
      ruleActions.updateRule(updatedRule);
      setSelectedRuleId(undefined);
    },
    [selectedRuleId, ruleActions],
  );

  const onCreate = useCallback(
    (rule: IApiRuleMutate) => {
      ruleActions.createRule(rule);
    },
    [ruleActions],
  );

  const onClose = useCallback(() => {
    setSelectedRuleId(undefined);
  }, []);

  const deleteButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (targetForDeleteRuleId && deleteButtonRef.current)
      deleteButtonRef.current.focus();
  }, [targetForDeleteRuleId]);

  if (!rules?.length) {
    // empty
    return (
      <>
        <AddEditRule
          highLowEnabled={highLowEnabled}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onClose={onClose}
          parameters={parameters}
        />
        <Container data-testid="no-rules-found" className="text-center" />
      </>
    );
  }

  const selectedRule = rules.find((r) => r.id === selectedRuleId);
  const targetedRuleForDelete = rules.find(
    (r) => r.id === targetForDeleteRuleId,
  );

  return (
    <>
      <AddEditRule
        highLowEnabled={highLowEnabled}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onClose={onClose}
        rule={selectedRule}
        key={selectedRuleId}
        parameters={parameters}
      />

      <Modal
        show={Boolean(targetForDeleteRuleId)}
        onHide={() => {
          setTargetForDeleteRuleId(undefined);
        }}
        keyboard
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Are you sure you want to delete '{targetedRuleForDelete?.name}'?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setTargetForDeleteRuleId(undefined);
            }}
          >
            No
          </Button>
          <Button
            ref={deleteButtonRef}
            variant="danger"
            onClick={() => {
              void ruleActions.deleteRule(targetForDeleteRuleId as string);
              setTargetForDeleteRuleId(undefined);
            }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <RulesDisplay
        rules={rules}
        ruleActions={ruleActions}
        selectedRuleId={selectedRuleId}
        setSelectedRuleId={setSelectedRuleId}
        targetForDeleteRuleId={targetForDeleteRuleId}
        setTargetForDeleteRuleId={setTargetForDeleteRuleId}
        parameters={parameters}
      />
    </>
  );
};
