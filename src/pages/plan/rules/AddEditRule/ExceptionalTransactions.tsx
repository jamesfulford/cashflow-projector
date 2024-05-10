import { FieldArray, useFormikContext } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons/faTrashCan";
import { faShuffle } from "@fortawesome/free-solid-svg-icons/faShuffle";
import { Suspense, useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import { ExceptionalTransaction } from "../../../../store/rules";
import { AgGrid } from "../../../../components/AgGrid";
import type { AgGridReactProps } from "ag-grid-react";
import { startDateState } from "../../../../store/parameters";
import { useSignalValue } from "../../../../store/useSignalValue";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { Currency } from "../../../../components/currency/Currency";
import { CustomCurrencyCellEditor } from "../../../../components/AgGridCurrencyInput";
import { DateDisplay } from "../../../../components/date/DateDisplay";
import Tippy, { useSingleton } from "@tippyjs/react";

const ExceptionalTransactionsEditor = ({
  transactions,
  updateTransaction,
  deleteTransaction,
  baseSign,
}: {
  transactions: ExceptionalTransaction[];
  updateTransaction: (transaction: ExceptionalTransaction) => void;
  deleteTransaction: (id: string) => void;
  baseSign?: number;
}) => {
  const startDate = useSignalValue(startDateState);
  const rowData = useMemo(
    () => transactions.map((t) => ({ ...t })),
    [transactions],
  ); // make a copy

  const [source, target] = useSingleton();

  const columns: AgGridReactProps["columnDefs"] = useMemo(
    (): AgGridReactProps["columnDefs"] => [
      {
        field: "day",
        headerName: "Date",

        sortable: true,

        editable: true,
        cellEditor: "agDateStringCellEditor",
        cellEditorParams: {
          min: startDate,
        },
        onCellValueChanged: ({ data: transaction }) => {
          // ag-grid mutates the object in-place; `day` is already updated
          updateTransaction(transaction);
        },
        flex: 8,

        cellRenderer: ({ data }: { data: ExceptionalTransaction }) => (
          <DateDisplay date={data.day} simple />
        ),
      },
      {
        field: "name",
        headerName: "Name override",

        sortable: true,

        editable: true,
        onCellValueChanged: ({ data: transaction }) => {
          // ag-grid mutates the object in-place; `name` is already updated
          updateTransaction(transaction);
        },
        flex: 10,
      },
      {
        field: "value",
        headerName: "Amount override",

        sortable: true,

        cellRenderer: Currency,

        editable: true,
        cellEditor: CustomCurrencyCellEditor,
        cellEditorParams: {
          baseSign,
        },
        onCellValueChanged: ({ data: transaction }) => {
          // ag-grid mutates the object in-place; `value` is already updated
          updateTransaction(transaction);
        },
        flex: 10,
      },
      {
        headerName: "",
        sortable: false,
        cellRenderer: ({
          data: transaction,
        }: {
          data: ExceptionalTransaction;
        }) => {
          return (
            <div className="d-flex justify-content-end">
              {transaction.value ? (
                <Tippy
                  content={
                    transaction.value > 0
                      ? "Switch to expense"
                      : "Switch to income"
                  }
                  singleton={target}
                >
                  <span>
                    <FontAwesomeIcon
                      style={{
                        marginRight: 8,
                        cursor: "pointer",
                      }}
                      icon={faShuffle}
                      title={
                        transaction.value > 0
                          ? "Switch to expense"
                          : "Switch to income"
                      }
                      onClick={() =>
                        updateTransaction({
                          ...transaction,
                          value: -(transaction.value as number),
                        })
                      }
                    />
                  </span>
                </Tippy>
              ) : null}

              <Tippy content={<>Delete</>} singleton={target}>
                <span>
                  <FontAwesomeIcon
                    style={{
                      color: "var(--red)",
                      margin: "auto 0",
                      cursor: "pointer",
                    }}
                    icon={faTrashCan}
                    title="Delete"
                    onClick={() => deleteTransaction(transaction.id)}
                  />
                </span>
              </Tippy>
            </div>
          );
        },

        width: 60,
      },
    ],
    [baseSign, deleteTransaction, startDate, target, updateTransaction],
  );

  const rowHeight = 35;
  const headerHeight = 35;

  return (
    <div
      style={{
        height: 11 + headerHeight + rowHeight * rowData.length,
        width: "100%",
      }}
      className="ag-theme-quartz p-0 pt-2"
    >
      <Tippy singleton={source} />
      <Suspense>
        <AgGrid
          rowData={rowData}
          columnDefs={columns}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
        />
      </Suspense>
    </div>
  );
};

export const ExceptionalTransactions = ({ baseSign }: { baseSign: number }) => {
  const form = useFormikContext();

  const exceptionalTransactions = form.getFieldMeta("exceptionalTransactions")
    .value as ExceptionalTransaction[];

  useEffect(() => {
    if (exceptionalTransactions.length === 0)
      form.setFieldValue("exceptionalTransactions", [
        {
          id: `${Date.now()}`,
          day: startDateState.peek(),
        },
      ]);
  }, [exceptionalTransactions, form]);

  return (
    <FieldArray name="exceptionalTransactions">
      {(arrayHelpers) => {
        return (
          <>
            <Button
              variant="outline-success"
              onClick={() => {
                arrayHelpers.insert(0, {
                  id: `${Date.now()}`,
                  day: startDateState.peek(),
                });
              }}
              title="Add exceptional transaction"
            >
              <FontAwesomeIcon icon={faPlus} style={{ cursor: "pointer" }} />
            </Button>
            <div>
              <ExceptionalTransactionsEditor
                transactions={exceptionalTransactions}
                updateTransaction={(updatedTransaction) => {
                  const index = exceptionalTransactions.findIndex(
                    (t) => t.id === updatedTransaction.id,
                  );
                  if (index < 0) return;
                  arrayHelpers.replace(index, updatedTransaction);
                }}
                deleteTransaction={(id: string) => {
                  const index = exceptionalTransactions.findIndex(
                    (t) => t.id === id,
                  );
                  if (index < 0) return;
                  arrayHelpers.remove(index);
                }}
                baseSign={baseSign}
              />
            </div>
          </>
        );
      }}
    </FieldArray>
  );
};

export const ExceptionalTransactionsWithHiding = ({
  baseSign,
}: {
  baseSign: number;
}) => {
  const form = useFormikContext();

  const exceptionalTransactions = form.getFieldMeta("exceptionalTransactions")
    .value as ExceptionalTransaction[];

  const [show, setShow] = useState(false);

  return (
    <FieldArray name="exceptionalTransactions">
      {(arrayHelpers) => {
        return (
          <>
            <div className="d-flex justify-content-between align-items-start">
              <Button
                variant="link"
                className="p-0 m-0 underline-on-hover"
                style={{
                  color: "var(--gray-text)",
                  textDecoration: "none",
                }}
                onClick={() => {
                  setShow((s) => !s);
                }}
              >
                {show ? <>Hide</> : <>Show</>} exceptional transactions (
                {exceptionalTransactions.length}){" "}
              </Button>
              {show ? (
                <Button
                  variant="outline-success"
                  onClick={() => {
                    arrayHelpers.insert(0, {
                      id: `${Date.now()}`,
                      day: startDateState.peek(),
                    });
                  }}
                  title="Add exceptional transaction"
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    style={{ cursor: "pointer" }}
                  />
                </Button>
              ) : null}
            </div>
            {show ? (
              <div>
                <ExceptionalTransactionsEditor
                  transactions={exceptionalTransactions}
                  updateTransaction={(updatedTransaction) => {
                    const index = exceptionalTransactions.findIndex(
                      (t) => t.id === updatedTransaction.id,
                    );
                    if (index < 0) return;
                    arrayHelpers.replace(index, updatedTransaction);
                  }}
                  deleteTransaction={(id: string) => {
                    const index = exceptionalTransactions.findIndex(
                      (t) => t.id === id,
                    );
                    if (index < 0) return;
                    arrayHelpers.remove(index);
                  }}
                  baseSign={baseSign}
                />
              </div>
            ) : null}
          </>
        );
      }}
    </FieldArray>
  );
};
