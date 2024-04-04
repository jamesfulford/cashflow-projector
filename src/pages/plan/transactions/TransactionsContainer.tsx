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
import {
  faCalendarDays,
  faCreditCard,
  faExclamationCircle,
  faFileCsv,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Tippy, { useSingleton } from "@tippyjs/react";
import { GridApi } from "ag-grid-community";
import {
  chartSelectedDateState,
  lastDeferredToDateState,
} from "../../../store/dates";
import { useSignalValue } from "../../../store/useSignalValue";
import { AgGrid } from "../../../components/AgGrid";
import { selectedRuleIDState } from "../../../store/selectedRule";

export const TransactionsContainer = () => {
  const transactions = useSignalValue(transactionsState);
  const [source, target] = useSingleton();
  const columns: AgGridReactProps["columnDefs"] = useMemo(
    (): AgGridReactProps["columnDefs"] => [
      {
        field: "day",
        headerName: "Transaction Date",
        sortable: false,
        filter: "agDateColumnFilter",
        filterParams: {
          minValidDate: transactions.at(0)?.day,
          maxValidDate: transactions.at(-1)?.day,
          buttons: ["clear"],
        },

        cellRenderer: ({ data: transaction }: { data: IApiTransaction }) => {
          if (transaction.exceptionalTransactionID === undefined)
            return <>{transaction.day}</>;

          return (
            <div className="d-flex align-items-center">
              {transaction.day}
              <Tippy content={<>Exceptional transaction</>} singleton={target}>
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  style={{ paddingLeft: 8, color: "var(--tertiary)" }}
                />
              </Tippy>
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
          lastDeferredToDateState.value = newValue;
        },

        suppressMovable: true,
        resizable: false,
        flex: 1,
      },
      {
        field: "name",
        headerName: "Name",
        filter: "agTextColumnFilter",
        sortable: false,
        suppressMovable: true,
        resizable: false,

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
        cellRenderer: Currency,
        resizable: false,

        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          precision: 2,
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
        resizable: false,
        flex: 1,
      },
      {
        field: "calculations.working_capital",
        headerName: "Savings",
        sortable: false,
        suppressMovable: true,
        cellRenderer: CurrencyColorless,
        resizable: false,
        flex: 1,
      },
      {
        headerName: "Actions",
        sortable: false,
        suppressMovable: true,
        cellRenderer: ({
          data: transaction,
          node: { rowIndex },
          api,
        }: {
          data: IApiTransaction;
          node: { rowIndex: number };
          api: GridApi;
        }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const lastDeferredToDate = useSignalValue(lastDeferredToDateState);
          return (
            <div
              className="d-flex align-items-center"
              style={{ height: "100%" }}
            >
              <Tippy content={<>Change Date</>} singleton={target}>
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  style={{ padding: 4, margin: 4 }}
                  onClick={() => {
                    api.startEditingCell({
                      rowIndex,
                      colKey: "day",
                    });
                  }}
                />
              </Tippy>
              {lastDeferredToDate ? (
                <Tippy
                  content={<>Defer to {lastDeferredToDate}</>}
                  singleton={target}
                >
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    style={{ padding: 4, margin: 4 }}
                    onClick={() => {
                      deferTransaction(transaction, lastDeferredToDate);
                    }}
                  />
                </Tippy>
              ) : (
                <Tippy
                  content={<>Select quick defer date</>}
                  singleton={target}
                >
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    style={{ padding: 4, margin: 4 }}
                    onClick={() => {
                      api.startEditingCell({
                        rowIndex,
                        colKey: "day",
                      });
                    }}
                  />
                </Tippy>
              )}

              <Tippy content={<>Skip</>} singleton={target}>
                <FontAwesomeIcon
                  icon={faXmark}
                  style={{ padding: 4, margin: 4 }}
                  onClick={() => {
                    skipTransaction(transaction);
                  }}
                />
              </Tippy>
            </div>
          );
        },
        resizable: false,
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

      api.flashCells({ rowNodes: [node], flashDelay: 1000 }); // flash
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
        <FontAwesomeIcon icon={faFileCsv} />
      </Button>
    </div>
  );
};
