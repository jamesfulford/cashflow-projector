import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Currency } from "../../../components/currency/Currency";
import { IParameters } from "../../../store/parameters";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/esm/Modal";
import { IApiTransaction } from "../../../store/transactions";
import { CurrencyInput } from "../../../components/CurrencyInput";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { HelpInputGroup } from "../../../components/HelpInputGroup";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import Card from "react-bootstrap/esm/Card";
import { TransactionActions } from "../ComputationsContainer";

const rowHeight = 35;
const headerHeight = 35;

export const Reconciler = ({
  transactions,
  transactionActions,
  parameters,
  setParameters,
}: {
  parameters: IParameters;
  transactions: IApiTransaction[];
  transactionActions: TransactionActions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setParameters: (params: Partial<IParameters>) => any;
}) => {
  const { startDate } = parameters;
  const nowDate = new Date();
  const now = `${nowDate.getFullYear()}-${(nowDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${nowDate.getDate().toString().padStart(2, "0")}`;

  const datesNotReconciled = useMemo(() => startDate !== now, [startDate, now]);
  const [show, setShow] = useState(datesNotReconciled);

  const updateTodayAndBalance = useCallback(
    (targetBalance?: number) => {
      setParameters({
        startDate: now,
        ...(targetBalance && { currentBalance: targetBalance }),
      });
      setShow(false);
    },
    [now, setParameters],
  );

  if (!datesNotReconciled) return null;

  if (!show) {
    return (
      <Card border="warning" className="mb-2 p-1">
        <div className="text-center">
          <span>Showing {startDate}, not today.</span>{" "}
          <Button
            variant="outline-warning"
            className="pt-0 pb-0 pl-1 pr-1"
            onClick={() => setShow(true)}
          >
            Reconcile
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Modal
      show
      onHide={() => {
        setShow(false);
      }}
      keyboard
    >
      <ReconcilerView
        transactions={transactions}
        transactionActions={transactionActions}
        parameters={parameters}
        updateTodayAndBalance={updateTodayAndBalance}
        now={now}
      />
    </Modal>
  );
};

type Disposition = { id: string } & (
  | { action: "skip" }
  | { action: "defer"; newValue: string }
);
type DerivedTransaction = IApiTransaction & { disposition?: Disposition };
function useDispositions({
  transactions,
  transactionActions,
}: {
  transactions: IApiTransaction[];
  transactionActions: TransactionActions;
}) {
  const [dispositions, setDispositions] = useState<Disposition[]>([]);

  const submitDispositions = useCallback(() => {
    dispositions.forEach((disposition) => {
      const transaction = transactions.find((t) => t.id === disposition.id);
      if (!transaction) return; // should never happen

      switch (disposition.action) {
        case "defer":
          transactionActions.deferTransaction(
            transaction,
            disposition.newValue,
          );
          break;
        case "skip":
          transactionActions.skipTransaction(transaction);
          break;
      }
    });
  }, [dispositions, transactions, transactionActions]);

  const addDisposition = useCallback(
    (disposition: Disposition) => {
      setDispositions((ds) => {
        return [...ds.filter((d) => d.id !== disposition.id), disposition];
      });
    },
    [setDispositions],
  );

  const addSkipAction = useCallback(
    (transactionId: string) => {
      addDisposition({
        id: transactionId,
        action: "skip",
      });
    },
    [addDisposition],
  );

  const removeAction = useCallback(
    (transactionId: string) => {
      setDispositions((ds) => {
        return ds.filter((d) => d.id !== transactionId);
      });
    },
    [setDispositions],
  );

  const addDeferAction = useCallback(
    (transactionId: string, newValue: string) => {
      addDisposition({
        id: transactionId,
        action: "defer",
        newValue,
      });
    },
    [addDisposition],
  );

  const derivedTransactions: DerivedTransaction[] = useMemo(() => {
    return structuredClone(
      transactions.map((t) => {
        const disposition = dispositions.find((d) => d.id === t.id);
        if (!disposition) return t;

        switch (disposition.action) {
          case "skip":
            return {
              ...t,
              disposition,
            };
          case "defer":
            return {
              ...t,
              disposition,
              day: disposition.newValue,
            };
        }
      }),
    );
  }, [dispositions, transactions]);

  return {
    submitDispositions,
    derivedTransactions,
    addSkipAction,
    addDeferAction,
    removeAction,
  };
}

const ReconcilerView = ({
  transactions,
  transactionActions,
  parameters: { startDate, currentBalance },
  updateTodayAndBalance,
  now,
}: {
  parameters: IParameters;
  transactions: IApiTransaction[];
  transactionActions: TransactionActions;
  updateTodayAndBalance: (targetBalance?: number) => void;
  now: string;
}) => {
  const relevantTransactions = useMemo(
    () =>
      structuredClone(
        transactions.filter((t) => t.day >= startDate && t.day < now),
      ),
    [now, startDate, transactions],
  );

  const {
    derivedTransactions,
    submitDispositions,
    addDeferAction,
    addSkipAction,
    removeAction,
  } = useDispositions({
    transactions: relevantTransactions,
    transactionActions,
  });

  const expectedChange = useMemo(
    () =>
      derivedTransactions
        .filter((t) => {
          if (!t.disposition) return true;
          if (t.disposition.action === "defer") return false; // must be deferred to the future
          if (t.disposition.action === "skip") return false;
        })
        .map((t) => t.value)
        .reduce((a, x) => a + x, 0),
    [derivedTransactions],
  );
  const expectedBalance = useMemo(
    () => currentBalance + expectedChange,
    [currentBalance, expectedChange],
  );

  const [newBalance, setNewBalance] = useState(expectedBalance);
  useEffect(() => {
    // update when things are skipped
    setNewBalance(expectedBalance);
  }, [expectedBalance]);

  const submit = useCallback(() => {
    submitDispositions();
    updateTodayAndBalance(newBalance);
  }, [submitDispositions, updateTodayAndBalance, newBalance]);

  const columns: AgGridReactProps["columnDefs"] = useMemo(
    (): AgGridReactProps["columnDefs"] => [
      {
        cellRenderer: ({ data }: { data: DerivedTransaction }) => {
          const isChecked = !data.disposition;
          return (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  removeAction(data.id);
                } else {
                  addSkipAction(data.id);
                }
              }}
            />
          );
        },
        width: 20,
        resizable: false,
      },
      {
        field: "day",
        headerName: "Date",
        sortable: false,
        suppressMovable: true,

        editable: true,
        cellEditor: "agDateStringCellEditor",
        cellEditorParams: {
          min: now,
        },
        onCellValueChanged: ({ newValue, data: transaction, node }) => {
          addDeferAction(transaction.id, newValue);
          node?.setSelected(false);
        },

        flex: 1,
      },
      {
        field: "name",
        headerName: "Name",
        sortable: false,
        suppressMovable: true,
        flex: 1,
      },
      {
        field: "value",
        headerName: "Amount",
        sortable: false,
        suppressMovable: true,
        cellRenderer: Currency,
        flex: 1,
      },
    ],
    [addDeferAction, addSkipAction, now, removeAction],
  );

  const hasExpectedTransactions = useMemo(
    () => relevantTransactions.length !== 0,
    [relevantTransactions],
  );

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (buttonRef.current) buttonRef.current.focus();
  }, []);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Welcome back! Let's catch up.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Last time, on {startDate}, you had <Currency value={currentBalance} />
          .{" "}
          {hasExpectedTransactions ? (
            <>Since then, the following transactions should have happened:</>
          ) : (
            <>
              We are not expecting any transactions to have taken place since
              then.
            </>
          )}
        </p>
        {hasExpectedTransactions ? (
          <>
            <div
              className="ag-theme-quartz p-0 pt-2"
              style={{
                height:
                  11 + headerHeight + rowHeight * derivedTransactions.length,
              }}
            >
              <AgGridReact
                rowData={derivedTransactions}
                columnDefs={columns}
                rowHeight={rowHeight}
                headerHeight={headerHeight}
              />
            </div>
            <p className="d-flex justify-content-end m-2">
              =&nbsp;
              <Currency value={expectedChange} />
            </p>
          </>
        ) : null}

        <p>
          What is your <em>actual</em> balance today?
        </p>
        <InputGroup size="sm">
          <CurrencyInput
            value={newBalance}
            controlId="newBalance"
            label={"Balance today"}
            onValueChange={setNewBalance}
            allowNegative
          />
          {newBalance !== expectedBalance ? (
            <>
              <HelpInputGroup
                helptext={
                  <>
                    Off from expectations by&nbsp;
                    <Currency value={newBalance - expectedBalance} />.
                    <br />
                    <Button
                      className="p-1 ml-2"
                      variant="outline-secondary"
                      onClick={() => {
                        setNewBalance(expectedBalance);
                      }}
                    >
                      Reset
                    </Button>
                  </>
                }
              />
            </>
          ) : null}
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          ref={buttonRef}
          variant="primary"
          onClick={() => {
            submit();
          }}
        >
          Update
        </Button>
      </Modal.Footer>
    </>
  );
};
