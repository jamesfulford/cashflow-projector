import { useFormikContext } from "formik";
import { RuleType } from "../../../../../store/rules";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { ProgressInput } from "./ProgressInput";
import { GoalInput } from "./GoalInput";
import { CompletionDisplay } from "./CompletionDisplay";
import { HelpInputGroup } from "../../../../../components/HelpInputGroup";

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
      // TODO: complete loan
      return <div className="mt-3">Loan</div>;
    }
  }
}
