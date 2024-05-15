import { IApiTransaction } from "../../../store/transactions";

import type { AgGridReact, AgGridReactProps } from "ag-grid-react"; // React Grid Logic
import { Suspense, useCallback, useMemo, useRef } from "react";
import {
  Currency,
  CurrencyColorless,
} from "../../../components/currency/Currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AgGrid } from "../../../components/AgGrid";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import Dropdown from "react-bootstrap/esm/Dropdown";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { computed } from "@preact/signals-core";
import { computedDayByDays } from "../../../store/daybydays";
import { displayEndDateState } from "../../../store/displayDateRange";
import { useSignalValue } from "../../../store/useSignalValue";
import { formatDistance } from "date-fns/formatDistance";
import { fromStringToDate } from "../../../services/engine/rrule";
import Button from "react-bootstrap/esm/Button";
import { registerSupportFor } from "../../../services/vote";
import { AppTooltip } from "../../../components/Tooltip";

interface FreeToSpendIncrease {
  date: string;
  increase: number;
  total: number;
  lastIncreaseDate: string;
}
const freeToSpendIncreasesState = computed(() => {
  const daybydays = computedDayByDays.value;
  const increases: FreeToSpendIncrease[] = [];
  let lastFTS = daybydays[0].working_capital.open;
  let lastFTSDate = daybydays[0].date;
  daybydays.forEach((dbd) => {
    const fts = dbd.working_capital.close;
    if (fts !== lastFTS) {
      const increase = fts - lastFTS;
      increases.push({
        date: dbd.date,
        increase,
        total: fts,
        lastIncreaseDate: lastFTSDate,
      });
      lastFTS = fts;
      lastFTSDate = dbd.date;
    }
  });

  return increases;
});
const visibleFreeToSpendIncreases = computed(() => {
  const displayEndDateValue = displayEndDateState.value;
  return freeToSpendIncreasesState.value.filter(
    (d) => d.date <= displayEndDateValue,
  );
});
export const FreeToSpendContainer = () => {
  const freeToSpendIncreases = useSignalValue(visibleFreeToSpendIncreases);
  const columns: AgGridReactProps["columnDefs"] = useMemo(
    (): AgGridReactProps["columnDefs"] => [
      {
        field: "day",
        headerName: "Date",
        sortable: false,

        cellRenderer: ({ data }: { data: FreeToSpendIncrease }) => {
          return (
            <>
              <DateDisplay date={data.date} simple /> (
              {formatDistance(
                fromStringToDate(data.lastIncreaseDate),
                fromStringToDate(data.date),
              )}{" "}
              later)
            </>
          );
        },

        suppressMovable: true,
        width: 220,
      },
      {
        field: "increase",
        headerName: "Increase",

        sortable: false,
        suppressMovable: true,
        cellRenderer: Currency,
        type: "rightAligned",

        width: 200,
      },
      {
        field: "total",
        headerName: "Free to spend",

        sortable: false,
        suppressMovable: true,
        cellRenderer: CurrencyColorless,
        type: "rightAligned",

        width: 200,
      },
    ],
    [],
  );

  const gridRef = useRef<AgGridReact<IApiTransaction>>();
  const exportCSV = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: "free-to-spend.csv",
      processCellCallback: (params) => {
        // Check if the value is a number and round it to 2 decimal places
        if (typeof params.value === "number") {
          return Math.round(params.value * 100) / 100;
        }
        return params.value;
      },
      columnKeys: gridRef.current?.api.getColumns()?.map((c) => c.getColId()),
    });
  }, []);

  return (
    <>
      <div
        style={{ height: "5vh" }}
        className="d-flex justify-content-start pt-1 pb-1"
      >
        <Button
          onClick={() => {
            alert(
              `Thank you for clicking! We're still considering creating this feature, and your click helps us know what you would find useful.`,
            );
            registerSupportFor("save_for_large_purchase");
          }}
        >
          Save for large purchase
        </Button>
        <Button
          onClick={() => {
            alert(
              `Thank you for clicking! We're still considering creating this feature, and your click helps us know what you would find useful.`,
            );
            registerSupportFor("build_emergency_fund");
          }}
          style={{ marginLeft: 20 }}
        >
          Build emergency fund
        </Button>
        <Button
          onClick={() => {
            alert(
              `Thank you for clicking! We're still considering creating this feature, and your click helps us know what you would find useful.`,
            );
            registerSupportFor("pay_off_loans");
          }}
          style={{ marginLeft: 20 }}
        >
          Pay off loan(s)
        </Button>
        <Button
          onClick={() => {
            alert(
              `Thank you for clicking! We're still considering creating this feature, and your click helps us know what you would find useful.`,
            );
            registerSupportFor("invest");
          }}
          style={{ marginLeft: 20 }}
        >
          Invest
        </Button>
        <Button
          onClick={() => {
            alert(
              `Thank you for clicking! We're still considering creating this feature, and your click helps us know what you would find useful.`,
            );
            registerSupportFor("retire_early");
          }}
          style={{ marginLeft: 20 }}
        >
          Retire early
        </Button>
      </div>
      <div
        className="ag-theme-quartz p-0 pt-2"
        style={{
          position: "relative",
          overflowY: "auto",
          height: "30vh",
        }}
      >
        <Suspense>
          <AgGrid
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={gridRef as any}
            rowData={freeToSpendIncreases}
            columnDefs={columns}
            rowHeight={35}
            headerHeight={35}
          />
        </Suspense>
        <Dropdown
          style={{
            position: "absolute",
            top: 12,
            right: 25,
            zIndex: 1,
          }}
        >
          <Dropdown.Toggle
            variant="outline-secondary"
            size="sm"
            title="Download"
          >
            <FontAwesomeIcon icon={faDownload} style={{ cursor: "pointer" }} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <AppTooltip content={<>Can open in Excel</>}>
              <Dropdown.Item onClick={exportCSV}>Download CSV</Dropdown.Item>
            </AppTooltip>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </>
  );
};
