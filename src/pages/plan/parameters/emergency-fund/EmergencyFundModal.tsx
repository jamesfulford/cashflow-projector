import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";
import { SavingsGoalIcon } from "../../../../components/SavingsGoalIcon";
import { showSavingsModalState } from "../savings/savingsModalState";
import { showEmergencyFundModalState } from "./emergencyFundModalState";
import { EmergencyScenarioSection } from "./EmergencyScenarioSection";
import { EmergencyFundCoverageSection } from "./EmergencyFundCoverageSection";

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
