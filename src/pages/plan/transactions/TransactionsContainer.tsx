import { Transaction } from "./Transaction";
import { IApiTransaction } from "../../../services/TransactionsService";
import Table from "react-bootstrap/esm/Table";

import { AgGridReact, AgGridReactProps } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { useCallback, useMemo, useRef } from "react";
import { Button } from "react-bootstrap";
import { Currency } from "../../../components/currency/Currency";
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
        headerName: "Day",
        sortable: false,
        filter: "agDateColumnFilter",
        filterParams: {
          minValidDate: transactions[0].day,
          maxValidDate: transactions[transactions.length - 1].day,
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
        cellRenderer: Currency,
        resizable: false,
        flex: 1,
      },
      {
        field: "calculations.working_capital",
        headerName: "Savings",
        sortable: false,
        suppressMovable: true,
        cellRenderer: Currency,
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
      className="ag-theme-quartz p-0 mt-2 mb-0"
      style={{
        position: "relative",
        overflowY: "auto",
        height: "40vh",
      }}
    >
      <AgGridReact
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={gridRef as any}
        rowData={transactions}
        columnDefs={columns}
        rowHeight={35}
      />
      <Button
        variant="outline-secondary"
        size="sm"
        style={{
          position: "absolute",
          top: 5,
          right: 10,
          zIndex: 1,
        }}
        onClick={exportCSV}
        title="Export to CSV"
      >
        <FontAwesomeIcon icon={faFileCsv} />
      </Button>
    </div>
  );

  if (tableData.length === 0) {
    return (
      <p data-testid="transactions-empty">
        Sorry, it looks like you don't have any transactions in this timeframe.
        Try adding a rule or selecting a broader timeframe.
      </p>
    );
  }

  return (
    <div
      data-testid="transactions-showing"
      style={{
        overflowY: "auto",
        height: "40vh",
      }}
    >
      <Table striped responsive hover>
        <thead>
          <tr>
            <th>Day</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Balance</th>
            <th>Savings</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((transaction) => (
            <Transaction transaction={transaction} key={transaction.id} />
          ))}
        </tbody>
      </Table>
    </div>
  );
};
