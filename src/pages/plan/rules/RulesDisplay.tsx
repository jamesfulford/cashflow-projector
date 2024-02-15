import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";
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
import { Info } from "../../../components/Info";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { IApiRule } from "../../../services/RulesService";
import { IParameters } from "../../../services/ParameterService";
import { IRuleActions } from "../PlanProvider";
import { useMemo, useState } from "react";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import FormControl from "react-bootstrap/FormControl";
import fuzzysort from "fuzzysort";
import useLocalStorage from "use-local-storage";

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

interface RulesDisplayProps {
  rules: IApiRule[];
  ruleActions: IRuleActions;

  selectedRuleId: string | undefined;
  setSelectedRuleId: (id: string | undefined) => void;

  targetForDeleteRuleId: string | undefined;
  setTargetForDeleteRuleId: (id: string | undefined) => void;

  parameters: IParameters;
}
export function RulesDisplay(props: RulesDisplayProps) {
  const [searchText, setSearchText] = useState("");

  const matchingRules = useMemo(() => {
    if (!searchText) return props.rules;
    const results = fuzzysort.go(searchText, props.rules, {
      key: "name",
      threshold: -10000, // not sure how to set this well
      limit: 5,
    });
    return results.map((r) => r.obj);
  }, [searchText, props.rules]);

  enum Tab {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE",
  }
  const [tab, setTab] = useLocalStorage<Tab | undefined>(
    "rules-tab-selection-state",
    Tab.INCOME,
  );

  const incomeRules = useMemo(
    () => matchingRules.filter((r) => r.value > 0),
    [matchingRules],
  );
  const expenseRules = useMemo(
    () => matchingRules.filter((r) => r.value <= 0),
    [matchingRules],
  );

  return (
    <>
      <FormControl
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-2"
        placeholder="Search..."
      />
      <Tabs
        id="rules-tab"
        className="d-flex justify-content-center"
        activeKey={tab || Tab.INCOME}
        onSelect={(key) => setTab((key as Tab) ?? undefined)}
      >
        <Tab
          eventKey="Income"
          title={
            <span style={{ color: "var(--primary)" }}>
              Income ({incomeRules.length})
            </span>
          }
        >
          <DisplayRules {...props} rules={incomeRules} />
        </Tab>
        <Tab
          eventKey="Expenses"
          title={
            <span style={{ color: "var(--red)" }}>
              Expenses ({expenseRules.length})
            </span>
          }
        >
          <DisplayRules {...props} rules={expenseRules} />
        </Tab>
      </Tabs>
    </>
  );
}

export function DisplayRules({
  rules,
  ruleActions,

  selectedRuleId,
  setSelectedRuleId,

  targetForDeleteRuleId,
  setTargetForDeleteRuleId,

  parameters,
}: RulesDisplayProps) {
  return (
    <div
      style={{
        overflowY: "auto",
        height: "50vh",
      }}
    >
      <ListGroup>
        {rules.map((rule) => {
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
                                {errors.map((e) => {
                                  return (
                                    <>
                                      <br />- {e.message}
                                    </>
                                  );
                                })}
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
                                {warnings.map((w) => {
                                  return (
                                    <>
                                      <br />- {w.message}
                                    </>
                                  );
                                })}
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
                      void ruleActions.createRule(newRule);
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
  );
}
