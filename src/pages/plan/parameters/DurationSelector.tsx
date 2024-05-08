import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import {
  durationDaysDisplayState,
  durationDaysState,
} from "../../../store/displayDateRange";
import { useSignalValue } from "../../../store/useSignalValue";

export const DurationSelector = () => {
  const queryRange = useSignalValue(durationDaysState);

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
              durationDaysState.value = days;
              durationDaysDisplayState.value = display;
            }}
          >
            {display}
          </Button>
        );
      })}
    </InputGroup>
  );
};
