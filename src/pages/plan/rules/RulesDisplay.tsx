import ListGroup from "react-bootstrap/esm/ListGroup";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import {
  Currency,
  CurrencyColorless,
} from "../../../components/currency/Currency";
import {
  getRuleWarnings,
  getShortFrequencyDisplayString,
} from "./AddEditRule/extract-rule-details";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons/faEdit";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons/faTrashCan";
import { faCopy } from "@fortawesome/free-regular-svg-icons/faCopy";

import "./rule/Rule.css";
import { Info } from "../../../components/Info";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons/faCircleExclamation";
import {
  IApiRule,
  RuleType,
  createRule,
  isRecurringRule,
  rulesState,
  updateRule,
} from "../../../store/rules";
import { parametersState, startDateState } from "../../../store/parameters";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import FormControl from "react-bootstrap/esm/FormControl";
import fuzzysort from "fuzzysort";
import { NumericFormat } from "react-number-format";
import { useSignalValue } from "../../../store/useSignalValue";
import { selectedRuleIDState } from "../../../store/selectedRule";
import {
  expenseRatioState,
  expenseSharesState,
  impactScoresState,
  rawImpactState,
} from "../../../store/ratios";
import { ReadonlySignal, computed } from "@preact/signals-core";
import Badge from "react-bootstrap/esm/Badge";
import sortBy from "lodash/sortBy";
import { RulesTab, rulesTabSelectionState } from "./rulesTabSelectionState";
import { AppTooltip } from "../../../components/Tooltip";
import { lastPaymentDayResultByRuleIDState } from "../../../store/computationDates";
import { computeLastPaymentDay } from "../../../services/engine/computeLastPaymentDate";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { formatDistance } from "date-fns/formatDistance";

type EnhancedRule = IApiRule & {
  impact: number;
  shareOfIncome: number;
  lastPaymentDayResult: ReturnType<typeof computeLastPaymentDay>;
} & (
    | { isIncome: true; isExpense: false }
    | { isIncome: false; isExpense: true; shareOfExpenses: number }
  );
const enhancedRules: ReadonlySignal<EnhancedRule[]> = computed(() => {
  const rules = rulesState.value;
  const sharesOfIncome = impactScoresState.value;
  const impacts = rawImpactState.value;
  const sharesOfExpenses = expenseSharesState.value;
  const lastPaymentDayResultByRuleID = lastPaymentDayResultByRuleIDState.value;

  return rules.map((r) => {
    const impact = impacts.get(r.id) ?? 0;
    const shareOfIncome = sharesOfIncome.get(r.id) ?? 0;
    const lastPaymentDayResult = lastPaymentDayResultByRuleID.get(r.id);

    const isExpense = impact <= 0;
    if (isExpense) {
      const shareOfExpenses = sharesOfExpenses.get(r.id) ?? 0;
      return {
        ...r,
        impact,
        shareOfIncome,
        isExpense: true,
        isIncome: false,
        shareOfExpenses,
        lastPaymentDayResult,
      };
    }
    return {
      ...r,
      impact,
      shareOfIncome,
      isExpense: false,
      isIncome: true,
      lastPaymentDayResult,
    };
  });
});

function ExpenseRatioSummary() {
  const expenseRatio = useSignalValue(expenseRatioState);
  if (expenseRatio === undefined) return null;

  return (
    <>
      Expenses use{" "}
      <strong>
        <SensitivePercentage value={expenseRatio} />
      </strong>{" "}
      of income
    </>
  );
}

