import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import {
  currentBalanceState,
  setAsideState,
  setParameters,
} from "../../../../store/parameters";
import { useCallback, useEffect, useRef, useState } from "react";
import { CurrencyInputSubGroup } from "../../../../components/CurrencyInput";
import { CurrencyColorless } from "../../../../components/currency/Currency";
import { AppTooltip } from "../../../../components/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";
import { SafetyNetIcon } from "../../../../components/SafetyNetIcon";

export function CheckingModal({ onClose }: { onClose: () => void }) {
  const [currentBalance, setCurrentBalance] = useState(
    currentBalanceState.peek(),
  );
  useEffect(
    () =>
      currentBalanceState.subscribe((newBalance) =>
        setCurrentBalance(newBalance),
      ),
    [],
  );

  const [setAside, setSetAside] = useState(setAsideState.peek());
  useEffect(
    () => setAsideState.subscribe((newSetAside) => setSetAside(newSetAside)),
    [],
  );

  const submit = useCallback(() => {
    if (
      setAside === setAsideState.peek() &&
      currentBalance === currentBalanceState.peek()
    ) {
      // if no change, do nothing
      return;
    }

    setParameters({
      setAside,
      currentBalance,
    });
  }, [currentBalance, setAside]);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (buttonRef.current) buttonRef.current.focus();
  }, []);

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Total balance</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Balance</h5>
        <p>
          How much in your account(s) right now.{" "}
          <AppTooltip
            content={
              <>
                If you have multiple accounts, add them together. We will start
                with this total balance when predicting your future balances.
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
            value={currentBalance}
            allowNegative
            controlId="currentBalance"
            label={"Balance"}
            onValueChange={setCurrentBalance}
            style={{ color: undefined }}
          />
        </InputGroup>
        <p></p>

        <hr />

        <h5>
          <SafetyNetIcon /> Safety Net
        </h5>
        <p>
          Money set aside in your accounts to protect yourself from small
          unexpected expenses.{" "}
          <a
            href="https://www.ramseysolutions.com/dave-ramsey-7-baby-steps#baby-step-1"
            target="_blank"
            style={{ color: "inherit" }}
          >
            Dave Ramsey's Baby Step #1 to getting out of debt
          </a>{" "}
          advises setting aside <CurrencyColorless value={1000} />.{" "}
          <AppTooltip
            interactive
            content={
              <>
                Imagine having the funds on hand to handle small expenses like a
                tow truck, small car repair, or a hotel if stranded overnight.
              </>
            }
          >
            <span>
              <FontAwesomeIcon icon={faCircleQuestion} role="tooltip" />
            </span>
          </AppTooltip>
        </p>

        <InputGroup size="sm" id="safety-net-input" style={{ marginBottom: 8 }}>
          <CurrencyInputSubGroup
            value={setAside}
            controlId="setAside"
            label={"Safety Net"}
            onValueChange={setSetAside}
            style={{ color: undefined }}
          />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          ref={buttonRef}
          variant="primary"
          onClick={() => {
            submit();
            onClose();
          }}
        >
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
