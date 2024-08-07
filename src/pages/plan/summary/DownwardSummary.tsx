import { formatDistance } from "date-fns/formatDistance";
import {
  safetyNetViolatedDayByDayState,
  zeroViolatedDayByDayState,
} from "../../../store/runway";
import { useSignalValue } from "../../../store/useSignalValue";
import { fromStringToDate } from "../../../services/engine/rrule";
import { setAsideState, startDateState } from "../../../store/parameters";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { differenceInDays } from "date-fns/differenceInDays";
import { durationDaysState } from "../../../store/displayDateRange";
import { formatDuration } from "date-fns/formatDuration";
import { SafetyNetIcon } from "../../../components/SafetyNetIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";
import { Info } from "../../../components/Info";

const SafetyNetViolated = () => {
  const safetyNetViolatedDayByDay = useSignalValue(
    safetyNetViolatedDayByDayState,
  );
  const startDate = fromStringToDate(useSignalValue(startDateState));
  const daysSelected = useSignalValue(durationDaysState);
  const safetyNet = useSignalValue(setAsideState);

  if (safetyNet === 0) return null;

  if (!safetyNetViolatedDayByDay)
    return (
      <div className="text-center">
        <SafetyNetIcon /> Safety Net: over{" "}
        {formatDuration({ days: daysSelected })}
        <Info
          infobody={
            <>
              While your balance seems to have a downward trend, we have not
              projected far enough out to report when your <SafetyNetIcon />{" "}
              Safety Net will be violated.
            </>
          }
        >
          <FontAwesomeIcon icon={faCircleQuestion} />
        </Info>
      </div>
    );

  const safetyNetEndDate = fromStringToDate(safetyNetViolatedDayByDay.date);

  return (
    <div className="text-center">
      <SafetyNetIcon /> Safety Net:{" "}
      {startDate < safetyNetEndDate
        ? formatDistance(startDate, safetyNetEndDate)
        : "none"}{" "}
      <Info
        infobody={
          <>
            Your balance is projected to violate your <SafetyNetIcon /> Safety
            net on{" "}
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
        <FontAwesomeIcon icon={faCircleQuestion} />
      </Info>
    </div>
  );
};

const ZeroViolated = () => {
  const zeroViolatedDayByDay = useSignalValue(zeroViolatedDayByDayState);
  const startDate = fromStringToDate(useSignalValue(startDateState));
  const daysSelected = useSignalValue(durationDaysState);

  if (!zeroViolatedDayByDay)
    return (
      <div className="text-center">
        Balance gone: over {formatDuration({ days: daysSelected })}
        <Info
          infobody={
            <>
              While your balance seems to have a downward trend, we have not
              projected far enough out to report when you will run out of money.
            </>
          }
        >
          <FontAwesomeIcon icon={faCircleQuestion} />
        </Info>
      </div>
    );

  const balanceEndDate = fromStringToDate(zeroViolatedDayByDay.date);

  return (
    <div className="text-center">
      Balance gone:{" "}
      {startDate < balanceEndDate
        ? formatDistance(startDate, balanceEndDate)
        : "none"}{" "}
      <Info
        infobody={
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
        <FontAwesomeIcon icon={faCircleQuestion} />
      </Info>
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
