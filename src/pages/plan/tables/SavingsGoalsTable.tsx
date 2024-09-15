import { useEffect, useState } from "react";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { AppTooltip } from "../../../components/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  totalProgressState,
  totalGoalState,
  goalWithLatestFinalPaymentDayResultState,
} from "../../../store/goals";
import { enhancedSavingsGoalsState, updateRule } from "../../../store/rules";
import { useSignalValue } from "../../../store/useSignalValue";
import Table from "react-bootstrap/esm/Table";
import { CurrencyColorless } from "../../../components/currency/Currency";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
import { todayState } from "../../../store/reconcile";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { Info } from "../../../components/Info";
import { faPencil } from "@fortawesome/free-solid-svg-icons/faPencil";
import { LastPaymentDayResult } from "../../../services/engine/computeLastPaymentDate";
import sortBy from "lodash/sortBy";
import { selectedRuleIDState } from "../../../store/selectedRule";

function Progress({ goal, progress }: { goal: number; progress: number }) {
  return (
    <AppTooltip
      content={
        <>
          <CurrencyColorless value={progress} /> out of{" "}
          <CurrencyColorless value={goal} />{" "}
          <span className="mask">
            ({((100 * progress) / goal).toFixed(0)}%)
          </span>
        </>
      }
    >
      <ProgressBar
        key={0}
        min={0}
        max={goal}
        now={progress}
        variant={progress >= goal ? "success" : "primary"}
      />
    </AppTooltip>
  );
}
function EditableValue({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (newValue: number) => void;
  max?: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);
  useEffect(() => {
    setNewValue(value);
  }, [value]);

  if (!isEditing) {
    return (
      <>
        <CurrencyColorless value={value} />{" "}
        <AppTooltip content={<>Edit</>}>
          <span>
            <FontAwesomeIcon
              icon={faPencil}
              style={{ cursor: "pointer" }}
              onClick={() => setIsEditing(true)}
            />
          </span>
        </AppTooltip>
      </>
    );
  }

  return (
    <CurrencyInput
      label={"Goal balance"}
      value={newValue}
      onValueChange={setNewValue}
      onBlur={() => {
        onChange(newValue);
        setIsEditing(false);
      }}
      max={max}
      style={{ width: "100%" }}
    />
  );
}

function LastPayment({
  lastPaymentDayResult,
}: {
  lastPaymentDayResult: LastPaymentDayResult;
}) {
  const today = useSignalValue(todayState);

  return lastPaymentDayResult.result === "complete" ? (
    <>
      {lastPaymentDayResult.day <= today ? (
        <>Done! 🎉</>
      ) : (
        // TODO: just display diff, not date
        <DateDisplay date={lastPaymentDayResult.day} />
      )}
    </>
  ) : (
    <>
      after <DateDisplay date={lastPaymentDayResult.searchedUpToDate} />
    </>
  );
}

export function SavingsGoalsTable() {
  const enhancedSavingsGoals = useSignalValue(enhancedSavingsGoalsState);
  const totalProgress = useSignalValue(totalProgressState);
  const totalGoal = useSignalValue(totalGoalState);
  const goalWithLatestFinalPaymentDayResult = useSignalValue(
    goalWithLatestFinalPaymentDayResultState,
  );

  if (enhancedSavingsGoals.length === 0) {
    return (
      <>
        <p>
          You have no savings goals set up at this time. If you added a savings
          goal, we would show you your progress across them all here.
        </p>
      </>
    );
  }

  return (
    <>
      <Table bordered style={{ marginTop: 4 }}>
        <thead>
          <tr>
            <th>Goal</th>
            <th>Progress</th>
            <th>Goal Amount</th>
            <th>Status</th>
            <th>Projected End</th>
          </tr>
        </thead>
        <tbody>
          {sortBy(enhancedSavingsGoals, "name").map((r) => {
            return (
              <tr key={r.id}>
                <td
                  onClick={() => {
                    selectedRuleIDState.value = r.id;
                  }}
                >
                  {r.name}
                </td>
                <td>
                  <EditableValue
                    value={r.progress}
                    onChange={(newProgress) => {
                      updateRule({ ...r, progress: newProgress });
                    }}
                    max={r.goal}
                  />
                </td>
                <td>
                  <EditableValue
                    value={r.goal}
                    onChange={(newGoal) => {
                      updateRule({ ...r, goal: newGoal });
                    }}
                  />
                </td>
                <td>
                  <Progress goal={r.goal} progress={r.progress} />
                </td>
                <td>
                  <LastPayment lastPaymentDayResult={r.lastPaymentDayResult} />
                </td>
              </tr>
            );
          })}
          <tr
            style={{
              borderTop: "2px solid var(--gray-text)",
            }}
          >
            <td>
              <strong>Total</strong>
            </td>
            <td>
              <strong>
                <CurrencyColorless value={totalProgress} />
              </strong>
            </td>
            <td>
              <strong>
                <CurrencyColorless value={totalGoal} />
              </strong>
            </td>
            <td>
              <Progress goal={totalGoal} progress={totalProgress} />
            </td>
            <td>
              <LastPayment
                lastPaymentDayResult={
                  goalWithLatestFinalPaymentDayResult.lastPaymentDayResult
                }
              />{" "}
              <Info
                infobody={
                  <>
                    Final goal to complete is{" "}
                    {goalWithLatestFinalPaymentDayResult.name}
                  </>
                }
              />
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}
