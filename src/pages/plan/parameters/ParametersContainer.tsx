import { useCallback, useEffect, useState } from "react";
import {
  currentBalanceState,
  setAsideState,
  setParameters,
} from "../../../store/parameters";

import "./Parameters.css";

import InputGroup from "react-bootstrap/esm/InputGroup";
import { HelpInputGroup } from "../../../components/HelpInputGroup";
import { CurrencyInputSubGroup } from "../../../components/CurrencyInput";
import { CurrencyColorless } from "../../../components/currency/Currency";

export const ParametersContainer = () => {
  const [currentBalance, setCurrentBalance] = useState(
    currentBalanceState.peek(),
  );
  useEffect(
    () =>
      currentBalanceState.subscribe((newBalance) =>
        setCurrentBalance(newBalance),
      ),
    [],
  );

  const [setAside, setSetAside] = useState(setAsideState.peek());
  useEffect(
    () => setAsideState.subscribe((newSetAside) => setSetAside(newSetAside)),
    [],
  );

  const submit = useCallback(() => {
    if (
      setAside === setAsideState.peek() &&
      currentBalance === currentBalanceState.peek()
    ) {
      // if no change, do nothing
      return;
    }

    setParameters({
      setAside,
      currentBalance,
    });
  }, [currentBalance, setAside]);

  return (
    <div>
      <div className="form-inline">
        <InputGroup size="sm" id="current-balance-input">
          <CurrencyInputSubGroup
            value={currentBalance}
            controlId="currentBalance"
            label={"Balance today"}
            onValueChange={setCurrentBalance}
            onBlur={submit}
            style={{ color: undefined }}
          />
          <HelpInputGroup helptext="Put your checking account balance in here, plus cash and PayPal/Venmo balances. We will start with that balance when predicting your future balances. If you have multiple checking accounts, consider summing their balances or creating another profile for each one." />
        </InputGroup>

        <InputGroup size="sm" id="safety-net-input">
          <CurrencyInputSubGroup
            value={setAside}
            controlId="setAside"
            label={"Safety net"}
            onValueChange={setSetAside}
            onBlur={submit}
            style={{ color: undefined }}
          />
          <HelpInputGroup
            helptext={
              <>
                Input here how much you want to always leave in your checking
                account in case of a minor emergency, like a flat tire or
                needing a hotel for a night. This isn't a full-blown emergency
                fund, but this is key for giving you some much-needed financial
                peace of mind.{" "}
                <a
                  href="https://www.ramseysolutions.com/dave-ramsey-7-baby-steps#baby-step-1"
                  target="_blank"
                  style={{ color: "inherit" }}
                >
                  Dave Ramsey's Baby Step #1 to getting out of debt
                </a>{" "}
                advises setting aside <CurrencyColorless value={1000} />.
              </>
            }
          />
        </InputGroup>
      </div>
    </div>
  );
};
