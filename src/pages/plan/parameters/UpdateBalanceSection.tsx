import InputGroup from "react-bootstrap/esm/InputGroup";
import { CurrencyInputSubGroup } from "../../../components/CurrencyInput";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import {
  finishReconciliation,
  reconciliationExpectedBalanceState,
} from "../../../store/reconcile";
import { useSignalValue } from "../../../store/useSignalValue";
import { HelpInputGroup } from "../../../components/HelpInputGroup";
import { Currency } from "../../../components/currency/Currency";

export function UpdateBalanceSection({ onClose }: { onClose: () => void }) {
  const expectedBalance = useSignalValue(reconciliationExpectedBalanceState);
  const [newBalance, setNewBalance] = useState(expectedBalance);

  const submit = useCallback(() => {
    finishReconciliation({ newBalance });
    onClose();
  }, [newBalance, onClose]);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (buttonRef.current) buttonRef.current.focus();
  }, []);

  return (
    <>
      <h5>Update Balance</h5>

      <p>What is your balance today?</p>
      <InputGroup size="sm">
        <CurrencyInputSubGroup
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
      <div className="mt-2 d-flex justify-content-end">
        <Button
          ref={buttonRef}
          variant="primary"
          onClick={() => {
            submit();
          }}
        >
          Update
        </Button>
      </div>
    </>
  );
}
