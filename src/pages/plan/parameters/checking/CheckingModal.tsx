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
import Tippy from "@tippyjs/react";
import { SafetyNetIcon } from "../../../../components/SafetyNetIcon";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";

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
        <Modal.Title>Checking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Balance</h5>
        <p>
          How much in your checking account(s) right now.{" "}
          <AppTooltip
            content={
              <>
                If you have multiple checking accounts, add them together.
                PayPal, Venmo, and other accounts that you can quickly access to
                pay for something can be included.
                <br />
                <br />
                We will start with this total balance when predicting your
                future balances.
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
          <SafetyNetIcon /> Safety net
        </h5>
        <p>
          How much to always leave in your checking account.{" "}
          <Tippy
            interactive
            content={
              <>
                Useful for keeping a small amount available for urgent
                unexpected spending, like a tow truck or a hotel for a night.
                <br />
                <br />
                A <SafetyNetIcon /> Safety net is not an <EmergencyFundIcon />{" "}
                Emergency fund. However, it is key for giving you some
                much-needed financial peace of mind.{" "}
                <a
                  href="https://www.ramseysolutions.com/dave-ramsey-7-baby-steps#baby-step-1"
                  target="_blank"
                  style={{ color: "inherit" }}
                >
                  Dave Ramsey's Baby Step #1 to getting out of debt
                </a>{" "}
                advises setting aside <CurrencyColorless value={1000} />.
              </>
            }
          >
            <span>
              <FontAwesomeIcon icon={faCircleQuestion} role="tooltip" />
            </span>
          </Tippy>
        </p>

        <InputGroup size="sm" id="safety-net-input" style={{ marginBottom: 8 }}>
          <CurrencyInputSubGroup
            value={setAside}
            controlId="setAside"
            label={"Safety net"}
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
