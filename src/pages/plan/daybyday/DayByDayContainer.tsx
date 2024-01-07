import { useState } from "react";
import Chart from "react-google-charts";
import Container from "react-bootstrap/Container";
import { DurationSelector } from "../parameters/DurationSelector";
import { IApiDayByDay } from "../../../services/DayByDayService";
import { IParameters } from "../../../services/ParameterService";
import { IFlags } from "../../../services/FlagService";

const options = {
  title: "",
  curveType: "none",
  legend: { position: "top" },
  tooltip: {},
  hAxis: {
    minTextSpacing: 10,
    format: "short",
  },
  chartArea: {
    left: 60,
    width: "100%",
  },
  backgroundColor: "white",
};

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
}: {
  daybyday: IApiDayByDay;
  chartType: ChartTab;
  setAside: number;
}) => {
  console.log("Rerendering DayByDayChart");
  switch (chartType) {
    case ChartTab.DISPOSABLE_INCOME:
      const disposableIncomeData = [
        ["Day", "Balance", "Disposable Income + Set Aside", "Set Aside"],
        ...daybyday.daybydays.map((candle) => [
          candle.date,
          Number(candle.balance.low),
          Number(candle.working_capital.low) + setAside,
          setAside,
        ]),
      ];
      return (
        <Chart
          key={Date.now()}
          chartType="SteppedAreaChart"
          width="100%"
          height="45vh"
          data={disposableIncomeData}
          options={{
            ...options,
            colors: [black, green, red],
          }}
        />
      );
    case ChartTab.UNCERTAINTY:
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
          height="45vh"
          data={uncertaintyData}
          options={{
            ...options,
            colors: [green, black, red],
          }}
        />
      );
  }
};

export const DayByDayContainer = ({
  flags: { highLowEnabled },
  daybydays,
  parameters: { setAside, startDate },
}: {
  flags: IFlags;
  daybydays: IApiDayByDay;
  parameters: IParameters;
}) => {
  console.log("Rerendering DayByDayContainer");
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
      />
      <DurationSelector daybydays={daybydays} startDate={startDate} />
    </>
  );
};