function ExpenseRatioBadge() {
  const expenseRatio = useSignalValue(expenseRatioState);
  if (expenseRatio === undefined) return null;

  return (
    <Badge className={expenseRatio > 100 ? "bg-danger" : "bg-primary"}>
      <SensitivePercentage value={expenseRatio} />
    </Badge>
  );
}

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

  const tab = useSignalValue(rulesTabSelectionState);
  const setTab = useCallback((tab: RulesTab) => {
    rulesTabSelectionState.value = tab;
  }, []);

  const incomeRules = useMemo(
    () => matchingRules.filter((r) => r.isIncome),
    [matchingRules],
  );
  const expenseRules = useMemo(
    () => matchingRules.filter((r) => r.isExpense),
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
      if (rule.isIncome) setTab(RulesTab.INCOME);
      if (rule.isExpense) setTab(RulesTab.EXPENSE);

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
      default:
        return [];
    }
  }, [expenseRules, incomeRules, tab]);

  return (
    <div id="rules-section">
      <Tabs
        id="rules-tab"
        className="d-flex justify-content-center"
        activeKey={tab || RulesTab.INCOME}
        onSelect={(key) => setTab((key as RulesTab) ?? undefined)}
      >
        <Tab
          eventKey={RulesTab.INCOME}
          title={
            <>
              <span style={{ color: "var(--green)" }}>Income</span>{" "}
              <AppTooltip content={<>Number of income sources</>}>
                <Badge className="bg-secondary">{incomeRules.length}</Badge>
              </AppTooltip>
            </>
          }
        />

        <Tab
          eventKey={RulesTab.EXPENSE}
          title={
            <>
              <span style={{ color: "var(--red)" }}>Expenses</span>{" "}
              <AppTooltip content={<>Number of expenses</>}>
                <Badge className="bg-secondary">{expenseRules.length}</Badge>
              </AppTooltip>{" "}
              <AppTooltip content={<ExpenseRatioSummary />}>
                <span>
                  <ExpenseRatioBadge />
                </span>
              </AppTooltip>
            </>
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
    </div>
  );
}

function SensitivePercentage({ value }: { value: number }) {
  const abs = Math.abs(value);
  let display = abs.toFixed(abs > 1 ? 0 : 1);
  if (display === "0.0") display = "< 0.1";
  return <span className="mask">{display}%</span>;
}

interface DisplayRulesProps extends RulesDisplayProps {
  rules: EnhancedRule[];
}
export function DisplayRules(props: DisplayRulesProps) {
  return (
    <div
      style={{
        overflowY: "scroll",
        height: "60vh",
        // TODO: make the entire left side scroll, with some stickiness; don't do scrolling here because 60vh is hacky
      }}
    >
      <ListGroup>
        {sortBy(props.rules, (r) => Math.abs(r.impact))
          .reverse()
          .map((rule, index) => {
            return (
              <RuleDisplay key={rule.id} rule={rule} index={index} {...props} />
            );
          })}
      </ListGroup>
    </div>
  );
}

interface RuleDisplayProps {
  rule: EnhancedRule;
  index: number;

  selectedRuleId: string | undefined;
  setSelectedRuleId: (id: string | undefined) => void;

