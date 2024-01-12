import { useCallback, useState } from "react";
import sortBy from "lodash/sortBy";
import Container from "react-bootstrap/Container";
import { AddEditRule } from "./AddEditRule";
import { IApiRule, IApiRuleMutate } from "../../../services/RulesService";
import { IFlags } from "../../../services/FlagService";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { Currency } from "../../../components/currency/Currency";
import { getPreviewDetails } from "./AddEditRule/RulePreview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashCan,
  faCopy,
} from "@fortawesome/free-regular-svg-icons";
import "./rule/Rule.css";

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
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
        <Container data-testid="no-rules-found" className="text-center" />
      </>
    );
  }

  const selectedRule = rules.find((r) => r.id === selectedRuleId);

  const sortedRules = sortBy(rules, (r: IApiRule) => [r.value, r.name]);

  return (
    <>
      <AddEditRule
        highLowEnabled={highLowEnabled}
        onCreate={onCreate}
        onUpdate={onUpdate}
        rule={selectedRule}
        key={selectedRuleId}
      />

      <div
        style={{
          overflowY: "auto",
          height: "50vh",
        }}
      >
        <ListGroup>
          {sortedRules.map((rule) => {
            const rruleString = getRRuleDisplayString(rule.rrule);
            return (
              <ListGroupItem key={rule.id} active={rule.id === selectedRuleId}>
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
                        // TODO: show a confirmation modal first
                        void deleteRule(rule.id);
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
