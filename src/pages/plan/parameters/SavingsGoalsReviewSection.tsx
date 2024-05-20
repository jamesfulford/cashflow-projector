import { computed } from "@preact/signals-core";
import Table from "react-bootstrap/esm/Table";
import { RuleType, rulesState } from "../../../store/rules";
import { useSignalValue } from "../../../store/useSignalValue";
import {
  Currency,
  CurrencyColorless,
} from "../../../components/currency/Currency";
import {
  reconciliationTransactionsState,
  todayState,
} from "../../../store/reconcile";
import sortBy from "lodash/sortBy";
import { lastPaymentDayResultByRuleIDState } from "../../../store/computationDates";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { AppTooltip } from "../../../components/Tooltip";
import ProgressBar from "react-bootstrap/esm/ProgressBar";

const savingsGoalsState = computed(() => {
  return rulesState.value.filter((r) => r.type === RuleType.SAVINGS_GOAL);
});

const savingsGoalsDiffByRuleIDState = computed(() => {
  const savingsGoalsDiffByRuleID = new Map<string, number>(
    savingsGoalsState.value.map((r) => [r.id, 0]),
  );
  reconciliationTransactionsState.value
    .filter((t) => savingsGoalsDiffByRuleID.has(t.rule_id))
    .forEach((t) => {
      savingsGoalsDiffByRuleID.set(
        t.rule_id,
        (savingsGoalsDiffByRuleID.get(t.rule_id) as number) + -t.value,
      );
    });

  return savingsGoalsDiffByRuleID;
});

const savingsGoalsWithDiffState = computed(() => {
  const savingsGoalsDiffByRuleID = savingsGoalsDiffByRuleIDState.value;
  const lastPaymentDayResultByRuleID = lastPaymentDayResultByRuleIDState.value;

  return sortBy(
    savingsGoalsState.value.map((r) => {
      return [
        r,
        savingsGoalsDiffByRuleID.get(r.id) as number,
        lastPaymentDayResultByRuleID.get(r.id),
      ] as const;
    }),
    ["[1]"],
  );
});

const totalSavingsDiffState = computed(() => {
  return Array.from(savingsGoalsDiffByRuleIDState.value.values()).reduce(
    (a, x) => a + x,
    0,
  );
});

export function SavingsGoalsReviewSection() {
  const savingsGoalsWithDiffs = useSignalValue(savingsGoalsWithDiffState);
  const totalSavingsDiff = useSignalValue(totalSavingsDiffState);

  return (
    <>
      <h5>Savings Goals</h5>
      <p>Here's the progress you made toward your savings goals:</p>
      <Table bordered>
        <thead>
          <tr>
            <th>Goal</th>
            <th>Progress</th>
            <th>Status</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {savingsGoalsWithDiffs.map(([r, diff, lastPaymentDayResult]) => {
            if (r.type !== RuleType.SAVINGS_GOAL) return null; // should never happen
            return (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>
                  <AppTooltip
                    content={
                      <>
                        was <CurrencyColorless value={r.progress} /> out of{" "}
                        <CurrencyColorless value={r.goal} /> (
                        {((100 * r.progress) / r.goal).toFixed(0)}%)
                      </>
                    }
                  >
                    <span>
                      <Currency value={diff} />
                    </span>
                  </AppTooltip>
                </td>
                <td>
                  <AppTooltip
                    content={
                      <>
                        is now <CurrencyColorless value={r.progress + diff} />{" "}
                        out of <CurrencyColorless value={r.goal} /> (
                        {((100 * (r.progress + diff)) / r.goal).toFixed(0)}%)
                      </>
                    }
                  >
                    <ProgressBar>
                      <ProgressBar
                        key={0}
                        min={0}
                        max={r.goal}
                        now={r.progress}
                        variant="primary"
                      />
                      <ProgressBar
                        key={1}
                        min={0}
                        max={r.goal}
                        now={diff}
                        animated
                        variant="success"
                      />
                    </ProgressBar>
                  </AppTooltip>
                </td>
                <td>
                  {!lastPaymentDayResult ? (
                    <>
                      <em>error occurred</em>
                    </>
                  ) : lastPaymentDayResult.result === "complete" ? (
                    <>
                      {lastPaymentDayResult.day <= todayState.peek() ? (
                        <>Done! 🎉</>
                      ) : (
                        <DateDisplay date={lastPaymentDayResult.day} />
                      )}
                    </>
                  ) : (
                    <>
                      after{" "}
                      <DateDisplay
                        date={lastPaymentDayResult.searchedUpToDate}
                      />
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <p style={{ color: "var(--gray-text)" }}>
        Make sure to exclude this <CurrencyColorless value={totalSavingsDiff} />{" "}
        amount from your current balance. Consider transferring it to savings.
      </p>
    </>
  );
}
