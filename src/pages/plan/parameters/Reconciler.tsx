import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Currency } from "../../../components/currency/Currency";
import {
  currentBalanceState,
  setParameters,
  startDateState,
} from "../../../store/parameters";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/esm/Modal";
import {
  IApiTransaction,
  deferTransaction,
  skipTransaction,
  transactionsState,
} from "../../../store/transactions";
import { CurrencyInput } from "../../../components/CurrencyInput";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { HelpInputGroup } from "../../../components/HelpInputGroup";
import type { AgGridReactProps } from "ag-grid-react";
import Card from "react-bootstrap/esm/Card";
import { useSignalValue } from "../../../store/useSignalValue";
import { AgGrid } from "../../../components/AgGrid";

const rowHeight = 35;
const headerHeight = 35;

export const Reconciler = () => {
  const startDate = useSignalValue(startDateState);
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
    [now],
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
      <ReconcilerView updateTodayAndBalance={updateTodayAndBalance} now={now} />
    </Modal>
  );
};

type Disposition = { id: string } & (
  | { action: "skip" }
  | { action: "defer"; newValue: string }
);
type DerivedTransaction = IApiTransaction & { disposition?: Disposition };
function useDispositions(relevantTransactions: IApiTransaction[]) {
  const [dispositions, setDispositions] = useState<Disposition[]>([]);

  const submitDispositions = useCallback(() => {
    dispositions.forEach((disposition) => {
      const transaction = relevantTransactions.find(
        (t) => t.id === disposition.id,
      );
      if (!transaction) return; // should never happen

      switch (disposition.action) {
        case "defer":
          deferTransaction(transaction, disposition.newValue);
          break;
        case "skip":
          skipTransaction(transaction);
          break;
      }
    });
  }, [relevantTransactions, dispositions]);

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
      relevantTransactions.map((t) => {
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
  }, [dispositions, relevantTransactions]);

  return {
    submitDispositions,
    derivedTransactions,
    addSkipAction,
    addDeferAction,
    removeAction,
  };
}

const ReconcilerView = ({
  updateTodayAndBalance,
  now,
}: {
  updateTodayAndBalance: (targetBalance?: number) => void;
  now: string;
}) => {
  const startDate = useSignalValue(startDateState);
  const currentBalance = useSignalValue(currentBalanceState);
  const transactions = useSignalValue(transactionsState);
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
  } = useDispositions(relevantTransactions);

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
              <AgGrid
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
