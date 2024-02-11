import { useCallback, useMemo, useState } from "react";
import { Currency } from "../../../components/currency/Currency";
import { IParameters } from "../../../services/ParameterService";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/esm/Modal";
import { IApiTransaction } from "../../../services/TransactionsService";
import { CurrencyInput } from "../../../components/CurrencyInput";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { HelpInputGroup } from "../../../components/HelpInputGroup";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import Card from "react-bootstrap/esm/Card";

const rowHeight = 35;
const headerHeight = 35;

export const Reconciler = ({
  transactions,
  parameters,
  setParameters,
}: {
  parameters: IParameters;
  transactions: IApiTransaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setParameters: (params: Partial<IParameters>) => Promise<any>;
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
        parameters={parameters}
        updateTodayAndBalance={updateTodayAndBalance}
        now={now}
      />
    </Modal>
  );
};

const ReconcilerView = ({
  transactions,
  parameters: { startDate, currentBalance },
  updateTodayAndBalance,
  now,
}: {
  parameters: IParameters;
  transactions: IApiTransaction[];
  updateTodayAndBalance: (targetBalance?: number) => void;
  now: string;
}) => {
  const relevantTransactions = useMemo(
    () => transactions.filter((t) => t.day >= startDate && t.day < now),
    [transactions],
  );

  const [workingTransactions, _setWorkingTransactions] =
    useState(relevantTransactions);

  const expectedChange = useMemo(
    () => workingTransactions.map((t) => t.value).reduce((a, x) => a + x, 0),
    [workingTransactions],
  );
  const expectedBalance = useMemo(
    () => currentBalance + expectedChange,
    [currentBalance, expectedChange],
  );

  const [newBalance, setNewBalance] = useState(expectedBalance);

  const columns: AgGridReactProps["columnDefs"] = useMemo(
    (): AgGridReactProps["columnDefs"] => [
      {
        field: "day",
        headerName: "Date",
        sortable: false,
        suppressMovable: true,
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
    [],
  );

  const hasExpectedTransactions = useMemo(
    () => relevantTransactions.length !== 0,
    [relevantTransactions],
  );

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
                  11 + headerHeight + rowHeight * workingTransactions.length,
              }}
            >
              <AgGridReact
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rowData={workingTransactions}
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
          variant="primary"
          onClick={() => {
            updateTodayAndBalance(newBalance);
          }}
        >
          Update
        </Button>
      </Modal.Footer>
    </>
  );
};
