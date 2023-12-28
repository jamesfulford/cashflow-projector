import { Transaction } from "./Transaction";
import { useSelector } from "react-redux";
import { getTransactions } from "../../../store/reducers/transactions/getters";
import { getParameters } from "../../../store/reducers/parameters/getters";
import {
  IApiTransaction,
} from "../../../services/TransactionsService";

export function limitShownTransactions(
  transactions: IApiTransaction[],
): IApiTransaction[] {
  return transactions.slice(0, 50);
}

export const TransactionsContainer = () => {
  const {
    transactions: { data, loading, error },
    parameters,
  } = useSelector((state) => ({
    transactions: getTransactions(state as any),
    parameters: getParameters(state as any),
  }));

  // const downloadCsv = useCallback(async () => {
  //   const exportUrl = TransactionsService.exportTransactionsUrl(parameters);
  //   const response = await axios.get(exportUrl);
  //   const file = new Blob([response.data], {
  //     type: response.headers["Content-Type"],
  //   });
  //   const link = document.createElement("a");
  //   link.href = window.URL.createObjectURL(file);
  //   link.download = "Solomon Export.csv";
  //   link.click();
  //   link.remove();
  // }, [parameters]);

  if (loading) {
    return (
      <div className="spinner-border" role="status">
        <span
          data-testid="transactions-loading"
          className="visually-hidden"
        ></span>
      </div>
    );
  }

  if (error) {
    return (
      <p data-testid="transactions-error">
        Error occurred while fetching transactions! Try refreshing the page.
      </p>
    );
  }

  const tableData = limitShownTransactions(data);

  if (tableData.length === 0) {
    return (
      <p data-testid="transactions-empty">
        Sorry, it looks like you don't have any transactions. Try setting up a
        new rule.
      </p>
    );
  }

  return (
    <div data-testid="transactions-showing" className="table-responsive">
      {/* <div className="text-right mb-1">
        <button className="btn btn-link" onClick={downloadCsv}>
          Download CSV
        </button>
      </div> */}
      <table className="table table-sm" style={{ color: "white" }}>
        <thead>
          <tr>
            <th>Day</th>
            <th>Name</th>
            <th>Value</th>
            <th>Balance</th>
            <th>Disposable Income</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((transaction) => (
            <Transaction transaction={transaction} key={transaction.id} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
