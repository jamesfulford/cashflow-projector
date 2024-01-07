import { Transaction } from "./Transaction";
import { IApiTransaction } from "../../../services/TransactionsService";
import Table from "react-bootstrap/esm/Table";

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
    <div data-testid="transactions-showing">
      <Table striped responsive hover>
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
      </Table>
    </div>
  );
};
