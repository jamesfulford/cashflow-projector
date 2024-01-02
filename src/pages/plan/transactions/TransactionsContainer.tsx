import { Transaction } from "./Transaction";
import { useSelector } from "react-redux";
import { getTransactions } from "../../../store/reducers/transactions/getters";
import { getParameters } from "../../../store/reducers/parameters/getters";
import { IApiTransaction } from "../../../services/TransactionsService";
import { IParameters } from "../../../services/ParameterService";

export function limitShownTransactions(
  transactions: IApiTransaction[],
): IApiTransaction[] {
  return transactions.slice(0, 200);
}

export const TransactionsContainer = ({
  transactions,
}: {
  transactions: IApiTransaction[];
}) => {
  const tableData = limitShownTransactions(transactions);

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
