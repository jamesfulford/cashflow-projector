import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { Currency } from "../../../components/currency/Currency";
import { getDayByDay } from "../../../store/reducers/daybydays/getters";
import { setParametersAndRecalculate } from "../../../store/reducers/parameters";
import { getParameters } from "../../../store/reducers/parameters/getters";
import { useThunkDispatch } from "../../../useDispatch";

export const Reconciler = () => {
  const { parameters, daybydays } = useSelector((state) => ({
    parameters: getParameters(state as any),
    daybydays: getDayByDay(state as any),
  }));
  const dispatch = useThunkDispatch();

  const now = new Date().toISOString().split("T")[0];

  const daybyday = daybydays.data?.daybydays.find((d) => d.date === now);

  const updateTodayAndBalance = useCallback(
    (targetBalance?: number) => {
      dispatch(
        setParametersAndRecalculate({
          startDate: now,
          ...(targetBalance && { currentBalance: targetBalance }),
        }) as any,
      );
    },
    [dispatch, now],
  );

  if (parameters.startDate === now) {
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
