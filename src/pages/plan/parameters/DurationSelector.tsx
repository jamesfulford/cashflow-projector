import { useCallback, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { durationDaysState } from "../../../store/displayDateRange";

export const DurationSelector = () => {
  const [queryRange, setQueryRange] = useState(durationDaysState.peek());
  const setQueryRangeDays = useCallback((computedDurationDays: number) => {
    durationDaysState.value = computedDurationDays;
    setQueryRange(computedDurationDays);
  }, []);

  return (
    <InputGroup className="justify-content-end" id="duration-selector">
      {[
        { days: 90, display: "3m" },
        { days: 180, display: "6m" },
        { days: 365, display: "1y" },
        { days: 365 * 2, display: "2y" },
        { days: 365 * 5, display: "5y" },
      ].map(({ days, display }) => {
        const selected = days === queryRange;
        return (
          <Button
            key={days}
            variant={selected ? "primary" : "outline-primary"}
            className="mr-1"
            onClick={() => {
              setQueryRangeDays(days);
            }}
          >
            {display}
          </Button>
        );
      })}
    </InputGroup>
  );
};
