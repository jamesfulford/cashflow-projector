import { Currency } from "../../../../components/currency/Currency";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import CardBody from "react-bootstrap/esm/CardBody";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons/faPencil";
import { faWarning } from "@fortawesome/free-solid-svg-icons/faWarning";
import { useSignalValue } from "../../../../store/useSignalValue";
import { AppTooltip } from "../../../../components/Tooltip";
import { showSavingsModalState } from "./savingsModalState";
import { SavingsModal } from "./SavingsModal";
import {
  savingsBalanceState,
  savingsReconciliationRequiredState,
  unallocatedSavingsState,
} from "./savingsState";
import { computed } from "@preact/signals-core";
import { savingsGoalsState } from "../../../../store/rules";

function PureSavingsCard() {
  const savingsBalance = useSignalValue(savingsBalanceState);
  const savingsReconciliationRequired = useSignalValue(
    savingsReconciliationRequiredState,
  );

  const showSavingsModal = useSignalValue(showSavingsModalState);

  const unallocatedSavings = useSignalValue(unallocatedSavingsState);

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
          <span style={{ fontSize: 18, marginRight: 8 }}>
            Savings
            {savingsReconciliationRequired ? (
              <>
                {" "}
                <AppTooltip
                  content={
                    <>
                      Savings balance has not been updated in a while, please
                      update to keep in sync with reality
                    </>
                  }
                >
                  <span>
                    <FontAwesomeIcon
                      style={{ color: "var(--yellow)", marginRight: 4 }}
                      icon={faWarning}
                    />
                  </span>
                </AppTooltip>
              </>
            ) : null}
          </span>
          <AppTooltip content={<>Current balance in savings account(s)</>}>
            <span style={{ marginLeft: "auto", fontSize: 18 }}>
              <Currency value={savingsBalance} />{" "}
            </span>
          </AppTooltip>
          {savingsReconciliationRequired ? (
            <AppTooltip
              content={
                <>
                  It's been a month since you last updated your savings balance
                  - you might have some interest you can use! Update your
                  savings account balance.
                </>
              }
            >
              <Button
                variant="warning"
                className="pt-0 pb-0 pl-1 pr-1"
                style={{ marginLeft: 4 }}
                onClick={() => {
                  showSavingsModalState.value = true;
                }}
              >
                Reconcile
              </Button>
            </AppTooltip>
          ) : (
            <>
              {unallocatedSavings < 0 ? (
                <AppTooltip
                  content={
                    <>
                      You have assigned more savings than your balance allows.
                      Resolve now.
                    </>
                  }
                >
                  <span
                    style={{ fontSize: 16, marginLeft: 8, cursor: "pointer" }}
                    onClick={() => {
                      showSavingsModalState.value = true;
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faWarning}
                      style={{ color: "var(--yellow)" }}
                      role="tooltip"
                    />
                  </span>
                </AppTooltip>
              ) : (
                <>
                  {unallocatedSavings > 0 ? (
                    <AppTooltip
                      content={<>You have extra savings to assign to goals!</>}
                    >
                      <Button
                        variant="success"
                        className="pt-0 pb-0 pl-1 pr-1"
                        style={{ marginLeft: 4 }}
                        onClick={() => {
                          showSavingsModalState.value = true;
                        }}
                      >
                        Assign
                      </Button>
                    </AppTooltip>
                  ) : (
                    <>
                      <AppTooltip content={<>Edit savings balance and goals</>}>
                        <span style={{ fontSize: 12, marginLeft: 8 }}>
                          <FontAwesomeIcon
                            icon={faPencil}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              showSavingsModalState.value = true;
                            }}
                          />
                        </span>
                      </AppTooltip>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>
      {showSavingsModal ? (
        <SavingsModal
          onClose={() => {
            showSavingsModalState.value = false;
          }}
        />
      ) : null}
    </>
  );
}

const showSavingsCardState = computed(
  () => savingsGoalsState.value.length !== 0,
);

export function SavingsCard() {
  const showSavingsCard = useSignalValue(showSavingsCardState);
  if (!showSavingsCard) return null;
  return <PureSavingsCard />;
}
