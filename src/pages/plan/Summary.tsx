import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";
import { Info } from "../../components/Info";
import { Currency } from "../../components/currency/Currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  balanceWillZeroState,
  freeToSpendState,
  startDateState,
} from "../../store/parameters";
import Card from "react-bootstrap/esm/Card";
import { useSignalValue } from "../../store/useSignalValue";
import { computedDayByDays } from "../../store/daybydays";
import { computed } from "@preact/signals-core";
import { formatDistance } from "date-fns/formatDistance";
import {
  fromDateToString,
  fromStringToDate,
} from "../../services/engine/rrule";
import { addYears } from "date-fns/addYears";

const FreeToSpend = () => {
  const freeToSpend = useSignalValue(freeToSpendState);
  const balanceWillZero = useSignalValue(balanceWillZeroState);

  return (
    <div className="text-center">
      Today: <Currency value={freeToSpend} />{" "}
      <Info
        infobody={
          <>
            Based on your expected income and expenses, your{" "}
            <strong>free-to-spend balance</strong> (lowest future balance) is{" "}
            {freeToSpend > 0 ? "above" : "below"} your safety net by{" "}
            <Currency value={freeToSpend} />.
            {freeToSpend < 0 ? (
              <>
                <br />
                <br />
                Consider transferring money from savings accounts, cutting
                costs, or delaying expenses to avoid{" "}
                {balanceWillZero ? (
                  <>running out of money.</>
                ) : (
                  <>dipping into your safety net.</>
                )}
              </>
            ) : null}
          </>
        }
      >
        <FontAwesomeIcon icon={faCircleQuestion} />
      </Info>
    </div>
  );
};

const dateSetAsideMetState = computed(() => {
  const dbdAbove = computedDayByDays.value.find(
    (d) => d.working_capital.open > 0,
  );
  if (!dbdAbove) return;
  return dbdAbove.date;
});
const distanceToSetAsideState = computed(() => {
  if (!dateSetAsideMetState.value) return;
  if (startDateState.value === dateSetAsideMetState.value) return;
  return formatDistance(
    fromStringToDate(startDateState.value),
    fromStringToDate(dateSetAsideMetState.value),
  );
});

const TimeToMeetSetAside = () => {
  const dateSetAsideMet = useSignalValue(dateSetAsideMetState);
  const distanceToSetAside = useSignalValue(distanceToSetAsideState);

  return (
    <div className="text-center">
      Safety net:{" "}
      {distanceToSetAside ? (
        <span style={{ color: "var(--red)" }}>{distanceToSetAside}</span>
      ) : (
        <span style={{ color: "var(--primary)" }}>built</span>
      )}
      .{" "}
      {distanceToSetAside ? (
        <Info
          infobody={
            <>
              Based on your expected income and expenses, you will build your
              safety net on {dateSetAsideMet}.
            </>
          }
        >
          <FontAwesomeIcon icon={faCircleQuestion} />
        </Info>
      ) : null}
    </div>
  );
};

const oneYearFromStartDateState = computed(() =>
  fromDateToString(addYears(fromStringToDate(startDateState.value), 1)),
);
const freeToSpendInAYearState = computed(() => {
  const endDate = oneYearFromStartDateState.value;
  const dbd =
    computedDayByDays.value.find((d) => d.date >= endDate) ??
    computedDayByDays.value.at(-1);
  if (!dbd) return 0; // nothing should be showing in this case...
  return dbd.working_capital.close;
});
const FreeToSpendInAYear = () => {
  const freeToSpendInAYear = useSignalValue(freeToSpendInAYearState);
  const oneYearFromStartDate = useSignalValue(oneYearFromStartDateState);
  return (
    <div className="text-center">
      1 year: <Currency value={freeToSpendInAYear} />{" "}
      <Info
        infobody={
          <>
            Based on your expected income and expenses, will have{" "}
            <Currency value={freeToSpendInAYear} /> free to spend on{" "}
            {oneYearFromStartDate}.
          </>
        }
      >
        <FontAwesomeIcon icon={faCircleQuestion} />
      </Info>
    </div>
  );
};
export const Summary = () => {
  return (
    <Card className="mb-2">
      <Card.Body className="p-1 d-flex justify-content-around">
        <FreeToSpend />
        <TimeToMeetSetAside />
        <FreeToSpendInAYear />
      </Card.Body>
    </Card>
  );
};
