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
import {
  expenseSharesState,
  impactScoresState,
  rawImpactState,
  totalExpenseState,
  totalIncomeState,
} from "../../../store/impact";
import { ReadonlySignal, computed } from "@preact/signals-core";
import Badge from "react-bootstrap/esm/Badge";
import sortBy from "lodash/sortBy";
import Tippy, { useSingleton } from "@tippyjs/react";

enum RulesTab {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

type EnhancedRule = IApiRule & {
  impact: number;
  shareOfIncome: number;
} & (
    | { isIncome: true; isExpense: false }
    | { isIncome: false; isExpense: true; shareOfExpenses: number }
  );
const enhancedRules: ReadonlySignal<EnhancedRule[]> = computed(() => {
  const rules = rulesState.value;
  const sharesOfIncome = impactScoresState.value;
  const impacts = rawImpactState.value;
  const sharesOfExpenses = expenseSharesState.value;
  return rules.map((r) => {
    const impact = impacts.get(r.id) ?? 0;
    const shareOfIncome = sharesOfIncome.get(r.id) ?? 0;

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
      };
    }
    return {
      ...r,
      impact,
      shareOfIncome,
      isExpense: false,
      isIncome: true,
    };
  });
});

const expenseRatioState = computed(() => {
  if (totalIncomeState.value <= 0) return;
  return (100 * Math.abs(totalExpenseState.value)) / totalIncomeState.value;
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

  const [_tab, setTab] = useLocalStorage<RulesTab | undefined>(
    "rules-tab-selection-state",
    RulesTab.INCOME,
  );
  // defend against unrecognized tabs
  const tab = [RulesTab.EXPENSE, RulesTab.INCOME].includes(
    _tab ?? RulesTab.INCOME,
  )
    ? _tab
    : RulesTab.INCOME;

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

  const [source, target] = useSingleton();

  return (
    <>
      <Tippy singleton={source} />
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
              <Tippy content={<>Number of income sources</>} singleton={target}>
                <Badge className="bg-secondary">{incomeRules.length}</Badge>
              </Tippy>
            </>
          }
        />

        <Tab
          eventKey={RulesTab.EXPENSE}
          title={
            <>
              <span style={{ color: "var(--red)" }}>Expenses</span>{" "}
              <Tippy content={<>Number of expenses</>} singleton={target}>
                <Badge className="bg-secondary">{expenseRules.length}</Badge>
              </Tippy>{" "}
              <Tippy content={<ExpenseRatioSummary />} singleton={target}>
                <span>
                  <ExpenseRatioBadge />
                </span>
              </Tippy>
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
      <DisplayRules {...props} rules={activeRules} tippyTarget={target} />
    </>
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
  tippyTarget: ReturnType<typeof useSingleton>[1];
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
        {sortBy(props.rules, (r) => Math.abs(r.impact))
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

  tippyTarget: ReturnType<typeof useSingleton>[1];
}
const RuleDisplay = ({
  rule,

  selectedRuleId,
  setSelectedRuleId,

  targetForDeleteRuleId,
  setTargetForDeleteRuleId,

  tippyTarget,
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
                      style={{ color: "var(--yellow)" }}
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
          {Number.isFinite(rule.shareOfIncome) ? (
            <Tippy
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
              singleton={tippyTarget}
            >
              <Badge>
                <SensitivePercentage value={rule.shareOfIncome} />
              </Badge>
            </Tippy>
          ) : rule.isExpense ? (
            <Tippy
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
              singleton={tippyTarget}
            >
              <Badge>
                <SensitivePercentage value={rule.shareOfExpenses} />
              </Badge>
            </Tippy>
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
          <Tippy content={<>Edit</>} singleton={tippyTarget}>
            <FontAwesomeIcon
              style={{ cursor: "pointer" }}
              icon={faEdit}
              title="Edit"
              onClick={() => {
                setSelectedRuleId(rule.id);
              }}
            />
          </Tippy>
          <Tippy content={<>Duplicate</>} singleton={tippyTarget}>
            <FontAwesomeIcon
              style={{ marginLeft: 10, cursor: "pointer" }}
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
          </Tippy>
          <Tippy content={<>Delete</>} singleton={tippyTarget}>
            <FontAwesomeIcon
              style={{ marginLeft: 10, cursor: "pointer" }}
              icon={faTrashCan}
              title="Delete"
              onClick={() => {
                setTargetForDeleteRuleId(rule.id);
              }}
            />
          </Tippy>
        </div>
      </div>
    </ListGroupItem>
  );
};
