import { useCallback, useState } from "react";
import sortBy from "lodash/sortBy";
import Container from "react-bootstrap/Container";
import { AddEditRule } from "./AddEditRule";
import { IApiRule, IApiRuleMutate } from "../../../services/RulesService";
import { IFlags } from "../../../services/FlagService";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import Modal from "react-bootstrap/Modal";
import { Currency } from "../../../components/currency/Currency";
import {
  getPreviewDetails,
  getRuleWarnings,
} from "./AddEditRule/extract-rule-details";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashCan,
  faCopy,
} from "@fortawesome/free-regular-svg-icons";
import "./rule/Rule.css";
import Button from "react-bootstrap/esm/Button";
import { IParameters } from "../../../services/ParameterService";
import { Info } from "../../../components/Info";
import {
  faCircleExclamation,
  faExclamation,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";

function getRRuleDisplayString(rruleString: string): string {
  try {
    const { message } = getPreviewDetails(rruleString);
    if (!message) {
      throw new Error(message);
    }
    return message;
  } catch (e) {
    return "(Oops, looks like an invalid recurrence rule)";
  }
}

export const RulesContainer = ({
  rules,
  flags: { highLowEnabled },
  parameters,
  createRule,
  deleteRule,
  updateRule,
}: {
  rules: IApiRule[];
  flags: IFlags;
  parameters: IParameters;
  createRule: (rule: IApiRuleMutate) => Promise<IApiRule>;
  deleteRule: (ruleid: string) => Promise<void>;
  updateRule: (rule: IApiRuleMutate & { id: string }) => Promise<IApiRule>;
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();
  const [targetForDeleteRuleId, setTargetForDeleteRuleId] = useState<
    string | undefined
  >();

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

  const onCreate = useCallback(
    async (rule: IApiRuleMutate) => {
      await createRule(rule);
    },
    [createRule],
  );

  const onClose = useCallback(() => {
    setSelectedRuleId(undefined);
  }, []);

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

  const sortedRules = sortBy(rules, (r: IApiRule) => [r.value, r.name]);

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

      <div
        style={{
          overflowY: "auto",
          height: "50vh",
        }}
      >
        <ListGroup>
          {sortedRules.map((rule) => {
            const rruleString = getRRuleDisplayString(rule.rrule);
            const isSelected = [selectedRuleId, targetForDeleteRuleId].includes(
              rule.id,
            );
            const { warnings, errors } = getRuleWarnings(rule, parameters);

            return (
              <ListGroupItem key={rule.id} active={isSelected}>
                <div
                  className="btn-toolbar justify-content-between"
                  role="toolbar"
                  aria-label="Toolbar with button groups"
                >
                  <div
                    className="btn-group mr-2"
                    role="group"
                    aria-label="First group"
                  >
                    <div className="rulename">
                      <h5 className="m-0" title={rule.name}>
                        {rule.name}
                        {errors.length ? (
                          <>
                            {" "}
                            <Info
                              infobody={
                                <>
                                  {errors.length}&nbsp;error
                                  {errors.length > 1 ? "s" : null}&nbsp;found.
                                </>
                              }
                            >
                              <FontAwesomeIcon
                                style={{ color: "var(--red)" }}
                                icon={faCircleExclamation}
                              />
                            </Info>
                          </>
                        ) : null}
                        {warnings.length ? (
                          <>
                            {" "}
                            <Info
                              infobody={
                                <>
                                  {warnings.length}&nbsp;warning
                                  {warnings.length > 1 ? "s" : null}&nbsp;found.
                                </>
                              }
                            >
                              <FontAwesomeIcon
                                style={{ color: "orange" }}
                                icon={faCircleExclamation}
                              />
                            </Info>
                          </>
                        ) : null}
                      </h5>
                    </div>
                  </div>

                  <div
                    className="btn-group mr-2"
                    role="group"
                    aria-label="Second group"
                  >
                    <Currency value={rule.value} />
                  </div>
                </div>

                <div
                  className="btn-toolbar justify-content-between"
                  role="toolbar"
                  aria-label="Toolbar with button groups"
                >
                  <div
                    className="btn-group mr-2"
                    role="group"
                    aria-label="First group"
                  >
                    <div>
                      <span className="m-0">{rruleString}</span>
                    </div>
                  </div>

                  <div
                    className="btn-group mr-2"
                    role="group"
                    aria-label="Second group"
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      onClick={() => {
                        setSelectedRuleId(rule.id);
                      }}
                    />
                    <FontAwesomeIcon
                      style={{ marginLeft: 10 }}
                      icon={faCopy}
                      title="Duplicate"
                      onClick={() => {
                        const newRule = {
                          ...rule,
                          id: undefined,
                          name: rule.name + " copy",
                        };
                        void createRule(newRule);
                      }}
                    />
                    <FontAwesomeIcon
                      style={{ marginLeft: 10, color: "var(--red)" }}
                      icon={faTrashCan}
                      title="Delete"
                      onClick={() => {
                        setTargetForDeleteRuleId(rule.id);
                      }}
                    />
                  </div>
                </div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </div>
    </>
  );
};
