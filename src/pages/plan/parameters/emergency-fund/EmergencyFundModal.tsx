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
          <EmergencyFundIcon /> Emergency fund
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Under the hood, your <EmergencyFundIcon /> Emergency fund is actually
          a special <SavingsGoalIcon /> Savings goal.
        </p>
        <ul>
          <li>
            To increase it now, assign more savings to it.{" "}
            <span
              onClick={() => {
                showEmergencyFundModalState.value = false;
                showSavingsModalState.value = true;
              }}
            >
              <FontAwesomeIcon
                icon={faArrowRight}
                style={{ cursor: "pointer" }}
              />
            </span>
          </li>
          <li>
            To grow it over time, edit the <EmergencyFundIcon /> Emergency fund
            expense.{" "}
            {/* <span
              onClick={() => {
                showEmergencyFundModalState.value = false;
                // TODO: open Emergency fund modal rule editor
                // showSavingsModalState.value = true;
              }}
            >
              <FontAwesomeIcon
                icon={faArrowRight}
                style={{ cursor: "pointer" }}
              />
            </span> */}
          </li>
        </ul>
        <hr />
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
