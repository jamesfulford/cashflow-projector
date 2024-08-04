import Form from "react-bootstrap/Form";

import { useSignalValue } from "../../../../store/useSignalValue";
import {
  EMERGENCY_FUND_RULE_ID,
  isRecurringRule,
  rulesState,
  RuleType,
  updateRule,
} from "../../../../store/rules";
import sortBy from "lodash/sortBy";
import { LoanIcon } from "../../../../components/LoanIcon";
import Badge from "react-bootstrap/esm/Badge";
import { SavingsGoalIcon } from "../../../../components/SavingsGoalIcon";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";
import { useTransition } from "react";

export function EmergencyScenarioSection() {
  const rules = useSignalValue(rulesState);

  const startTransition = useTransition()[1];

  return (
    <>
      <h5>Emergency Scenario</h5>
      <p>
        Imagine if you had to rely on your <EmergencyFundIcon /> Emergency Fund
        starting today for several months. Which of the following would still
        apply?
      </p>
      <div style={{ paddingLeft: 16 }}>
        {sortBy(
          rules
            .filter((r) => r.id !== EMERGENCY_FUND_RULE_ID)
            .map((r) => ({
              ...r,
              typeGroup: [
                RuleType.INCOME,
                RuleType.EXPENSE,
                RuleType.LOAN,
                RuleType.SAVINGS_GOAL,
                RuleType.TRANSACTIONS_LIST,
              ].indexOf(r.type),
              absValue: isRecurringRule(r) ? Math.abs(r.value) : 0,
            })),
          ["typeGroup", "-absValue"],
        ).map((r) => {
          return (
            <Form.Check
              key={r.id}
              type="checkbox"
              checked={r.emergencyScenarioApplicability}
              onChange={(e) => {
                const newChecked = e.target.checked;
                startTransition(() => {
                  updateRule({
                    ...r,
                    emergencyScenarioApplicability: newChecked,
                  });
                });
              }}
              label={
                <>
                  {r.name}{" "}
                  {r.type === RuleType.LOAN ? (
                    <>
                      <Badge
                        className={
                          r.balance === 0 ? "bg-success" : "bg-secondary"
                        }
                      >
                        <LoanIcon /> Loan
                      </Badge>
                    </>
                  ) : null}
                  {r.type === RuleType.SAVINGS_GOAL ? (
                    <>
                      <Badge
                        className={
                          r.progress >= r.goal ? "bg-success" : "bg-secondary"
                        }
                      >
                        <SavingsGoalIcon /> Goal
                      </Badge>
                    </>
                  ) : null}
                </>
              }
            />
          );
        })}
      </div>
    </>
  );
}
