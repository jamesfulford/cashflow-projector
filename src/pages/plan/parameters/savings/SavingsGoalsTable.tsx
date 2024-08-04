import Button from "react-bootstrap/esm/Button";
import { useEffect, useState } from "react";
import { CurrencyInput } from "../../../../components/CurrencyInput";
import { AppTooltip } from "../../../../components/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  totalProgressState,
  totalGoalState,
  unallocatedSavingsState,
  goalWithLatestFinalPaymentDayResultState,
} from "./savingsState";
import {
  EMERGENCY_FUND_RULE_ID,
  enhancedSavingsGoalsState,
  updateRule,
} from "../../../../store/rules";
import { useSignalValue } from "../../../../store/useSignalValue";
import Table from "react-bootstrap/esm/Table";
import {
  Currency,
  CurrencyColorless,
} from "../../../../components/currency/Currency";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
import { todayState } from "../../../../store/reconcile";
import { DateDisplay } from "../../../../components/date/DateDisplay";
import { Info } from "../../../../components/Info";
import { faPencil } from "@fortawesome/free-solid-svg-icons/faPencil";
import {
  LastPaymentDayResult,
  computeLastPaymentDay,
} from "../../../../services/engine/computeLastPaymentDate";
import { startDateState } from "../../../../store/parameters";
import {
  fromDateToString,
  fromStringToDate,
} from "../../../../services/engine/rrule";
import { addYears } from "date-fns/addYears";
import { formatDistance } from "date-fns/formatDistance";
import sortBy from "lodash/sortBy";
import isEqual from "lodash/isEqual";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";

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
function EditableBalance({
  progress,
  onChange,
  max,
}: {
  progress: number;
  onChange: (newProgress: number) => void;
  max: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newProgress, setNewProgress] = useState(progress);
  useEffect(() => {
    setNewProgress(progress);
  }, [progress]);

  if (!isEditing) {
    return (
      <>
        <CurrencyColorless value={progress} />{" "}
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
      value={newProgress}
      onValueChange={setNewProgress}
      onBlur={() => {
        onChange(newProgress);
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
  const today = useSignalValue(todayState);
  const enhancedSavingsGoals = useSignalValue(enhancedSavingsGoalsState);
  const totalProgress = useSignalValue(totalProgressState);
  const totalGoal = useSignalValue(totalGoalState);
  const unallocatedSavings = useSignalValue(unallocatedSavingsState);
  const goalWithLatestFinalPaymentDayResult = useSignalValue(
    goalWithLatestFinalPaymentDayResultState,
  );
  const startDate = useSignalValue(startDateState);

  if (enhancedSavingsGoals.length === 0) {
    return (
      <>
        <h5>Goals</h5>
        <p>
          You have no savings goals set up at this time. If you added a savings
          goal, we would show you your progress across them all here.
        </p>
      </>
    );
  }

  return (
    <>
      <h5>Goals</h5>
      <p>How much progress you have earned toward your savings goals.</p>
      <Table bordered>
        <thead>
          <tr>
            <th>Name</th>
            <th>Balance</th>
            <th>Status</th>
            <th>End</th>
            {unallocatedSavings > 0 ? <th>Assign</th> : null}
          </tr>
        </thead>
        <tbody>
          {sortBy(enhancedSavingsGoals, "name").map((r) => {
            const assignedNewProgress = Math.min(
              r.goal,
              unallocatedSavings + r.progress,
            );
            const assignedProgressAdded = assignedNewProgress - r.progress;
            const assignedCompletesGoal = assignedNewProgress >= r.goal;
            const assignedLastPaymentDayResult = computeLastPaymentDay(
              {
                ...r,
                progress: assignedNewProgress,
              },
              startDate,
              fromDateToString(addYears(fromStringToDate(startDate), 10)),
            );
            const assignedBigDifference = !isEqual(
              r.lastPaymentDayResult,
              assignedLastPaymentDayResult,
            );

            return (
              <tr key={r.id}>
                <td>
                  {r.id === EMERGENCY_FUND_RULE_ID ? (
                    <>
                      <EmergencyFundIcon /> Emergency Fund
                    </>
                  ) : (
                    <>{r.name}</>
                  )}
                </td>
                <td>
                  <EditableBalance
                    progress={r.progress}
                    onChange={(newProgress) => {
                      updateRule({ ...r, progress: newProgress });
                    }}
                    max={r.progress + unallocatedSavings}
                  />
                </td>
                <td>
                  <Progress goal={r.goal} progress={r.progress} />
                </td>
                <td>
                  <LastPayment lastPaymentDayResult={r.lastPaymentDayResult} />
                </td>
                {unallocatedSavings > 0 ? (
                  <td>
                    {r.progress < r.goal ? (
                      <AppTooltip
                        content={
                          <>
                            <ul style={{ paddingLeft: 12, margin: 0 }}>
                              <li>
                                Adds{" "}
                                <CurrencyColorless
                                  value={assignedProgressAdded}
                                />{" "}
                                to goal{" "}
                                {assignedBigDifference ? (
                                  <>
                                    (+
                                    <span className="mask">
                                      {(
                                        (100 *
                                          (assignedNewProgress - r.progress)) /
                                        r.goal
                                      ).toFixed(0)}
                                      %
                                    </span>
                                    )
                                  </>
                                ) : null}
                              </li>
                              {assignedCompletesGoal ||
                              !assignedBigDifference ? null : (
                                <li>
                                  Boosts progress to{" "}
                                  <span className="mask">
                                    {(
                                      (100 * assignedNewProgress) /
                                      r.goal
                                    ).toFixed(0)}
                                    %
                                  </span>
                                </li>
                              )}

                              {r.lastPaymentDayResult.result === "complete" &&
                              assignedLastPaymentDayResult.result ===
                                "complete" &&
                              assignedBigDifference ? (
                                <li>
                                  Saves{" "}
                                  {formatDistance(
                                    fromStringToDate(
                                      r.lastPaymentDayResult.day,
                                    ),
                                    fromStringToDate(
                                      assignedLastPaymentDayResult.day,
                                    ),
                                  )}
                                </li>
                              ) : null}

                              {assignedCompletesGoal ? (
                                <li>
                                  <strong>Completes goal</strong>
                                </li>
                              ) : (
                                <>
                                  {assignedLastPaymentDayResult.result ===
                                    "complete" && assignedBigDifference ? (
                                    <li>
                                      Makes end date{" "}
                                      <DateDisplay
                                        date={assignedLastPaymentDayResult.day}
                                      />{" "}
                                      (in{" "}
                                      {formatDistance(
                                        fromStringToDate(today),
                                        fromStringToDate(
                                          assignedLastPaymentDayResult.day,
                                        ),
                                      )}
                                      )
                                    </li>
                                  ) : null}
                                </>
                              )}
                            </ul>
                          </>
                        }
                      >
                        <Button
                          onClick={() => {
                            updateRule({
                              ...r,
                              progress: assignedNewProgress,
                            });
                          }}
                          size="sm"
                          variant={
                            assignedCompletesGoal
                              ? "outline-success"
                              : "outline-secondary"
                          }
                        >
                          Assign
                        </Button>
                      </AppTooltip>
                    ) : null}
                  </td>
                ) : null}
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
            {unallocatedSavings > 0 ? (
              <td>
                <AppTooltip
                  content={<>Savings balance not assigned to a goal.</>}
                >
                  <strong>
                    <Currency value={unallocatedSavings} />
                  </strong>
                </AppTooltip>{" "}
              </td>
            ) : null}
          </tr>
        </tbody>
      </Table>
    </>
  );
}
