import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";
import { Info } from "../../../components/Info";
import {
  Currency,
  CurrencyColorless,
} from "../../../components/currency/Currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  balanceWillZeroState,
  freeToSpendState,
  startDateState,
} from "../../../store/parameters";
import { useSignalValue } from "../../../store/useSignalValue";
import { computedDayByDays } from "../../../store/daybydays";
import { computed } from "@preact/signals-core";
import { formatDistance } from "date-fns/formatDistance";
import {
  fromDateToString,
  fromStringToDate,
} from "../../../services/engine/rrule";
import { addYears } from "date-fns/addYears";
import { DateDisplay } from "../../../components/date/DateDisplay";

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
            <strong>free to spend</strong> (lowest future balance) is{" "}
            {freeToSpend > 0 ? "above" : "below"} your safety net by{" "}
            <strong>
              <CurrencyColorless value={freeToSpend} />
            </strong>
            .
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

const SafetyNetStatus = () => {
  const dateSetAsideMet = useSignalValue(dateSetAsideMetState);
  const distanceToSetAside = useSignalValue(distanceToSetAsideState);

  return (
    <div className="text-center">
      Safety net:{" "}
      {distanceToSetAside ? (
        <span>funded in {distanceToSetAside}</span>
      ) : (
        <span style={{ color: "var(--green)" }}>funded</span>
      )}{" "}
      {distanceToSetAside ? (
        <Info
          infobody={
            <>
              Based on your expected income and expenses, you will have fully
              funded your safety net on{" "}
              <DateDisplay date={dateSetAsideMet as string} simple />.
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
      1 year forecast: <Currency value={freeToSpendInAYear} />{" "}
      <Info
        infobody={
          <>
            Based on your expected income and expenses, will have{" "}
            <strong>
              <CurrencyColorless value={freeToSpendInAYear} />
            </strong>{" "}
            free to spend on{" "}
            <strong>
              <DateDisplay date={oneYearFromStartDate} simple />
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

export const UpwardSummary = () => {
  return (
    <>
      <FreeToSpend />
      <SafetyNetStatus />
      <FreeToSpendInAYear />
    </>
  );
};
