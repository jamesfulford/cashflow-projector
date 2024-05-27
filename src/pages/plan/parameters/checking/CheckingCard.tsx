import { Currency } from "../../../../components/currency/Currency";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import CardBody from "react-bootstrap/esm/CardBody";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons/faPencil";
import { faWarning } from "@fortawesome/free-solid-svg-icons/faWarning";
import { reconciliationRequiredState } from "../../../../store/reconcile";
import { useSignalValue } from "../../../../store/useSignalValue";
import { currentBalanceState } from "../../../../store/parameters";
import { AppTooltip } from "../../../../components/Tooltip";
import { CheckingModal } from "./CheckingModal";
import { CheckingReconcilerModal } from "./CheckingReconcilerModal";
import {
  showCheckingModalState,
  showCheckingReconciliationState,
} from "./checkingModalState";

export function CheckingCard() {
  const reconciliationRequired = useSignalValue(reconciliationRequiredState);
  const currentBalance = useSignalValue(currentBalanceState);

  const showCheckingModal = useSignalValue(showCheckingModalState);
  const showCheckingReconciliation = useSignalValue(
    showCheckingReconciliationState,
  );

  return (
    <>
      <Card style={{ backgroundColor: "var(--light-gray-background)" }}>
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
            Checking
            {reconciliationRequired ? (
              <>
                {" "}
                <AppTooltip
                  content={
                    <>
                      Checking balance needs to be reconciled in order to show
                      up-to-date projection
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
          <AppTooltip content={<>Current balance in checking account(s)</>}>
            <span style={{ marginLeft: "auto", fontSize: 18 }}>
              <Currency value={currentBalance} />{" "}
            </span>
          </AppTooltip>
          {reconciliationRequired ? (
            <Button
              variant="warning"
              className="pt-0 pb-0 pl-1 pr-1"
              style={{ marginLeft: 4 }}
              onClick={() => {
                showCheckingReconciliationState.value = true;
              }}
            >
              Reconcile
            </Button>
          ) : (
            <AppTooltip content={<>Edit checking balance and settings</>}>
              <span style={{ fontSize: 12, marginLeft: 8 }}>
                <FontAwesomeIcon
                  icon={faPencil}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    showCheckingModalState.value = true;
                  }}
                />
              </span>
            </AppTooltip>
          )}
        </CardBody>
      </Card>
      {showCheckingModal ? (
        <CheckingModal
          onClose={() => {
            showCheckingModalState.value = false;
          }}
        />
      ) : null}
      {showCheckingReconciliation ? (
        <CheckingReconcilerModal
          onClose={() => {
            showCheckingReconciliationState.value = false;
          }}
        />
      ) : null}
    </>
  );
}
