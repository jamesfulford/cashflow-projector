import { useCallback, useEffect, useRef, useState } from "react";
import { Currency } from "../../../components/currency/Currency";
import {
  currentBalanceState,
  setParameters,
  startDateState,
} from "../../../store/parameters";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/esm/Modal";
import { CurrencyInputSubGroup } from "../../../components/CurrencyInput";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { HelpInputGroup } from "../../../components/HelpInputGroup";
import Card from "react-bootstrap/esm/Card";
import { useSignalValue } from "../../../store/useSignalValue";
import Tippy from "@tippyjs/react";
import {
  reconciliationExpectedBalanceState,
  reconciliationRequiredState,
  reconciliationTransactionsState,
  todayState,
} from "../../../store/reconcile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons/faWarning";
import { DateDisplay } from "../../../components/date/DateDisplay";

export const ReconciliationPrompt = ({
  openModal,
}: {
  openModal: () => void;
}) => {
  const startDate = useSignalValue(startDateState);
  return (
    <Card
      className="mb-2 p-1"
      style={{ backgroundColor: "var(--light-gray-background)" }}
    >
      <div className="text-center d-flex justify-content-center align-items-center">
        <FontAwesomeIcon
          style={{ color: "var(--yellow)", marginRight: 4 }}
          icon={faWarning}
        />
        <span>
          Showing <DateDisplay date={startDate} />, not today.
        </span>
        <Button
          variant="warning"
          className="pt-0 pb-0 pl-1 pr-1"
          style={{ marginLeft: 4 }}
          onClick={openModal}
        >
          Reconcile
        </Button>
      </div>
    </Card>
  );
};
export const Reconciler = () => {
  const [show, setShow] = useState(false);

  const reconciliationRequired = useSignalValue(reconciliationRequiredState);

  const updateTodayAndBalance = useCallback((targetBalance?: number) => {
    setParameters({
      startDate: todayState.peek(),
      ...(targetBalance && { currentBalance: targetBalance }),
    });
    setShow(false);
  }, []);

  if (!reconciliationRequired) return null;

  if (!show) {
    return <ReconciliationPrompt openModal={() => setShow(true)} />;
  }

  return (
    <>
      <ReconciliationPrompt openModal={() => setShow(true)} />
      <ReconcilerModal
        updateTodayAndBalance={updateTodayAndBalance}
        onClose={() => setShow(false)}
      />
    </>
  );
};

const ReconcilerModal = ({
  updateTodayAndBalance,
  onClose,
}: {
  updateTodayAndBalance: (targetBalance?: number) => void;
  onClose: () => void;
}) => {
  const startDate = useSignalValue(startDateState);

  const currentBalance = useSignalValue(currentBalanceState);
  const expectedBalance = useSignalValue(reconciliationExpectedBalanceState);

  const relevantTransactions = useSignalValue(reconciliationTransactionsState);

  const [newBalance, setNewBalance] = useState(expectedBalance);

  const submit = useCallback(() => {
    updateTodayAndBalance(newBalance);
  }, [updateTodayAndBalance, newBalance]);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (buttonRef.current) buttonRef.current.focus();
  }, []);

  const hasTransactions = relevantTransactions.length > 0;
  const pluralTransactions = relevantTransactions.length > 1;
  const transactionsName = "transaction" + (pluralTransactions ? "s" : "");

  return (
    <Modal show onHide={onClose} keyboard>
      <Modal.Header closeButton>
        <Modal.Title>Welcome back! Let's catch up.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Last time, on <DateDisplay date={startDate} />, you had{" "}
          <Currency value={currentBalance} />. Since then,{" "}
          {hasTransactions ? (
            <Tippy content={<>See and defer {transactionsName}</>}>
              <Button
                variant="link"
                className="p-0 m-0"
                style={{
                  color: "inherit",
                }}
                onClick={onClose}
              >
                {relevantTransactions.length} {transactionsName}{" "}
                {pluralTransactions ? "were" : "was"} expected to happen.
              </Button>
            </Tippy>
          ) : (
            <>no transactions were expected to happen.</>
          )}
        </p>

        <p>What is your balance today?</p>
        <InputGroup size="sm">
          <CurrencyInputSubGroup
            value={newBalance}
            controlId="newBalance"
            label={"Balance today"}
            onValueChange={setNewBalance}
            allowNegative
          />
          {newBalance !== expectedBalance ? (
            <>
              <HelpInputGroup
                helptext={
                  <>
                    Off from expectations by&nbsp;
                    <Currency value={newBalance - expectedBalance} />.
                    <br />
                    <Button
                      className="p-1 ml-2"
                      variant="outline-secondary"
                      onClick={() => {
                        setNewBalance(expectedBalance);
                      }}
                    >
                      Reset
                    </Button>
                  </>
                }
              />
            </>
          ) : null}
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          ref={buttonRef}
          variant="primary"
          onClick={() => {
            submit();
          }}
        >
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
