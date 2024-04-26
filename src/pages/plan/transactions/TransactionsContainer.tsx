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
import Button from "react-bootstrap/esm/Button";
import {
  Currency,
  CurrencyColorless,
} from "../../../components/currency/Currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import { faFileCsv } from "@fortawesome/free-solid-svg-icons/faFileCsv";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";

import Tippy, { useSingleton } from "@tippyjs/react";
import { GridApi } from "ag-grid-community";
import { chartSelectedDateState } from "../../../store/dates";
import { useSignalValue } from "../../../store/useSignalValue";
import { AgGrid } from "../../../components/AgGrid";
import { selectedRuleIDState } from "../../../store/selectedRule";
import { CustomCurrencyCellEditor } from "../../../components/AgGridCurrencyInput";
import { todayState } from "../../../store/reconcile";

export const TransactionsContainer = () => {
  const transactions = useSignalValue(transactionsState);
  const todayDate = useSignalValue(todayState);
  const [source, target] = useSingleton();
  const columns: AgGridReactProps["columnDefs"] = useMemo(
    (): AgGridReactProps["columnDefs"] => [
      {
        field: "day",
        headerName: "Transaction date",
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
              <Tippy
                content={<>(double-click to reschedule)</>}
                singleton={target}
              >
                <span style={{ cursor: "pointer" }}>{transaction.day}</span>
              </Tippy>
              {transaction.exceptionalTransactionID !== undefined && (
                <Tippy
                  content={<>Exceptional transaction</>}
                  singleton={target}
                >
                  <FontAwesomeIcon
                    icon={faExclamationCircle}
                    style={{ paddingLeft: 8, color: "var(--gray-text)" }}
                  />
                </Tippy>
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
            <Tippy content={<>(double-click to edit)</>} singleton={target}>
              <span style={{ cursor: "pointer" }}>{data.name}</span>
            </Tippy>
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
            <Tippy content={<>(double-click to edit)</>} singleton={target}>
              <span style={{ cursor: "pointer" }}>
                <Currency value={data.value} />
              </span>
            </Tippy>
          );
        },

        editable: true,
        cellEditor: CustomCurrencyCellEditor,
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
        flex: 1,
      },
      {
        field: "calculations.working_capital",
        headerName: "Free to spend",

        sortable: false,
        suppressMovable: true,
        cellRenderer: CurrencyColorless,
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
              <Tippy content={<>Skip transaction</>} singleton={target}>
                <FontAwesomeIcon
                  icon={faXmark}
                  style={{ padding: 4, margin: 4, cursor: "pointer" }}
                  onClick={() => {
                    skipTransaction(transaction);
                  }}
                />
              </Tippy>
            </div>
          );
        },
        flex: 1,
      },
    ],
    [transactions, target],
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
        height: "45vh",
      }}
    >
      <Tippy singleton={source} />
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
        />
      </Suspense>
      <Button
        variant="outline-secondary"
        size="sm"
        style={{
          position: "absolute",
          top: 12,
          right: 5,
          zIndex: 1,
        }}
        onClick={exportCSV}
        title="Export to CSV"
      >
        <FontAwesomeIcon icon={faFileCsv} style={{ cursor: "pointer" }} />
      </Button>
    </div>
  );
};
