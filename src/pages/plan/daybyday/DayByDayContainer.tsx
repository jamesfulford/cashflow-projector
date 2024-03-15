import { useState } from "react";
import Chart from "react-google-charts";
import Container from "react-bootstrap/Container";
import {
  IApiDayByDay,
  daybydaysState,
  isBelowSafetyNetState,
} from "../../../store/daybydays";
import { DurationSelector } from "../parameters/DurationSelector";
import { chartSelectedDateState } from "../../../store/dates";
import { highLowEnabledFlag } from "../../../store/flags";
import { setAsideState } from "../../../store/parameters";
import { useSignalValue } from "../../../store/useSignalValue";
import { computed } from "@preact/signals-core";

const options = {
  // title: "",
  curveType: "none",
  legend: {
    position: "in",
  },
  tooltip: {
    isHtml: true,
  },
  focusTarget: "datum",
  theme: "maximized",
  hAxis: {
    format: "MMM ''yy",
    gridlines: {
      units: {
        months: { color: "#eee" },
        days: null,
      },
    },
    minorGridlines: { count: 0 },
  },
  vAxis: {
    baselineColor: "#dcdcdc", // x-axis line
    format: "currency",
    minorGridlines: { count: 0 },
    gridlines: {
      count: 0,
    },
  },
  backgroundColor: "white",
  crosshair: { trigger: "both", orientation: "horizontal", opacity: 0.4 },
};

interface TooltipContext {
  today: string;
  setAside: number;
  balance: number;
  savings: number;
}

function formatCurrency(
  currency: number,
  { withColor } = { withColor: true },
): string {
  const className =
    currency < 0
      ? "currency-negative"
      : currency > 0
        ? "currency-positive"
        : "";
  return `<span class="${withColor ? className : ""}">$${currency.toFixed(
    2,
  )}</span>`;
}
function makeBalanceTooltip({ balance, savings, today }: TooltipContext) {
  return `<div style="width: 200px">
    <strong>${today}</strong> <br />
    Balance: <strong>${formatCurrency(balance)}</strong><br />
    (${formatCurrency(balance - savings, { withColor: false })} locked up)
  </div>`;
}
function makeSavingsTooltip({ savings, setAside, today }: TooltipContext) {
  return `<div style="width: 200px">
    <strong>${today}</strong> <br />
    Savings: <strong>${formatCurrency(savings)}</strong><br />
    (${formatCurrency(savings - setAside, { withColor: false })} free to spend)
  </div>`;
}
function makeSafetyNetTooltip({
  setAside,
  savings,
  balance,
  today,
}: TooltipContext) {
  return `<div style="width: 200px">
    <strong>${today}</strong> <br />
    Safety net of <strong>${formatCurrency(setAside, {
      withColor: false,
    })}</strong> <br />
    ${
      balance < setAside
        ? `<span style="color: var(--red)">(balance is below safety net)</span>`
        : savings < setAside
          ? `<span style="color: var(--red)">(savings are below safety net)</span>`
          : ""
    }
  </div>`;
}

const black = "#A5D1C0";
const green = "#2d8652";
const red = "#d14351";

enum ChartTab {
  DISPOSABLE_INCOME = "Disposable Income",
  UNCERTAINTY = "Uncertainty",
}

// Chart Wishlist
// - explain moves
// - highlight saving for one-time events (how long does it take?)
// - disposable income separate from set_aside in tooltip
// - better x axis markers
// - less coloring overlaps
// - should not be a line chart, should be "steppy" like _| instead of / between points (still same as before)
const DayByDayChart = ({
  daybyday,
  chartType,
  height,
}: {
  daybyday: IApiDayByDay;
  chartType: ChartTab;
  height: string;
}) => {
  const setAside = useSignalValue(setAsideState);
  const isBelowSafetyNet = useSignalValue(isBelowSafetyNetState);
  switch (chartType) {
    case ChartTab.DISPOSABLE_INCOME: {
      const disposableIncomeData = [
        [
          "Day",
          "Safety Net",
          { role: "tooltip", type: "string", p: { html: true } },
          "Balance",
          { role: "tooltip", type: "string", p: { html: true } },
          "Savings",
          { role: "tooltip", type: "string", p: { html: true } },
        ],
        ...daybyday.daybydays.map((candle) => {
          const today = candle.date;
          const balance = Number(candle.balance.low);
          const savings = Number(candle.working_capital.low) + setAside;
          const context = { balance, savings, setAside, today };
          return [
            new Date(today),
            setAside,
            makeSafetyNetTooltip(context),
            balance,
            makeBalanceTooltip(context),
            savings,
            makeSavingsTooltip(context),
          ];
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

                const day = (rowSelected[0] as Date)
                  .toISOString()
                  .split("T")[0];
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
                type: "area",
                // Safety net
                color: red,
                lineDashStyle: [2, 2],
                lineWidth: 1,
                fill: 0.1,
                areaOpacity: isBelowSafetyNet ? 0.15 : 0,
              },
              1: {
                type: "line",
                // Balance
                color: "#5bc3e5", // light blue
                lineDashStyle: [2, 2],
                lineWidth: 2,
              },
              2: {
                type: "line",
                // Disposable income
                color: green,
                lineWidth: 3,
              },
            },
            hAxis: {
              ...options.hAxis,
              // format: "short",
              ticks: [
                ...daybyday.daybydays
                  .map((c) => new Date(c.date))
                  .filter((d) => d.getDate() === 1),
              ],
            },
          }}
        />
      );
    }
    case ChartTab.UNCERTAINTY: {
      const uncertaintyData = [
        ["Day", "90th Percentile", "Expected", "10th Percentile"],
        ...daybyday.daybydays.map((candle) => [
          candle.date,
          candle.high_prediction.low,
          candle.balance.low,
          candle.low_prediction.low,
        ]),
      ];

      return (
        <Chart
          key={Date.now()}
          chartType="LineChart"
          width="100%"
          height={height}
          data={uncertaintyData}
          options={{
            ...options,
            colors: [green, black, red],
          }}
        />
      );
    }
  }
};

const tabsState = computed(() =>
  highLowEnabledFlag.value
    ? [ChartTab.DISPOSABLE_INCOME, ChartTab.UNCERTAINTY]
    : [ChartTab.DISPOSABLE_INCOME],
);
interface DayByDayContainerProps {
  height: string;
}
const DayByDayContainerPure = ({ height }: DayByDayContainerProps) => {
  const [chartType, setChartType] = useState<ChartTab>(
    ChartTab.DISPOSABLE_INCOME,
  );

  const daybydays = useSignalValue(daybydaysState);
  const tabs = useSignalValue(tabsState);

  if (!daybydays?.daybydays.length) {
    return (
      <Container className="text-center">
        <p data-testid="daybyday-empty">Nothing's here...</p>
      </Container>
    );
  }

  return (
    <>
      {tabs.length > 1 && (
        <ul className="nav nav-tabs">
          {tabs.map((chart) => (
            <li className="nav-item" key={chart}>
              <button
                type="button"
                className={"nav-link " + (chart === chartType ? "active" : "")}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setChartType(chart as any)}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0)",
                  color: chart === chartType ? green : black,
                }}
              >
                {chart}
              </button>
            </li>
          ))}
        </ul>
      )}
      <DayByDayChart
        chartType={chartType}
        daybyday={daybydays}
        height={height}
      />
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
      <div
        className="float-duration-controls"
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          zIndex: 1,
          backgroundColor: "white",
        }}
      >
        <DurationSelector />
      </div>
    </div>
  );
};
