import { useCallback, useEffect, useState } from "react";
import { IParameters } from "../../../services/ParameterService";

import "./Parameters.css";
import { FloatingLabel, Form, InputGroup } from "react-bootstrap";

import { numberPattern } from "../../../components/number";
import { HelpInputGroup } from "../../../components/HelpInputGroup";

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
  const [currentBalance, setCurrentBalance] = useState("");
  const [setAside, setSetAside] = useState("");

  useEffect(() => {
    setCurrentBalance(initialCurrentBalance.toFixed(2));
    setSetAside(initialSetAside.toFixed(2));
  }, [initialCurrentBalance, initialSetAside]);

  const submit = useCallback(() => {
    void setParameters({
      setAside: Number(setAside),
      currentBalance: Number(currentBalance),
    });
  }, [currentBalance, setAside, setParameters]);

  return (
    <div>
      <div className="form-inline">
        <InputGroup size="sm">
          <InputGroup.Text>$</InputGroup.Text>
          <FloatingLabel controlId="balanceToday" label="Balance today">
            <Form.Control
              placeholder="Balance today"
              type="text"
              value={currentBalance}
              required
              pattern={numberPattern}
              onChange={(e) => {
                const stringValue: string = e.target.value;
                setCurrentBalance(stringValue);
              }}
              onBlur={() => {
                submit();
              }}
            />
          </FloatingLabel>
          <HelpInputGroup helptext="Work out your balance across your accounts then input it here. Then, we'll start with that balance when predicting your future balances." />
        </InputGroup>

        <InputGroup size="sm">
          <InputGroup.Text>$</InputGroup.Text>
          <FloatingLabel controlId="setAside" label="Safety net">
            <Form.Control
              placeholder="Safety net"
              type="text"
              value={setAside}
              required
              pattern={numberPattern}
              onChange={(e) => {
                const stringValue: string = e.target.value;
                setSetAside(stringValue);
              }}
              onBlur={() => {
                submit();
              }}
            />
          </FloatingLabel>
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
                advises setting aside $1000.
              </>
            }
          />
        </InputGroup>
      </div>
    </div>
  );
};
