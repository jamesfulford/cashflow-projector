import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import FormControl from "react-bootstrap/esm/FormControl";
import fuzzysort from "fuzzysort";
import { useSignalValue } from "../../../store/useSignalValue";
import { selectedRuleIDState } from "../../../store/selectedRule";
import {
  baseExpenseRatioState,
  expenseRatioState,
  goalRatioState,
  loanRatioState,
} from "../../../store/ratios";
import Badge from "react-bootstrap/esm/Badge";
import { RulesTab, rulesTabSelectionState } from "./rulesTabSelectionState";
import { AppTooltip } from "../../../components/Tooltip";
import { enhancedRulesState } from "./enhancedRules";
import { DisplayRules } from "./DisplayRules";
import { LoanIcon } from "../../../components/LoanIcon";
import { SavingsGoalIcon } from "../../../components/SavingsGoalIcon";

function ExpenseRatioSummary() {
  const expenseRatio = useSignalValue(expenseRatioState);
  const loanRatio = useSignalValue(loanRatioState) ?? 0;
  const goalRatio = useSignalValue(goalRatioState) ?? 0;
  const baseExpenseRatio = useSignalValue(baseExpenseRatioState) ?? 0;
  if (expenseRatio === undefined) return null;

  const breakdown = [
    [baseExpenseRatio, <>base expenses</>],
    [
      loanRatio,
      <>
        <LoanIcon /> loan payments
      </>,
    ],
    [
      goalRatio,
      <>
        <SavingsGoalIcon /> goal contributions
      </>,
    ],
    [expenseRatio - (baseExpenseRatio + loanRatio + goalRatio), <>other</>],
  ].filter((ratio_0) => ratio_0[0]) as [number, ReactNode][];

  return (
    <>
      Expenses use{" "}
      <strong>
        <SensitivePercentage value={expenseRatio} />
      </strong>{" "}
      of income
      {breakdown.map(([ratio, description]) => {
        return (
          <>
            <br />
            <span style={{ marginLeft: 8 }}>
              <strong>
                <SensitivePercentage value={ratio} />
              </strong>{" "}
              {description}
            </span>
          </>
        );
      })}
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

export interface RulesDisplayProps {
  selectedRuleId: string | undefined;
  setSelectedRuleId: (id: string | undefined) => void;

  targetForDeleteRuleId: string | undefined;
  setTargetForDeleteRuleId: (id: string | undefined) => void;
}
export function RulesDisplay(props: RulesDisplayProps) {
  const rules = useSignalValue(enhancedRulesState);
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

export function SensitivePercentage({ value }: { value: number }) {
  const abs = Math.abs(value);
  let display = abs.toFixed(abs > 1 ? 0 : 1);
  if (display === "0.0") display = "< 0.1";
  if (abs === 0) display = "0";
  return <span className="mask">{display}%</span>;
}
