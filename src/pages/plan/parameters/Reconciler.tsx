import { useCallback } from "react";
import { Currency } from "../../../components/currency/Currency";
import { IParameters } from "../../../services/ParameterService";
import { IApiDayByDay } from "../../../services/DayByDayService";

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
    <div
      className="mr-3 p-1 pl-4"
      style={{
        backgroundColor: "rgb(0, 0, 0, 0)",
        border: "1px solid white",
        borderRadius: 5,
      }}
    >
      <span>
        Is your balance today <Currency value={daybyday.balance.close} />?
      </span>
      <button
        className="button-secondary"
        style={{ color: "var(--tertiary)", padding: 16 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          updateTodayAndBalance();
        }}
      >
        No, I'll set my balance manually.
      </button>
      <button
        className="button-secondary"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          updateTodayAndBalance(daybyday.balance.close);
        }}
      >
        Yes
      </button>
    </div>
  );
};
