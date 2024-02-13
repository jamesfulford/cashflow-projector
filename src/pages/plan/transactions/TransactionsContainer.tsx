import { IApiTransaction } from "../../../services/TransactionsService";

import { AgGridReact, AgGridReactProps } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { useCallback, useMemo, useRef } from "react";
import Button from "react-bootstrap/Button";
import {
  Currency,
  CurrencyColorless,
} from "../../../components/currency/Currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";

export const TransactionsContainer = ({
  transactions,
}: {
  transactions: IApiTransaction[];
}) => {
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
        flex: 2,
      },
      {
        field: "value",
        headerName: "Amount",
        sortable: false,
        suppressMovable: true,
        cellRenderer: Currency,
        resizable: false,
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
    });
  }, []);

  return (
    <div
      className="ag-theme-quartz p-0 pt-2"
      style={{
        position: "relative",
        overflowY: "auto",
        height: "45vh",
      }}
    >
      <AgGridReact
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={gridRef as any}
        rowData={transactions}
        columnDefs={columns}
        rowHeight={35}
        headerHeight={35}
      />
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