  targetForDeleteRuleId: string | undefined;
  setTargetForDeleteRuleId: (id: string | undefined) => void;
}
const RuleDisplay = ({
  rule,
  index,

  selectedRuleId,
  setSelectedRuleId,

  targetForDeleteRuleId,
  setTargetForDeleteRuleId,
}: RuleDisplayProps) => {
  //
  // on click in table: show rule responsible for transaction
  //
  const startDate = useSignalValue(startDateState);

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
  const ruleValue = isRecurringRule(rule) ? rule.value : 0;
  const [_editedValue, setEditedValue] = useState(Math.abs(ruleValue)); // just the value
  const editedValue = (Math.abs(ruleValue) / ruleValue) * _editedValue;

  // when changes to this rule are made, update the quickedit `useState`s
  useEffect(() => {
    return rulesState.subscribe((rs) => {
      const thisRule = rs.find((r) => r.id === rule.id);
      if (!thisRule) return; // should never happen

      setEditedTitle(thisRule.name);
      if (isRecurringRule(thisRule)) setEditedValue(Math.abs(thisRule.value));
    });
  }, [rule.id]);

  return (
    <ListGroupItem
      key={rule.id}
      active={isSelected}
      ref={ref}
      data-index={`${index}`}
    >
      <div
        className="btn-toolbar justify-content-between"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group mr-2" role="group" aria-label="First group">
          <div className="rulename">
            <AppTooltip content={<>(double-click to edit name)</>}>
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
                  <>
                    {rule.name}
                    {rule.lastPaymentDayResult === undefined ? null : (
                      <AppTooltip
                        content={
                          <>
                            Last payment is{" "}
                            <DateDisplay
                              date={
                                rule.lastPaymentDayResult.result === "complete"
                                  ? rule.lastPaymentDayResult.day
                                  : rule.lastPaymentDayResult.searchedUpToDate
                              }
                            />
                            ,<br />
                            which is in{" "}
                            {formatDistance(
                              rule.lastPaymentDayResult.result === "complete"
                                ? rule.lastPaymentDayResult.day
                                : rule.lastPaymentDayResult.searchedUpToDate,
                              startDate,
                            )}
                          </>
                        }
                      >
                        <span style={{ paddingLeft: 8 }}>
                          {rule.type === RuleType.SAVINGS_GOAL && (
                            <Badge className="bg-secondary">Goal</Badge>
                          )}
                          {rule.type === RuleType.LOAN && (
                            <Badge className="bg-secondary">Loan</Badge>
                          )}
                        </span>
                      </AppTooltip>
                    )}
                  </>
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
                        style={{ color: "var(--yellow)" }}
                        icon={faCircleExclamation}
                      />
                    </Info>
                  </>
                ) : null}
              </h5>
            </AppTooltip>
          </div>
        </div>

        <div
          className="btn-group mr-2 mb-1"
          role="group"
          aria-label="Second group"
        >
          {Number.isFinite(rule.shareOfIncome) ? (
            <AppTooltip
              content={
                rule.isIncome ? (
                  <>
                    Total:{" "}
                    <strong>
                      <CurrencyColorless value={rule.impact} />
                    </strong>
                    <br />
                    <strong>
                      <SensitivePercentage value={rule.shareOfIncome} />
                    </strong>{" "}
                    of income
                  </>
                ) : (
                  <>
                    Total:{" "}
                    <strong>
                      <CurrencyColorless value={-rule.impact} />
                    </strong>
                    <br />
                    <strong>
                      <SensitivePercentage value={rule.shareOfIncome} />
                    </strong>{" "}
                    of total income
                    <br />(
                    <strong>
                      <SensitivePercentage value={rule.shareOfExpenses} />
                    </strong>{" "}
                    of spending)
                  </>
                )
              }
            >
              <Badge>
                <SensitivePercentage value={rule.shareOfIncome} />
              </Badge>
            </AppTooltip>
          ) : rule.isExpense ? (
            <AppTooltip
              content={
                <>
                  Total:{" "}
                  <strong>
                    <CurrencyColorless value={-rule.impact} />
                  </strong>
                  <br />
                  <strong>
                    <SensitivePercentage value={rule.shareOfExpenses} />
                  </strong>{" "}
                  of spending
                </>
              }
            >
              <Badge>
                <SensitivePercentage value={rule.shareOfExpenses} />
              </Badge>
            </AppTooltip>
          ) : null}
        </div>
      </div>

      <div
        className="btn-toolbar justify-content-between"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group mr-2" role="group" aria-label="First group">
          <div>
            {isRecurringRule(rule) ? (
              isEditingValue ? (
                <>
                  <NumericFormat
                    style={{
                      textAlign: "right",
                      width: 100,
                      color: rule.value > 0 ? "var(--green)" : "var(--red)",
                    }}
                    className="mask"
                    value={_editedValue}
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
                    decimalScale={2}
                    fixedDecimalScale
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    maxLength={15}
                  />{" "}
                </>
              ) : (
                <AppTooltip content={<>(double-click to edit value)</>}>
                  <span
                    onClick={(e) => {
                      if (e.detail === 2) {
                        setIsEditingValue(true);
                      }
                    }}
                  >
                    <Currency value={rule.value} />{" "}
                  </span>
                </AppTooltip>
              )
            ) : null}
            <span className="m-0">{frequencyDisplay}</span>
          </div>
        </div>

        <div
          className="btn-group mr-2"
          role="group"
          aria-label="Second group"
          data-testid="buttons"
        >
          <AppTooltip content={<>Edit</>}>
            <FontAwesomeIcon
              style={{ cursor: "pointer" }}
              icon={faEdit}
              title="Edit"
              data-buttonid="edit"
              onClick={() => {
                setSelectedRuleId(rule.id);
              }}
            />
          </AppTooltip>
          <AppTooltip content={<>Duplicate</>}>
            <FontAwesomeIcon
              style={{ marginLeft: 10, cursor: "pointer" }}
              icon={faCopy}
              title="Duplicate"
              data-buttonid="duplicate"
              onClick={() => {
                const newRule = {
                  ...rule,
                  id: undefined,
                  name: rule.name + " copy",
                };
                void createRule(newRule);
              }}
            />
          </AppTooltip>
          <AppTooltip content={<>Delete</>}>
            <FontAwesomeIcon
              style={{ marginLeft: 10, cursor: "pointer" }}
              icon={faTrashCan}
              title="Delete"
              data-buttonid="delete"
              onClick={() => {
                setTargetForDeleteRuleId(rule.id);
              }}
            />
          </AppTooltip>
        </div>
      </div>
    </ListGroupItem>
  );
};
