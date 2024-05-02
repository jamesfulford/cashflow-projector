import Chart from "react-google-charts";
import Container from "react-bootstrap/esm/Container";
import { daybydaysState } from "../../../store/daybydays";
import { chartSelectedDateState } from "../../../store/dates";
import { setAsideState } from "../../../store/parameters";
import { useSignalValue } from "../../../store/useSignalValue";
import { DayByDay } from "../../../services/engine/daybydays";
import { fromDateToString } from "../../../services/engine/rrule";
import { formatCurrency } from "../../../components/currency/formatCurrency";
import { formatDate } from "../../../components/date/formatDate";
import { isDownwardState } from "../../../store/mode";

// https://developers.google.com/chart/interactive/docs/gallery/areachart
const options = {
  curveType: "none",
  tooltip: {
    isHtml: true,
  },
  focusTarget: "datum",

  // theme: "maximized",
  chartArea: {
    width: "96%",
    left: "4%",

    height: "88%",
    top: "2%",
  },
  legend: {
    position: "in",
  },

  hAxis: {
    format: "MMM ''yy",
    gridlines: {
      units: {
        months: { color: "#eee" },
        days: null,
      },
    },
    minorGridlines: { count: 0 },
    textPosition: "out",
  },
  vAxis: {
    baselineColor: "#dcdcdc", // x-axis line
    format: "short",
    minorGridlines: { count: 0 },
    gridlines: {
      count: 0,
    },
    textPosition: "out",
  },
  backgroundColor: "white",
  crosshair: { trigger: "both", orientation: "vertical", opacity: 0.4 },
};

interface TooltipContext {
  today: string;
  setAside: number;
  balance: number;
  freeToSpend: number;
  isDownward: boolean;
}

function makeTooltip({
  balance,
  freeToSpend,
  today,
  isDownward,
}: TooltipContext) {
  return `<div style="white-space: nowrap; font-size: 1rem;" class="p-1">
    <strong>
      ${formatDate(today)}<br />
      <span style="color: ${balanceColor}">Balance:</span>&nbsp;${formatCurrency(balance)}<br />
      ${isDownward ? "" : `<span style="color: ${freeToSpendColor}">Free to spend:</span>&nbsp;${formatCurrency(freeToSpend)}<br />`}
    </strong>
  </div>`;
}
function makeSafetyNetTooltip({
  setAside,
  freeToSpend,
  balance,
  today,
  isDownward,
}: TooltipContext) {
  return `<div style="white-space: nowrap; font-size: 1rem;" class="p-1">
    <strong>
    ${formatDate(today)}<br />
      <span style="color: ${safetyNetColor}">Safety net:</span>&nbsp;${formatCurrency(setAside)}<br />
    </strong>
    ${
      balance < setAside
        ? `<span style="color: var(--red)">(balance is below safety net)</span>`
        : freeToSpend < setAside && !isDownward
          ? `<span style="color: var(--red)">(free-to-spend balance is below safety net)</span>`
          : ""
    }
  </div>`;
}

const balanceColor = "#466CE0"; // $blue
const freeToSpendColor = "#2d8652"; // $green
const safetyNetColor = "#deb75b"; // $yellow

const DayByDayChart = ({
  daybyday,
  height,
}: {
  daybyday: DayByDay[];
  height: string;
}) => {
  const setAside = useSignalValue(setAsideState);
  const isDownward = useSignalValue(isDownwardState);

  const headers = [
    "Day",
    "Safety net",
    { role: "tooltip", type: "string", p: { html: true } },
    "Balance",
    { role: "tooltip", type: "string", p: { html: true } },
  ];
  if (!isDownward) {
    headers.push("Free to spend");
    headers.push({ role: "tooltip", type: "string", p: { html: true } });
  }

  const disposableIncomeData = [
    headers,
    ...daybyday.map((candle) => {
      const today = candle.date;
      const balance = Number(candle.balance.low);
      const freeToSpend = Number(candle.working_capital.low) + setAside;
      const context: TooltipContext = {
        balance,
        freeToSpend,
        setAside,
        today,
        isDownward,
      };

      const tooltip = makeTooltip(context);

      const row = [
        new Date(today),
        setAside,
        makeSafetyNetTooltip(context),
        balance,
        makeTooltip(context),
      ];
      if (isDownward) return row;
      return [...row, freeToSpend, tooltip];
    }),
  ];
  return (
    <Chart
      key={Date.now()}
      chartType="SteppedAreaChart"
      width="100%"
      height={height}
      data={disposableIncomeData}
      columns={[{ type: "date" }]}
      chartEvents={[
        {
          eventName: "select",
          callback: (event) => {
            // when something is selected on the chart,
            // update the state (so we can scroll to it on the table)
            const selection = event.chartWrapper.getChart().getSelection();
            if (!selection.length) return; // case: if de-selected

            const rowIndex = (selection[0].row as number) + 1; // not sure why this +1 is needed
            const rowSelected = disposableIncomeData.at(rowIndex);
            if (!rowSelected) return;

            const day = fromDateToString(rowSelected[0] as Date);
            chartSelectedDateState.value = day;

            setTimeout(() => {
              // the types are wrong; they don't have a `setSelection` method.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (event.chartWrapper.getChart() as any).setSelection([]);
              chartSelectedDateState.value = undefined;
            }, 1000);
          },
        },
      ]}
      options={{
        ...options,
        series: {
          0: {
            type: "line",
            // Safety net
            color: safetyNetColor,

            ...(!isDownward
              ? {
                  // upward
                  lineDashStyle: [2, 2],
                  lineWidth: 1,
                }
              : {
                  // downward
                  lineWidth: 2,
                }),
          },
          1: {
            type: "line",
            // Balance
            color: balanceColor,

            ...(!isDownward
              ? {
                  // upward
                  lineDashStyle: [2, 2],
                  lineWidth: 2,
                }
              : {
                  // downward
                  lineWidth: 3,
                }),
          },
          2: {
            type: "line",
            // Free to spend
            // (series omitted if downward)
            color: freeToSpendColor,
            lineWidth: 3,
          },
        },
        hAxis: {
          ...options.hAxis,
          // format: "short",
          ticks: [
            ...daybyday
              .map((c) => new Date(c.date))
              .filter((d) => d.getDate() === 1),
          ],
        },
      }}
    />
  );
};

interface DayByDayContainerProps {
  height: string;
}
const DayByDayContainerPure = ({ height }: DayByDayContainerProps) => {
  const daybydays = useSignalValue(daybydaysState);

  if (!daybydays.length) {
    return (
      <Container className="text-center">
        <p data-testid="daybyday-empty">Nothing's here...</p>
      </Container>
    );
  }

  return (
    <>
      <DayByDayChart daybyday={daybydays} height={height} />
    </>
  );
};

export const DayByDayContainer = (props: DayByDayContainerProps) => {
  return (
    <div
      style={{
        height: props.height,
        position: "relative",
      }}
      className="ph-no-capture"
    >
      <DayByDayContainerPure {...props} />
    </div>
  );
};
