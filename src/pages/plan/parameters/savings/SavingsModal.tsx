import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { useEffect, useRef } from "react";
import { CurrencyInputSubGroup } from "../../../../components/CurrencyInput";
import { AppTooltip } from "../../../../components/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";
import {
  insufficientSavingsForAllocationsState,
  savingsBalanceState,
  totalProgressState,
  savingsLastUpdatedDateState,
} from "./savingsState";
import { useSignalValue } from "../../../../store/useSignalValue";
import { CurrencyColorless } from "../../../../components/currency/Currency";
import { todayState } from "../../../../store/reconcile";
import { WarningInputGroup } from "../../../../components/WarningInputGroup";
import { SavingsGoalsTable } from "./SavingsGoalsTable";

export function SavingsModal({ onClose }: { onClose: () => void }) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (buttonRef.current) buttonRef.current.focus();
  }, []);

  const savingsBalance = useSignalValue(savingsBalanceState);
  const today = useSignalValue(todayState);
  const totalProgress = useSignalValue(totalProgressState);
  const insufficientSavingsForAllocations = useSignalValue(
    insufficientSavingsForAllocationsState,
  );

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Savings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Balance</h5>
        <p>
          How much in your savings account(s) right now.{" "}
          <AppTooltip
            content={
              <>
                If you have multiple savings accounts, add them together.
                <br />
                <br />
                We will use this, along with your savings goals, to figure out
                how much interest you earned and can assign to another savings
                goal.
              </>
            }
          >
            <span>
              <FontAwesomeIcon icon={faCircleQuestion} role="tooltip" />
            </span>
          </AppTooltip>
        </p>

        <InputGroup size="sm" id="current-balance-input">
          <CurrencyInputSubGroup
            value={savingsBalance}
            allowNegative
            controlId="savingsBalance"
            label={"Savings"}
            onValueChange={(newSavingsBalance) => {
              savingsBalanceState.value = newSavingsBalance;
              savingsLastUpdatedDateState.value = today;
            }}
            style={{ color: undefined }}
          />
          {insufficientSavingsForAllocations ? (
            <>
              <WarningInputGroup
                why={
                  <>
                    Your savings balance (
                    <CurrencyColorless value={savingsBalance} />) is lower than
                    the amount you've saved toward your goals (
                    <CurrencyColorless value={totalProgress} />
                    ). It should be equal or higher. Where did the money go?
                    <br />
                    <br />
                    Maybe you forgot to transfer some money from checking, or
                    maybe you withdrew from savings unexpectedly.
                    <br />
                    <br />
                    To fix, lower the balance on some of your goals.
                  </>
                }
              />
            </>
          ) : null}
        </InputGroup>

        <hr />

        <SavingsGoalsTable />
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
