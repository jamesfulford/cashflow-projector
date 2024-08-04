import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import { useEffect, useRef } from "react";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";
import { EmergencyScenarioSection } from "./EmergencyScenarioSection";
import { EmergencyFundCoverageSection } from "./EmergencyFundCoverageSection";
import { showEmergencyFundModalState } from "./emergencyFundModalState";
import { showSavingsModalState } from "../savings/savingsModalState";
import { AppTooltip } from "../../../../components/Tooltip";

export function EmergencyFundModal({ onClose }: { onClose: () => void }) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (buttonRef.current) buttonRef.current.focus();
  }, []);

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <EmergencyFundIcon /> Emergency Fund
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Your <EmergencyFundIcon /> Emergency Fund is money set aside in your
          Savings to prepare for job loss, disability, or a sudden large expense
          like a replacement car.{" "}
          <a
            href="https://www.ramseysolutions.com/dave-ramsey-7-baby-steps#baby-step-3"
            target="_blank"
            style={{ color: "inherit" }}
          >
            Dave Ramsey's Baby Step #3
          </a>{" "}
          advises building a fund for 3-6 months of expenses.
        </p>
        <p>
          To grow your <EmergencyFundIcon /> Emergency Fund:
        </p>
        <ul>
          <li>
            <AppTooltip
              content={<>Re-allocate where your Savings are assigned to.</>}
            >
              <Button
                variant="secondary"
                style={{ padding: "0 8px" }}
                onClick={() => {
                  showEmergencyFundModalState.value = false;
                  showSavingsModalState.value = true;
                }}
              >
                Assign more Savings
              </Button>
            </AppTooltip>
          </li>
          <li>
            <AppTooltip
              content={
                <>
                  Find your <EmergencyFundIcon /> Emergency Fund underneath your
                  expenses and edit the recurring transaction and target goal
                  value there.
                </>
              }
            >
              <Button
                variant="secondary"
                style={{ padding: "0 8px" }}
                onClick={() => {
                  alert(
                    "Find your Emergency Fund underneath your expenses and edit the recurring transaction and target goal values there.",
                  );
                }}
              >
                Contribute over time
              </Button>
            </AppTooltip>
          </li>
        </ul>

        <EmergencyFundCoverageSection />
        <hr />
        <EmergencyScenarioSection />
      </Modal.Body>
      <Modal.Footer>
        <Button
          ref={buttonRef}
          variant="primary"
          onClick={() => {
            onClose();
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
