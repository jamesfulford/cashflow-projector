import { CurrencyColorless } from "../../../../components/currency/Currency";
import Card from "react-bootstrap/esm/Card";
import CardBody from "react-bootstrap/esm/CardBody";
import { useSignalValue } from "../../../../store/useSignalValue";
import { AppTooltip } from "../../../../components/Tooltip";
import {
  SavingsGoalRule,
  emergencyFundRuleState,
} from "../../../../store/rules";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";
import { DateDisplay } from "../../../../components/date/DateDisplay";
import { fundDepletedDateState } from "./emergencyFundState";
import { startDateState } from "../../../../store/parameters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons/faPencil";
import { EmergencyFundModal } from "./EmergencyFundModal";
import { showEmergencyFundModalState } from "./emergencyFundModalState";
import { daysBetween } from "rrule/dist/esm/dateutil";
import { fromStringToDate } from "../../../../services/engine/rrule";

function formatEmergencyFundDurationMonths(
  startDate: string,
  endDate: string,
): string {
  const days = daysBetween(
    fromStringToDate(endDate),
    fromStringToDate(startDate),
  );
  const halfMonths = Math.floor(days / 15);
  const months = halfMonths / 2;
  if (Number.isInteger(months)) return `${months}`; // 1
  return months.toFixed(1); // 1.5
}

function PureEmergencyFundCard({
  emergencyFundRule,
}: {
  emergencyFundRule: SavingsGoalRule;
}) {
  const value = emergencyFundRule.progress;
  const fundDepletedDate = useSignalValue(fundDepletedDateState);
  const startDate = useSignalValue(startDateState);
  const showEmergencyFundModal = useSignalValue(showEmergencyFundModalState);

  return (
    <>
      <Card
        style={{
          backgroundColor: "var(--light-gray-background)",
          marginLeft: 50,
        }}
        className="mt-1"
      >
        <CardBody
          style={{
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 12,
            paddingRight: 12,
          }}
          className="d-flex justify-content-start align-items-center"
        >
          <AppTooltip
            content={
              <>Savings set aside for job loss, disability, or large expenses</>
            }
          >
            <span style={{ fontSize: 15, marginRight: 8 }}>
              <EmergencyFundIcon /> Emergency Fund{" "}
            </span>
          </AppTooltip>

          <span style={{ marginLeft: "auto", fontSize: 15 }}>
            <AppTooltip
              content={
                fundDepletedDate ? (
                  <>
                    Your <EmergencyFundIcon /> Emergency Fund (
                    <CurrencyColorless value={value} />) would last until{" "}
                    <DateDisplay date={fundDepletedDate} simple /> in your
                    Emergency Scenario.
                  </>
                ) : (
                  <>
                    How long your <EmergencyFundIcon /> Emergency Fund would
                    last in your Emergency Scenario.
                  </>
                )
              }
            >
              <span style={{ fontSize: 15 }} className="mask">
                {fundDepletedDate
                  ? formatEmergencyFundDurationMonths(
                      startDate,
                      fundDepletedDate,
                    ) + " months"
                  : "over a year"}{" "}
              </span>
            </AppTooltip>
          </span>
          <AppTooltip
            content={
              <>
                Configure your <EmergencyFundIcon /> Emergency Fund goal and
                Emergency Scenario
              </>
            }
          >
            <span style={{ fontSize: 12, marginLeft: 8 }}>
              <FontAwesomeIcon
                icon={faPencil}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  showEmergencyFundModalState.value = true;
                }}
              />
            </span>
          </AppTooltip>
        </CardBody>
      </Card>
      {showEmergencyFundModal ? (
        <EmergencyFundModal
          onClose={() => {
            showEmergencyFundModalState.value = false;
          }}
        />
      ) : null}
    </>
  );
}

export function EmergencyFundCard() {
  const emergencyFundRule = useSignalValue(emergencyFundRuleState);
  if (!emergencyFundRule) return null;
  return <PureEmergencyFundCard emergencyFundRule={emergencyFundRule} />;
}
