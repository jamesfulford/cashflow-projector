import {
  IApiTransaction,
  deferTransaction,
  renameTransaction,
  revalueTransaction,
  skipTransaction,
  transactionsState,
} from "../../../store/transactions";

import type { AgGridReact, AgGridReactProps } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.min.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.min.css"; // Theme
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Currency,
  CurrencyColorless,
} from "../../../components/currency/Currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";

import { GridApi } from "ag-grid-community";
import { chartSelectedDateState } from "../../../store/dates";
import { useSignalValue } from "../../../store/useSignalValue";
import { AgGrid } from "../../../components/AgGrid";
import { selectedRuleIDState } from "../../../store/selectedRule";
import { CustomCurrencyCellEditor } from "../../../components/AgGridCurrencyInput";
import { todayState } from "../../../store/reconcile";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import Dropdown from "react-bootstrap/esm/Dropdown";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { longFormatDate } from "../../../components/date/formatDate";
import { AppTooltip } from "../../../components/Tooltip";

export const TransactionsContainer = () => {
  const transactions = useSignalValue(transactionsState);
  const todayDate = useSignalValue(todayState);
  const columns: AgGridReactProps["columnDefs"] = useMemo(
    (): AgGridReactProps["columnDefs"] => [
      {
        field: "day",
        headerName: "Date",
        sortable: false,
        filter: "agDateColumnFilter",
        filterParams: {
          minValidDate: transactions.at(0)?.day,
          maxValidDate: transactions.at(-1)?.day,
          buttons: ["clear"],
        },

        cellRenderer: ({ data: transaction }: { data: IApiTransaction }) => {
          return (
            <div className="d-flex align-items-center">
              <AppTooltip
                content={
                  <>
                    {longFormatDate(transaction.day)}
                    <br />
                    (double-click to reschedule)
                  </>
                }
              >
                <span style={{ cursor: "pointer" }}>
                  <DateDisplay date={transaction.day} simple />
                </span>
              </AppTooltip>
              {transaction.exceptionalTransactionID !== undefined && (
                <AppTooltip content={<>Exceptional transaction</>}>
                  <FontAwesomeIcon
                    icon={faExclamationCircle}
                    style={{ paddingLeft: 8, color: "var(--gray-text)" }}
                  />
                </AppTooltip>
              )}
              {transaction.isLastPayment && (
                <AppTooltip content={<>Final payment</>}>
                  <span style={{ paddingLeft: 8 }}>🎉</span>
                </AppTooltip>
              )}
            </div>
          );
        },

        editable: true,
        cellEditor: "agDateStringCellEditor",
        cellEditorParams: {
          min: transactions.at(0)?.day,
        },
        onCellValueChanged: ({ oldValue, newValue, data: transaction }) => {
          const oldTransaction: IApiTransaction = {
            ...transaction,
            day: oldValue, // ag-grid mutates this value before calling
          };
          deferTransaction(oldTransaction, newValue);
        },

        suppressMovable: true,
        flex: 1,
      },
      {
        field: "name",
        headerName: "Name",
        filter: "agTextColumnFilter",
        sortable: false,
        suppressMovable: true,

        cellRenderer: ({ data }: { data: IApiTransaction }) => {
          return (
            <AppTooltip content={<>(double-click to edit)</>}>
              <span style={{ cursor: "pointer" }}>{data.name}</span>
            </AppTooltip>
          );
        },

        editable: true,
        cellEditor: "agStringCellEditor",
        onCellValueChanged: ({ newValue, data: transaction }) => {
          renameTransaction(transaction, newValue);
        },

        flex: 2,
      },
      {
        field: "value",
        headerName: "Amount",

        sortable: false,
        suppressMovable: true,
        cellRenderer: ({ data }: { data: IApiTransaction }) => {
          return (
            <AppTooltip content={<>(double-click to edit)</>}>
              <span style={{ cursor: "pointer" }}>
                <Currency value={data.value} />
              </span>
            </AppTooltip>
          );
        },
        type: "rightAligned",

        editable: true,
        cellEditor: CustomCurrencyCellEditor,
        cellEditorPopup: true,
        cellEditorParams: {
          defaultIsPositive: false, // if a transaction is 0, for some reason, then assume it to be an expense
        },
        onCellValueChanged: ({ newValue, data: transaction }) => {
          revalueTransaction(transaction, newValue);
        },

        flex: 1,
      },
      {
        field: "calculations.balance",
        headerName: "Balance",

        sortable: false,
        suppressMovable: true,
        cellRenderer: CurrencyColorless,
        type: "rightAligned",
        flex: 1,
      },
      {
        colId: "Actions",
        headerName: "Actions",
        sortable: false,
        suppressMovable: true,
        cellRenderer: ({
          data: transaction,
        }: {
          data: IApiTransaction;
          node: { rowIndex: number };
          api: GridApi;
        }) => {
          return (
            <div
              className="d-flex align-items-center"
              style={{ height: "100%" }}
            >
              <AppTooltip content={<>Skip transaction</>}>
                <FontAwesomeIcon
                  icon={faXmark}
                  style={{ padding: 4, margin: 4, cursor: "pointer" }}
                  onClick={() => {
                    skipTransaction(transaction);
                  }}
                />
              </AppTooltip>
            </div>
          );
        },
        // TODO: after moving the download button, can set this much smaller.
        width: 150,
      },
    ],
    [transactions],
  );

  const gridRef = useRef<AgGridReact<IApiTransaction>>();
  const exportCSV = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: "transactions.csv",
      processCellCallback: (params) => {
        // Check if the value is a number and round it to 2 decimal places
        if (typeof params.value === "number") {
          return Math.round(params.value * 100) / 100;
        }
        return params.value;
      },
      columnKeys: gridRef.current?.api
        .getColumns()
        ?.map((c) => c.getColId())
        // exclude "Actions" column
        .filter((id) => id !== "Actions"),
    });
  }, []);

  useEffect(() => {
    let isFirstInvocation = true;
    return chartSelectedDateState.subscribe((d) => {
      if (isFirstInvocation) {
        isFirstInvocation = false;
        return;
      }
      if (!d) return;

      // a day was selected in the chart

      const index = transactions.findIndex((t) => t.day >= d);
      if (index < 0) return;
      // row exists for day in the chart (usually the case)

      if (!gridRef.current) return;
      const api = gridRef.current.api;
      // grid is rendered (usually the case)

      api.ensureIndexVisible(index, "middle"); // scrolls

      const node = api.getRowNode(index as unknown as string); // it's OK to pass a number; types are wrong.
      if (!node) return;
      // row *really* exists for index (should always be the case)

      api.flashCells({ rowNodes: [node], flashDuration: 1000 }); // flash
    });
  }, [transactions]);

  return (
    <div
      className="ag-theme-quartz p-0 pt-2"
      style={{
        position: "relative",
        overflowY: "auto",
        height: "40vh",
      }}
      id="transactions-container"
    >
      <Suspense>
        <AgGrid
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={gridRef as any}
          rowData={transactions}
          columnDefs={columns}
          rowHeight={35}
          headerHeight={35}
          onRowClicked={({ data }) => {
            const transaction = data as IApiTransaction;
            selectedRuleIDState.value = transaction.rule_id;
          }}
          getRowStyle={({ data }) => {
            if (data.day < todayDate)
              return {
                backgroundColor: "rgba(var(--bs-warning-rgb), 0.2)",
                opacity: 1,
              };
            return undefined;
          }}
          icons={{
            // fa fa-filter with width:1rem added by hand
            menu: '<svg style="width: 1rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>',
          }}
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
        <Dropdown.Toggle variant="outline-secondary" size="sm" title="Download">
          <FontAwesomeIcon icon={faDownload} style={{ cursor: "pointer" }} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <AppTooltip content={<>Can open in Excel</>}>
            <Dropdown.Item onClick={exportCSV}>Download CSV</Dropdown.Item>
          </AppTooltip>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
