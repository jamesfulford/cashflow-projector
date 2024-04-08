import ListGroup from "react-bootstrap/esm/ListGroup";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import { Currency } from "../../../components/currency/Currency";
import {
  getRuleWarnings,
  getShortFrequencyDisplayString,
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
import { useEffect, useMemo, useRef, useState } from "react";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import FormControl from "react-bootstrap/esm/FormControl";
import fuzzysort from "fuzzysort";
import useLocalStorage from "use-local-storage";
import { NumericFormat } from "react-number-format";
import { useSignalValue } from "../../../store/useSignalValue";
import { selectedRuleIDState } from "../../../store/selectedRule";
import { impactScoresState, rawImpactState } from "../../../store/impact";
import { ReadonlySignal, computed } from "@preact/signals-core";
import Badge from "react-bootstrap/esm/Badge";
import sortBy from "lodash/sortBy";
import { formatCurrency } from "../../../components/currency/formatCurrency";

function isRecurringRule(rule: IApiRule) {
  return Boolean(rule.rrule);
}
function isIncomeRule(rule: IApiRule) {
  return isRecurringRule(rule) && rule.value > 0;
}
function isExpenseRule(rule: IApiRule) {
  return isRecurringRule(rule) && rule.value <= 0;
}
function isListRule(rule: IApiRule) {
  return !isRecurringRule(rule);
}

enum RulesTab {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  LIST = "LIST",
}

interface EnhancedRule extends IApiRule {
  rawImpact: number;
  impactScore: number;
}
const enhancedRules: ReadonlySignal<EnhancedRule[]> = computed(() => {
  const rules = rulesState.value;
  const impactScores = impactScoresState.value;
  const rawImpact = rawImpactState.value;
  return rules.map((r) => ({
    ...r,
    rawImpact: rawImpact.get(r.id) as number,
    impactScore: impactScores.get(r.id) as number,
  }));
});

interface RulesDisplayProps {
  selectedRuleId: string | undefined;
  setSelectedRuleId: (id: string | undefined) => void;

  targetForDeleteRuleId: string | undefined;
  setTargetForDeleteRuleId: (id: string | undefined) => void;
}
export function RulesDisplay(props: RulesDisplayProps) {
  const rules = useSignalValue(enhancedRules);
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

  const [tab, setTab] = useLocalStorage<RulesTab | undefined>(
    "rules-tab-selection-state",
    RulesTab.INCOME,
  );

  const incomeRules = useMemo(
    () => matchingRules.filter(isIncomeRule),
    [matchingRules],
  );
  const expenseRules = useMemo(
    () => matchingRules.filter(isExpenseRule),
    [matchingRules],
  );
  const listRules = useMemo(
    () => matchingRules.filter(isListRule),
    [matchingRules],
  );

  useEffect(() => {
    let isFirst = true;
    return selectedRuleIDState.subscribe((id) => {
      if (isFirst) {
        isFirst = false;
        return;
      }
      if (!id) return;
      const rule = rules.find((r) => r.id === id);
      if (!rule) return;

      // switch to tab of rule
      if (isIncomeRule(rule)) setTab(RulesTab.INCOME);
      if (isExpenseRule(rule)) setTab(RulesTab.EXPENSE);
      if (isListRule(rule)) setTab(RulesTab.LIST);

      // if rule is not showing, clear the search field so it will show
      if (!matchingRules.find((r) => r.id === id)) {
        setSearchText("");
      }
    });
  }, [matchingRules, rules, setTab]);

  const activeRules = useMemo(() => {
    switch (tab) {
      case RulesTab.INCOME:
        return incomeRules;
      case RulesTab.EXPENSE:
        return expenseRules;
      case RulesTab.LIST:
        return listRules;
      default:
        return [];
    }
  }, [expenseRules, incomeRules, listRules, tab]);

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
        <Tab
          eventKey={RulesTab.LIST}
          title={
            <span style={{ color: "var(--tertiary)" }}>
              Lists ({listRules.length})
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
      <DisplayRules {...props} rules={activeRules} />
    </>
  );
}

interface DisplayRulesProps extends RulesDisplayProps {
  rules: EnhancedRule[];
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
        {sortBy(props.rules, ["impactScore"])
          .reverse()
          .map((rule) => {
            return <RuleDisplay key={rule.id} rule={rule} {...props} />;
          })}
      </ListGroup>
    </div>
  );
}

interface RuleDisplayProps {
  rule: EnhancedRule;

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
  //
  // on click in table: show rule responsible for transaction
  //

  const [isClickReferenced, setIsClickReferenced] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    return selectedRuleIDState.subscribe((id) => {
      if (!id) return;
      if (id !== rule.id) return;
      ref.current?.scrollIntoView();
      setIsClickReferenced(true);
    });
  }, [rule.id]);
  useEffect(() => {
    if (isClickReferenced) {
      const timeoutID = setTimeout(() => setIsClickReferenced(false), 2000);
      return () => clearTimeout(timeoutID);
    }
  }, [isClickReferenced]);

  const frequencyDisplay = useMemo(
    () => getShortFrequencyDisplayString(rule),
    [rule],
  );
  const isSelected =
    [selectedRuleId, targetForDeleteRuleId].includes(rule.id) ||
    isClickReferenced;
  const parameters = useSignalValue(parametersState);
  const { warnings, errors } = getRuleWarnings(rule, parameters);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(rule.name);

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editedValue, setEditedValue] = useState(rule.value);

  return (
    <ListGroupItem key={rule.id} active={isSelected} ref={ref}>
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
          className="btn-group mr-2 mb-1"
          role="group"
          aria-label="Second group"
        >
          <Badge
            className="mask"
            title={`A total impact of ${formatCurrency(rule.rawImpact)} in the selected timeframe earns this ${rule.rrule ? (rule.value > 0 ? "income" : "expense") : "list"} a score of ${rule.impactScore.toFixed(rule.impactScore > 1 ? 0 : 1)}/100.`}
          >
            {rule.impactScore.toFixed(rule.impactScore > 1 ? 0 : 1)}
          </Badge>
        </div>
      </div>

      <div
        className="btn-toolbar justify-content-between"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group mr-2" role="group" aria-label="First group">
          <div>
            {rule.rrule ? (
              isEditingValue ? (
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
                  />{" "}
                </>
              ) : (
                <>
                  <span
                    onClick={(e) => {
                      if (e.detail === 2) {
                        setIsEditingValue(true);
                      }
                    }}
                  >
                    <Currency value={rule.value} />
                  </span>{" "}
                </>
              )
            ) : null}
            <span className="m-0">{frequencyDisplay}</span>
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
