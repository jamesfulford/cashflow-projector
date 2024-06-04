import { Currency } from "../../../../components/currency/Currency";
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
import { formatDistance } from "date-fns/formatDistance";
import { startDateState } from "../../../../store/parameters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons/faPencil";
import { EmergencyFundModal } from "./EmergencyFundModal";
import { showEmergencyFundModalState } from "./emergencyFundModalState";

function PureEmergencyFundCard({
  emergencyFundRule,
}: {
  emergencyFundRule: SavingsGoalRule;
}) {
  const balance = emergencyFundRule.progress;
  const fundDepletedDate = useSignalValue(fundDepletedDateState);
  const startDate = useSignalValue(startDateState);
  const showEmergencyFundModal = useSignalValue(showEmergencyFundModalState);

  return (
    <>
      <Card
        style={{ backgroundColor: "var(--light-gray-background)" }}
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
              <>
                Savings set aside just for emergencies, like job loss or
                disability
              </>
            }
          >
            <span style={{ fontSize: 18, marginRight: 8 }}>
              <EmergencyFundIcon /> Emergency fund{" "}
            </span>
          </AppTooltip>

          <span style={{ marginLeft: "auto", fontSize: 18 }}>
            <AppTooltip
              content={
                <>Amount saved for emergencies, like job loss or disability</>
              }
            >
              <span>
                <Currency value={balance} />{" "}
              </span>
            </AppTooltip>
            <AppTooltip
              content={
                fundDepletedDate ? (
                  <>
                    Fund would last until{" "}
                    <DateDisplay date={fundDepletedDate} simple /> in your
                    emergency scenario.
                  </>
                ) : (
                  <>How long your fund would last in your emergency scenario.</>
                )
              }
            >
              <span style={{ fontSize: 15 }} className="mask">
                (
                {fundDepletedDate
                  ? formatDistance(startDate, fundDepletedDate)
                  : "over a year"}
                ){" "}
              </span>
            </AppTooltip>
          </span>
          <AppTooltip
            content={
              <>
                Configure your <EmergencyFundIcon /> Emergency fund goal and
                emergency scenario
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
