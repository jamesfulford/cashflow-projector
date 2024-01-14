import { useCallback, useMemo } from "react";
import { Currency } from "../../../components/currency/Currency";
import { IParameters } from "../../../services/ParameterService";
import { IApiDayByDay } from "../../../services/DayByDayService";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/esm/Modal";

export const Reconciler = ({
  parameters: { startDate },
  daybydays,
  setParameters,
}: {
  parameters: IParameters;
  daybydays: IApiDayByDay;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setParameters: (params: Partial<IParameters>) => Promise<any>;
}) => {
  const now = new Date().toISOString().split("T")[0];

  const daybyday = daybydays.daybydays.find((d) => d.date === now);

  const updateTodayAndBalance = useCallback(
    (targetBalance?: number) => {
      setParameters({
        startDate: now,
        ...(targetBalance && { currentBalance: targetBalance }),
      });
    },
    [now, setParameters],
  );

  const show = useMemo(() => startDate !== now, [startDate, now]);

  if (!daybyday) {
    // TODO: warn day is behind
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={() => {
        updateTodayAndBalance();
      }}
      keyboard
    >
      <Modal.Header closeButton>
        <Modal.Title>Welcome back!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Is your balance today <Currency value={daybyday.balance.close} />?
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={() => {
            updateTodayAndBalance();
          }}
        >
          No, I'll set my balance manually.
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            updateTodayAndBalance(daybyday.balance.close);
          }}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
