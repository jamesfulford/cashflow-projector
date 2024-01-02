import { useCallback } from "react";
import { IApiDayByDay } from "../../../services/DayByDayService";
import { IParameters } from "../../../services/ParameterService";
import { durationDaysState } from "../../../store";

function getComputedDurationDays(
  startDate: string,
  minimumEndDate: string,
): number | undefined {
  if (minimumEndDate) {
    const start = new Date(startDate);
    const computedEndDate = new Date(minimumEndDate);
    return Math.round(
      (computedEndDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
}

export const DurationSelector = ({
  daybydays,
  startDate,
}: {
  daybydays: IApiDayByDay;
  startDate: IParameters["startDate"];
}) => {
  const setQueryRangeDays = useCallback((computedDurationDays: number) => {
    durationDaysState.value = computedDurationDays;
  }, []);

  const computedDurationDays = getComputedDurationDays(
    startDate,
    daybydays.params.minimumEndDate,
  );

  return (
    <div className="text-center">
      {[
        { days: 90, display: "3m", danger: false },
        { days: 180, display: "6m", danger: false },
        { days: 365, display: "1y", danger: false },
        { days: 365 * 2, display: "2y", danger: false },
        { days: 365 * 3, display: "3y", danger: false },
        { days: 365 * 4, display: "4y", danger: false },
        { days: 365 * 5, display: "5y", danger: false },
        { days: 365 * 10, display: "15y", danger: true },
        { days: 365 * 30, display: "30y", danger: true },
      ]
        .filter(({ days }) => {
          if (!computedDurationDays) {
            return true;
          }
          return days > computedDurationDays;
        })
        .map(({ days, display, danger }) => {
          return (
            <button
              key={days}
              className="button-secondary mr-1"
              style={{ ...(danger && { color: "var(--red)" }) }}
              onClick={() => {
                setQueryRangeDays(days);
              }}
            >
              {display}
            </button>
          );
        })}
      <br />
    </div>
  );
};
