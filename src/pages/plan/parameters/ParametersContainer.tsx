import { useEffect, useState } from "react";
import { IParameters } from "../../../services/ParameterService";

import "./Parameters.css";

export const ParametersContainer = ({
  parameters: {
    currentBalance: initialCurrentBalance,
    setAside: initialSetAside,
    startDate: initialStartDate,
  },
  setParameters,
}: {
  parameters: IParameters;
  setParameters: (params: IParameters) => Promise<any>;
}) => {
  const [currentBalance, setCurrentBalance] = useState("");
  const [setAside, setSetAside] = useState("");
  const [startDate, setStartDate] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setCurrentBalance(String(initialCurrentBalance));
    setSetAside(String(initialSetAside));
    setStartDate(initialStartDate);
  }, [initialCurrentBalance, initialSetAside, initialStartDate]);

  const isPristine =
    String(initialCurrentBalance) === currentBalance &&
    String(initialSetAside) === setAside &&
    initialStartDate === startDate;

  const nowDate = new Date().toISOString().split("T")[0];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        void setParameters({
          startDate,
          setAside: Number(setAside),
          currentBalance: Number(currentBalance),
        });
        setErrorMessage(undefined);
      }}
    >
      <div className="d-flex justify-content-between mb-2">
        <div className="d-flex align-items-center">
          <h5 className="p-0 m-0">
            On{" "}
            <span className={nowDate !== startDate ? "text-danger" : ""}>
              {startDate}
            </span>
          </h5>
        </div>
        <div className="form-inline">
          <label htmlFor="Balance">Balance</label>
          <input
            className="form-control form-control-sm ml-2 sl-input"
            id="Balance"
            type="text"
            value={currentBalance}
            maxLength={19}
            required
            pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
            style={{ width: 150 }}
            onChange={(e) => {
              const stringValue: string = e.target.value;
              setCurrentBalance(stringValue);
            }}
          />
          <label htmlFor="setAside" className="ml-3">
            Set Aside
          </label>
          <input
            className="form-control form-control-sm ml-2 sl-input"
            id="setAside"
            type="text"
            step="0.01"
            value={setAside}
            maxLength={19}
            required
            pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
            style={{ width: 150 }}
            onChange={(e) => {
              const stringValue: string = e.target.value;
              setSetAside(stringValue);
            }}
          />

          <button className="button-secondary ml-3" disabled={isPristine}>
            Update
          </button>
        </div>
      </div>
      <div className="d-flex justify-content-end">
        {errorMessage && <span className="text-danger">{errorMessage}</span>}
      </div>
    </form>
  );
};
