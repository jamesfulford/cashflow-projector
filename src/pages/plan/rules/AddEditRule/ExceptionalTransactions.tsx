import { FieldArray, useFormikContext } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { Suspense, useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import { ExceptionalTransaction } from "../../../../store/rules";
import { AgGrid } from "../../../../components/AgGrid";
import type { AgGridReactProps } from "ag-grid-react";
import { startDateState } from "../../../../store/parameters";
import { useSignalValue } from "../../../../store/useSignalValue";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const ExceptionalTransactionsEditor = ({
  transactions,
  updateTransaction,
  deleteTransaction,
}: {
  transactions: ExceptionalTransaction[];
  updateTransaction: (transaction: ExceptionalTransaction) => void;
  deleteTransaction: (id: string) => void;
}) => {
  const startDate = useSignalValue(startDateState);
  const rowData = useMemo(
    () => transactions.map((t) => ({ ...t })),
    [transactions],
  ); // make a copy

  const columns: AgGridReactProps["columnDefs"] = useMemo(
    (): AgGridReactProps["columnDefs"] => [
      {
        field: "day",
        headerName: "Date",

        sortable: true,
        sort: "asc",

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
      },
      {
        field: "name",
        headerName: "Name",

        sortable: true,

        editable: true,
        onCellValueChanged: ({ data: transaction }) => {
          // ag-grid mutates the object in-place; `name` is already updated
          updateTransaction(transaction);
        },
        flex: 13,
      },
      {
        field: "value",
        headerName: "Amount",
        cellClass: "mask",

        sortable: true,

        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          precision: 2,
        },
        onCellValueChanged: ({ data: transaction }) => {
          // ag-grid mutates the object in-place; `value` is already updated
          updateTransaction(transaction);
        },
        flex: 8,
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
            <FontAwesomeIcon
              style={{
                color: "var(--red)",
                margin: "auto 0",
              }}
              icon={faTrashCan}
              title="Delete"
              onClick={() => deleteTransaction(transaction.id)}
            />
          );
        },

        width: 50,
      },
    ],
    [deleteTransaction, startDate, updateTransaction],
  );

  const rowHeight = 30;
  const headerHeight = 30;

  return (
    <div
      style={{
        height: 11 + headerHeight + rowHeight * rowData.length,
        width: "100%",
      }}
      className="ag-theme-quartz p-0 pt-2"
    >
      <Suspense>
        <AgGrid
          rowData={rowData}
          columnDefs={columns}
          rowHeight={30}
          headerHeight={30}
        />
      </Suspense>
    </div>
  );
};

export const ExceptionalTransactions = () => {
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
              <FontAwesomeIcon icon={faPlus} />
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
              />
            </div>
          </>
        );
      }}
    </FieldArray>
  );
};

export const ExceptionalTransactionsWithHiding = () => {
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
                  color: "var(--tertiary)",
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
                  <FontAwesomeIcon icon={faPlus} />
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
                />
              </div>
            ) : null}
          </>
        );
      }}
    </FieldArray>
  );
};
