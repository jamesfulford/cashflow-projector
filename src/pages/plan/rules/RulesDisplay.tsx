import ListGroup from "react-bootstrap/esm/ListGroup";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
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
import {
  IApiRule,
  createRule,
  rulesState,
  updateRule,
} from "../../../store/rules";
import { parametersState } from "../../../store/parameters";
import { useMemo, useState } from "react";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import FormControl from "react-bootstrap/esm/FormControl";
import fuzzysort from "fuzzysort";
import useLocalStorage from "use-local-storage";
import { NumericFormat } from "react-number-format";
import { useSignalValue } from "../../../store/useSignalValue";

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
  selectedRuleId: string | undefined;
  setSelectedRuleId: (id: string | undefined) => void;

  targetForDeleteRuleId: string | undefined;
  setTargetForDeleteRuleId: (id: string | undefined) => void;
}
export function RulesDisplay(props: RulesDisplayProps) {
  const rules = useSignalValue(rulesState);
  const [searchText, setSearchText] = useState("");

  const matchingRules = useMemo(() => {
    if (!searchText) return rules;
    const results = fuzzysort.go(searchText, rules, {
      key: "name",
      threshold: -10000, // not sure how to set this well
      limit: 5,
    });
    return results.map((r) => r.obj);
  }, [searchText, rules]);

  enum RulesTab {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE",
  }
  const [tab, setTab] = useLocalStorage<RulesTab | undefined>(
    "rules-tab-selection-state",
    RulesTab.INCOME,
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
      <Tabs
        id="rules-tab"
        className="d-flex justify-content-center"
        activeKey={tab || RulesTab.INCOME}
        onSelect={(key) => setTab((key as RulesTab) ?? undefined)}
      >
        <Tab
          eventKey={RulesTab.INCOME}
          title={
            <span style={{ color: "var(--primary)" }}>
              Income ({incomeRules.length})
            </span>
          }
        />
        <Tab
          eventKey={RulesTab.EXPENSE}
          title={
            <span style={{ color: "var(--red)" }}>
              Expenses ({expenseRules.length})
            </span>
          }
        />
      </Tabs>
      <FormControl
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-2 mt-2"
        placeholder="Search..."
      />
      <DisplayRules
        {...props}
        rules={tab === RulesTab.EXPENSE ? expenseRules : incomeRules}
      />
    </>
  );
}

interface DisplayRulesProps extends RulesDisplayProps {
  rules: IApiRule[];
}
export function DisplayRules(props: DisplayRulesProps) {
  return (
    <div
      style={{
        overflowY: "auto",
        height: "50vh",
      }}
    >
      <ListGroup>
        {props.rules.map((rule) => {
          return <RuleDisplay key={rule.id} rule={rule} {...props} />;
        })}
      </ListGroup>
    </div>
  );
}

interface RuleDisplayProps {
  rule: IApiRule;

  selectedRuleId: string | undefined;
  setSelectedRuleId: (id: string | undefined) => void;

  targetForDeleteRuleId: string | undefined;
  setTargetForDeleteRuleId: (id: string | undefined) => void;
}
const RuleDisplay = ({
  rule,

  selectedRuleId,
  setSelectedRuleId,

  targetForDeleteRuleId,
  setTargetForDeleteRuleId,
}: RuleDisplayProps) => {
  const rruleString = getRRuleDisplayString(rule.rrule);
  const isSelected = [selectedRuleId, targetForDeleteRuleId].includes(rule.id);
  const parameters = useSignalValue(parametersState);
  const { warnings, errors } = getRuleWarnings(rule, parameters);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(rule.name);

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editedValue, setEditedValue] = useState(rule.value);

  return (
    <ListGroupItem key={rule.id} active={isSelected}>
      <div
        className="btn-toolbar justify-content-between"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group mr-2" role="group" aria-label="First group">
          <div className="rulename">
            <h5
              className="m-0"
              title={rule.name}
              onClick={(e) => {
                if (e.detail === 2) {
                  setIsEditingTitle(true);
                }
              }}
            >
              {isEditingTitle ? (
                <>
                  <FormControl
                    autoFocus
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      switch (e.key) {
                        case "Enter":
                          updateRule({
                            ...rule,
                            name: editedTitle,
                          });
                          setIsEditingTitle(false);
                          break;
                        case "Escape":
                          setIsEditingTitle(false);
                          setEditedTitle(rule.name); // reset
                          break;

                        default:
                          break;
                      }
                    }}
                    onBlur={() => {
                      updateRule({
                        ...rule,
                        name: editedTitle,
                      });
                      setIsEditingTitle(false);
                    }}
                  />
                </>
              ) : (
                <>{rule.name}</>
              )}
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
          onClick={(e) => {
            if (e.detail === 2) {
              setIsEditingValue(true);
            }
          }}
        >
          {isEditingValue ? (
            <>
              <NumericFormat
                style={{
                  textAlign: "right",
                  width: 100,
                }}
                className="mask"
                value={editedValue}
                onValueChange={(values) => {
                  if (values.floatValue !== undefined) {
                    setEditedValue(values.floatValue);
                  }
                }}
                valueIsNumericString
                onBlur={() => {
                  updateRule({ ...rule, value: editedValue });
                  setIsEditingValue(false);
                }}
                onKeyDown={(e) => {
                  switch (e.key) {
                    case "Enter":
                      updateRule({ ...rule, value: editedValue });
                      setIsEditingValue(false);
                      break;
                    case "Escape":
                      setIsEditingValue(false);
                      setEditedValue(rule.value); // reset
                      break;

                    default:
                      break;
                  }
                }}
                autoFocus
                allowNegative
                decimalScale={2}
                fixedDecimalScale
                thousandsGroupStyle="thousand"
                thousandSeparator=","
                maxLength={15}
              />
            </>
          ) : (
            <Currency value={rule.value} />
          )}
        </div>
      </div>

      <div
        className="btn-toolbar justify-content-between"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group mr-2" role="group" aria-label="First group">
          <div>
            <span className="m-0">{rruleString}</span>
          </div>
        </div>

        <div className="btn-group mr-2" role="group" aria-label="Second group">
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
};
