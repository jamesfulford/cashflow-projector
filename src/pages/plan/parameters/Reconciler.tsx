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
import {
  reconciliationExpectedBalanceState,
  reconciliationRequiredState,
  reconciliationTransactionsState,
  todayState,
} from "../../../store/reconcile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons/faWarning";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { fromStringToDate } from "../../../services/engine/rrule";
import { differenceInDays } from "date-fns/differenceInDays";
import { AppTooltip } from "../../../components/Tooltip";
import {
  TableTabs,
  tableTabSelectionState,
} from "../tables/tableTabSelectionState";
import Table from "react-bootstrap/esm/Table";
import { SavingsGoalsReviewSection } from "./SavingsGoalsReviewSection";
import { TransactionsReviewSection } from "./TransactionsReviewSection";
import { UpdateBalanceSection } from "./UpdateBalanceSection";

export const ReconciliationPrompt = ({
  openModal,
}: {
  openModal: () => void;
}) => {
  const startDate = useSignalValue(startDateState);
  const todayDate = useSignalValue(todayState);
  const dateDiffDays = Math.abs(
    differenceInDays(fromStringToDate(todayDate), fromStringToDate(startDate)),
  );

  const expectedBalance = useSignalValue(reconciliationExpectedBalanceState);
  const currentBalance = useSignalValue(currentBalanceState);
  const balanceDiff = Math.abs(expectedBalance - currentBalance);

  const warn =
    Math.abs(dateDiffDays) > 14 || balanceDiff / currentBalance > 0.05;

  return (
    <Card
      className="mb-2 p-1"
      style={{ backgroundColor: "var(--light-gray-background)" }}
    >
      <div className="text-center d-flex justify-content-center align-items-center">
        {warn && (
          <FontAwesomeIcon
            style={{ color: "var(--yellow)", marginRight: 4 }}
            icon={faWarning}
          />
        )}
        <span>
          Showing <DateDisplay date={startDate} />
        </span>
        <Button
          variant={warn ? "warning" : "outline-secondary"}
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

  if (!reconciliationRequired) return null;

  if (!show) {
    return <ReconciliationPrompt openModal={() => setShow(true)} />;
  }

  return (
    <>
      <ReconciliationPrompt openModal={() => setShow(true)} />
      <ReconcilerModal onClose={() => setShow(false)} />
    </>
  );
};

const ReconcilerModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <Modal show onHide={onClose} keyboard size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Let's catch up.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TransactionsReviewSection onClose={onClose} />
        <hr />

        <SavingsGoalsReviewSection />
        <hr />

        <UpdateBalanceSection onClose={onClose} />
      </Modal.Body>
    </Modal>
  );
};
