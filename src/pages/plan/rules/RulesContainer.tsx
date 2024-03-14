import { useCallback, useEffect, useRef, useState } from "react";
import Container from "react-bootstrap/Container";
import { AddEditRule } from "./AddEditRule";
import {
  IApiRuleMutate,
  createRule,
  deleteRule,
  rulesState,
  updateRule,
} from "../../../store/rules";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/esm/Button";
import { RulesDisplay } from "./RulesDisplay";
import { useSignalValue } from "../../../store/useSignalValue";

export const RulesContainer = () => {
  const rules = useSignalValue(rulesState);

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
      updateRule(updatedRule);
      setSelectedRuleId(undefined);
    },
    [selectedRuleId],
  );

  const onCreate = useCallback((rule: IApiRuleMutate) => {
    createRule(rule);
  }, []);

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
          onCreate={onCreate}
          onUpdate={onUpdate}
          onClose={onClose}
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
        onCreate={onCreate}
        onUpdate={onUpdate}
        onClose={onClose}
        rule={selectedRule}
        key={selectedRuleId}
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
              void deleteRule(targetForDeleteRuleId as string);
              setTargetForDeleteRuleId(undefined);
            }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <RulesDisplay
        selectedRuleId={selectedRuleId}
        setSelectedRuleId={setSelectedRuleId}
        targetForDeleteRuleId={targetForDeleteRuleId}
        setTargetForDeleteRuleId={setTargetForDeleteRuleId}
      />
    </>
  );
};
