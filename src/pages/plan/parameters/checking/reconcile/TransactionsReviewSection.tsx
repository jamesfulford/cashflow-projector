import Button from "react-bootstrap/esm/Button";
import { Currency } from "../../../../../components/currency/Currency";
import { DateDisplay } from "../../../../../components/date/DateDisplay";
import {
  currentBalanceState,
  startDateState,
} from "../../../../../store/parameters";
import { reconciliationTransactionsState } from "../../../../../store/reconcile";
import { useSignalValue } from "../../../../../store/useSignalValue";
import {
  Tabs,
  tableTabSelectionState,
} from "../../../tables/tableTabSelectionState";

export function TransactionsReviewSection({
  onClose,
}: {
  onClose: () => void;
}) {
  const startDate = useSignalValue(startDateState);

  const currentBalance = useSignalValue(currentBalanceState);

  const relevantTransactions = useSignalValue(reconciliationTransactionsState);
  const hasTransactions = relevantTransactions.length > 0;
  const pluralTransactions = relevantTransactions.length > 1;
  const transactionsName = "transaction" + (pluralTransactions ? "s" : "");

  return (
    <>
      <p>
        Last time, on <DateDisplay date={startDate} />, you had{" "}
        <Currency value={currentBalance} />. Since then,{" "}
        {hasTransactions ? (
          <>
            <strong>
              {relevantTransactions.length} {transactionsName}{" "}
            </strong>
            {pluralTransactions ? "were" : "was"} expected to happen.
          </>
        ) : (
          <>no transactions were expected to happen.</>
        )}
      </p>

      <Button
        onClick={() => {
          onClose();
          tableTabSelectionState.value = Tabs.TRANSACTIONS;
        }}
      >
        Review {transactionsName}
      </Button>
    </>
  );
}
