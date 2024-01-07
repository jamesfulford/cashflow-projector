import { useCallback } from "react";
import { Currency } from "../../../components/currency/Currency";
import { IParameters } from "../../../services/ParameterService";
import { IApiDayByDay } from "../../../services/DayByDayService";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

export const Reconciler = ({
  parameters: { startDate },
  daybydays,
  setParameters,
}: {
  parameters: IParameters;
  daybydays: IApiDayByDay;
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
    [now],
  );

  if (startDate === now) {
    return null;
  }

  if (!daybyday) {
    // TODO: warn day is behind
    return null;
  }

  return (
    <Alert variant="secondary">
      <span>
        Is your balance today <Currency value={daybyday.balance.close} />?
      </span>
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateTodayAndBalance();
          }}
        >
          No, I'll set my balance manually.
        </Button>
        <Button
          variant="primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateTodayAndBalance(daybyday.balance.close);
          }}
        >
          Yes
        </Button>
      </div>
    </Alert>
  );
};
