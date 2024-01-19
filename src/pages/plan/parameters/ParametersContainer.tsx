import { useCallback, useState } from "react";
import { IParameters } from "../../../services/ParameterService";

import "./Parameters.css";

import InputGroup from "react-bootstrap/InputGroup";
import { HelpInputGroup } from "../../../components/HelpInputGroup";
import { CurrencyInput } from "../../../components/CurrencyInput";

export const ParametersContainer = ({
  parameters: {
    currentBalance: initialCurrentBalance,
    setAside: initialSetAside,
  },
  setParameters,
}: {
  parameters: IParameters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setParameters: (params: Partial<IParameters>) => Promise<any>;
}) => {
  const [currentBalance, setCurrentBalance] = useState(initialCurrentBalance);
  const [setAside, setSetAside] = useState(initialSetAside);

  const submit = useCallback(() => {
    void setParameters({
      setAside,
      currentBalance,
    });
  }, [currentBalance, setAside, setParameters]);

  return (
    <div>
      <div className="form-inline">
        <InputGroup size="sm">
          <CurrencyInput
            value={currentBalance}
            controlId="currentBalance"
            label={"Balance today"}
            onValueChange={setCurrentBalance}
            onBlur={submit}
          />
          <HelpInputGroup helptext="Work out your balance across your accounts then input it here. Then, we'll start with that balance when predicting your future balances." />
        </InputGroup>

        <InputGroup size="sm">
          <CurrencyInput
            value={setAside}
            controlId="setAside"
            label={"Safety net"}
            onValueChange={setSetAside}
            onBlur={submit}
          />
          <HelpInputGroup
            helptext={
              <>
                Input here how much you would like to keep set aside for
                emergencies.{" "}
                <a
                  href="https://www.ramseysolutions.com/dave-ramsey-7-baby-steps#baby-step-1"
                  target="_blank"
                >
                  Dave Ramsey's Baby Step #1 to getting out of debt
                </a>{" "}
                advises setting aside $1,000.
              </>
            }
          />
        </InputGroup>
      </div>
    </div>
  );
};
