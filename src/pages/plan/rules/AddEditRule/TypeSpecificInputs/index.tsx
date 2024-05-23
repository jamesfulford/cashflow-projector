import { useFormikContext } from "formik";
import { RuleType } from "../../../../../store/rules";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { ProgressInput } from "./goal/ProgressInput";
import { GoalInput } from "./goal/GoalInput";
import { CompletionDisplay } from "./goal/CompletionDisplay";
import { HelpInputGroup } from "../../../../../components/HelpInputGroup";
import { BalanceInput } from "./loan/BalanceInput";
import { CompoundingsInput } from "./loan/CompoundingsInput";
import { APRInput } from "./loan/APRInput";
import Button from "react-bootstrap/esm/Button";
import { registerSupportFor } from "../../../../../services/vote";

export function TypeSpecificInputs() {
  const form = useFormikContext();

  const type = form.getFieldMeta("type").value as RuleType;

  switch (type) {
    case RuleType.EXPENSE:
      return null;
    case RuleType.INCOME:
      return null;
    case RuleType.SAVINGS_GOAL: {
      return (
        <div className="mt-3">
          <InputGroup>
            <ProgressInput />
            <InputGroup.Text>out of</InputGroup.Text>
            <GoalInput />
            <CompletionDisplay />
            <HelpInputGroup
              helptext={
                <>
                  We'll remind you next time you log in to transfer the money
                  you plan to save into a savings account, so it isn't counted
                  as part of your available balance.
                </>
              }
            />
          </InputGroup>
        </div>
      );
    }
    case RuleType.LOAN: {
      return (
        <div className="mt-3">
          <InputGroup>
            <BalanceInput />
            <APRInput />
            <CompoundingsInput />
            <HelpInputGroup
              helptext={
                <>
                  <strong>Loan Balance</strong>: how much you owe on this loan
                  as of today.
                  <br />
                  <br />
                  <strong>APR</strong>: the interest rate on the loan. For
                  better results, put in the APR, not the interest rate.
                  <br />
                  <br />
                  <strong>Compounding</strong>: how often the loan's interest
                  compounds. If you're not sure, Daily is the one that charges
                  the most interest over time, making it the conservative
                  option.
                  <br />
                  <br />
                  <em>
                    Right now, we don't support loans with simple interest. If
                    you want this feature, please let us know by clicking on
                    this button:
                  </em>
                  <br />
                  <Button
                    onClick={() => {
                      registerSupportFor("simple_interest_loan");
                      alert(
                        `Thank you for clicking! We're still considering creating this feature, and your click helps us know what you would find useful.`,
                      );
                    }}
                  >
                    Vote for Simple Interest
                  </Button>
                </>
              }
            />
          </InputGroup>
        </div>
      );
    }
  }
}
