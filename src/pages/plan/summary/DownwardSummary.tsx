import { formatDistance } from "date-fns/formatDistance";
import {
  safetyNetViolatedDayByDayState,
  zeroViolatedDayByDayState,
} from "../../../store/runway";
import { useSignalValue } from "../../../store/useSignalValue";
import { fromStringToDate } from "../../../services/engine/rrule";
import { startDateState } from "../../../store/parameters";
import Tippy from "@tippyjs/react";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { differenceInDays } from "date-fns/differenceInDays";

const SafetyNetViolated = () => {
  const safetyNetViolatedDayByDay = useSignalValue(
    safetyNetViolatedDayByDayState,
  );
  const startDate = fromStringToDate(useSignalValue(startDateState));

  if (!safetyNetViolatedDayByDay)
    return (
      <div className="text-center">
        <Tippy
          content={
            <>
              While your balance seems to have a downward trend, we have not
              projected far enough out to report when your safety net will be
              violated.
            </>
          }
        >
          <span>
            Safety net: <em>unknown</em>
          </span>
        </Tippy>
      </div>
    );

  const safetyNetEndDate = fromStringToDate(safetyNetViolatedDayByDay.date);

  return (
    <div className="text-center">
      <Tippy
        content={
          <>
            Your balance is projected to violate your safety net on{" "}
            <strong>
              <DateDisplay date={safetyNetEndDate} />
            </strong>
            , which is in{" "}
            <strong>
              {differenceInDays(safetyNetEndDate, startDate)} days
            </strong>
            .
          </>
        }
      >
        <span>
          Safety net:{" "}
          {startDate < safetyNetEndDate
            ? formatDistance(startDate, safetyNetEndDate)
            : "none"}
        </span>
      </Tippy>
    </div>
  );
};

const ZeroViolated = () => {
  const zeroViolatedDayByDay = useSignalValue(zeroViolatedDayByDayState);
  const startDate = fromStringToDate(useSignalValue(startDateState));

  if (!zeroViolatedDayByDay)
    return (
      <div className="text-center">
        <Tippy
          content={
            <>
              While your balance seems to have a downward trend, we have not
              projected far enough out to report when you will run out of money.
            </>
          }
        >
          <span>
            Balance gone: <em>unknown</em>
          </span>
        </Tippy>
      </div>
    );

  const balanceEndDate = fromStringToDate(zeroViolatedDayByDay.date);

  return (
    <div className="text-center">
      <Tippy
        content={
          <>
            Your balance is projected to be gone on{" "}
            <strong>
              <DateDisplay date={balanceEndDate} />
            </strong>
            , which is in{" "}
            <strong>{differenceInDays(balanceEndDate, startDate)} days</strong>.
          </>
        }
      >
        <span>
          Balance gone:{" "}
          {startDate < balanceEndDate
            ? formatDistance(startDate, balanceEndDate)
            : "none"}
        </span>
      </Tippy>
    </div>
  );
};

export const DownwardSummary = () => {
  return (
    <>
      <SafetyNetViolated />
      <ZeroViolated />
    </>
  );
};
