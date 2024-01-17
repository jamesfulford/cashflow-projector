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
            <th>Value</th>
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
