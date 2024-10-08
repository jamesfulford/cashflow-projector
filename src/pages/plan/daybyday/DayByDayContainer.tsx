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
import { Summary } from "../summary/Summary";

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

    height: "92%",
    top: "2%",
  },
  legend: {
    position: "in",
  },

  hAxis: {
    format: "MMM ''yy",
    gridlines: {
      count: 0,
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
  checking: number;
  freeToSpend: number;
  isDownward: boolean;
}

function makeTooltip({
  checking,
  freeToSpend,
  today,
  setAside,
  isDownward,
}: TooltipContext) {
  return `<div style="white-space: nowrap; font-size: 1rem;" class="p-1">
    <strong>
      ${formatDate(today)}<br />
      <span style="color: ${checkingColor}">Total balance:</span>&nbsp;${formatCurrency(checking)}<br />
      ${isDownward ? "" : `<span style="color: ${freeToSpendColor}">Free balance:</span>&nbsp;${formatCurrency(freeToSpend - setAside)}`}
    </strong>
    ${isDownward || setAside === 0 ? "" : `<br /><em style="margin-left: 8px;">+ Safety Net:</em>&nbsp;<strong>${formatCurrency(freeToSpend)}</strong>`}
  </div>`;
}
function makeSafetyNetTooltip({
  setAside,
  freeToSpend,
  checking: checking,
  today,
  isDownward,
}: TooltipContext) {
  return `<div style="white-space: nowrap; font-size: 1rem;" class="p-1">
    <strong>
    ${formatDate(today)}<br />
      <span style="color: ${safetyNetColor}">Safety Net:</span>&nbsp;${formatCurrency(setAside)}<br />
    </strong>
    ${
      checking < setAside
        ? `<span style="color: var(--red)">(total balance is below your Safety Net)</span>`
        : freeToSpend < setAside && !isDownward
          ? `<span style="color: var(--red)">(free balance is below your Safety Net)</span>`
          : ""
    }
  </div>`;
}

const checkingColor = "#466CE0"; // $blue
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headers: any[] = ["Day"];
  if (setAside) {
    headers.push("Safety Net");
    headers.push({ role: "tooltip", type: "string", p: { html: true } });
  }
  headers.push("Total balance");
  headers.push({ role: "tooltip", type: "string", p: { html: true } });
  if (!isDownward) {
    headers.push("Free balance");
    headers.push({ role: "tooltip", type: "string", p: { html: true } });
  }

  const safetyNetSeriesProps = {
    type: "line",
    // Safety Net
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
  };
  const checkingSeriesProps = {
    type: "line",
    // Checking
    color: checkingColor,

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
  };
  const freeToSpendSeriesProps = {
    type: "line",
    // Uncomitted funds
    // (series omitted if downward)
    color: freeToSpendColor,
    lineWidth: 3,
  };
  const series = [];
  if (setAside !== 0) series.push(safetyNetSeriesProps);
  series.push(checkingSeriesProps);
  if (!isDownward) series.push(freeToSpendSeriesProps);

  const disposableIncomeData = [
    headers,
    ...daybyday.map((candle) => {
      const today = candle.date;
      const checking = Number(candle.balance.low);
      const freeToSpend = Number(candle.working_capital.low) + setAside;
      const context: TooltipContext = {
        checking,
        freeToSpend,
        setAside,
        today,
        isDownward,
      };

      const tooltip = makeTooltip(context);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row: any[] = [new Date(today)];
      if (setAside !== 0) {
        row.push(setAside);
        row.push(makeSafetyNetTooltip(context));
      }
      row.push(checking);
      row.push(makeTooltip(context));
      if (!isDownward) {
        row.push(freeToSpend);
        row.push(tooltip);
      }
      return row;
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
        legend: {
          ...options.legend,
          alignment: isDownward ? "end" : "start",
        },
        series,
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
    <div id="daybydaysection">
      <Summary />
      <div
        style={{
          height: props.height,
          position: "relative",
        }}
        className="ph-no-capture"
        id="day-by-day-container"
      >
        <DayByDayContainerPure {...props} />
      </div>
    </div>
  );
};
