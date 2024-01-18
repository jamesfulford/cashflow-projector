import { useState } from "react";
import Chart from "react-google-charts";
import Container from "react-bootstrap/Container";
import { IApiDayByDay } from "../../../services/DayByDayService";
import { IParameters } from "../../../services/ParameterService";
import { IFlags } from "../../../services/FlagService";
import { DurationSelector } from "../parameters/DurationSelector";

const options = {
  // title: "",
  curveType: "none",
  legend: "none",
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
    baselineColor: "#fff", // makes x-axis line disappear
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
const green = "#61AB8F";
const red = "#DB6B77";

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
  setAside,
  height,
}: {
  daybyday: IApiDayByDay;
  chartType: ChartTab;
  setAside: number;
  height: string;
}) => {
  switch (chartType) {
    case ChartTab.DISPOSABLE_INCOME: {
      const disposableIncomeData = [
        [
          "Day",
          "Safety Net",
          { role: "tooltip", type: "string", p: { html: true } },
          "Balance",
          { role: "tooltip", type: "string", p: { html: true } },
          "Available",
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
          chartType="LineChart"
          width="100%"
          height={height}
          data={disposableIncomeData}
          columns={[{ type: "date" }]}
          options={{
            ...options,
            series: {
              0: {
                // Safety net
                color: red,
                lineDashStyle: [2, 2],
                lineWidth: 1,
              },
              1: {
                // Balance
                color: "#5bc3e5", // light blue
                lineDashStyle: [2, 2],
                lineWidth: 2,
              },
              2: {
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

const DayByDayContainerPure = ({
  flags: { highLowEnabled },
  daybydays,
  parameters: { setAside },
  height,
}: {
  flags: IFlags;
  daybydays: IApiDayByDay;
  parameters: IParameters;
  height: string;
}) => {
  const [chartType, setChartType] = useState<ChartTab>(
    ChartTab.DISPOSABLE_INCOME,
  );

  if (!daybydays?.daybydays.length) {
    return (
      <Container className="text-center">
        <p data-testid="daybyday-empty">Nothing's here...</p>
      </Container>
    );
  }

  const tabs = [ChartTab.DISPOSABLE_INCOME];
  if (highLowEnabled) {
    tabs.push(ChartTab.UNCERTAINTY);
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
                  color: chart === chartType ? "#61AB8F" : "#A5D1C0",
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
        setAside={setAside}
        height={height}
      />
    </>
  );
};

export const DayByDayContainer = (
  props: Parameters<typeof DayByDayContainerPure>[0],
) => {
  return (
    <div
      style={{
        height: props.height,
        position: "relative",
      }}
    >
      <DayByDayContainerPure {...props} />
      <div
        style={{
          position: "absolute",
          top: 5,
          right: 10,
          zIndex: 1,
          backgroundColor: "white",
        }}
      >
        <DurationSelector />
      </div>
    </div>
  );
};
