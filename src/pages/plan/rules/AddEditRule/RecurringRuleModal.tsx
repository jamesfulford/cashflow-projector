import { Form, useFormikContext } from "formik";
import { RecurringWorkingState } from "./types";
import { RulePreview } from "./RulePreview";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import { RuleWarningsAndErrors } from "./RuleWarningsAndErrors";
import { SkippedDates } from "./SkippedDates";
import { ExceptionalTransactionsWithHiding } from "./ExceptionalTransactions";
import { NameInput } from "./NameInput";
import { ValueInput } from "./ValueInput";
import { FrequencySelector } from "./FrequencySelector";
import { FrequencySpecificSelectors } from "./FrequencySpecificSelectors";
import { StartSelector } from "./StartSelector";
import { EndSelector } from "./EndSelector";
import Card from "react-bootstrap/esm/Card";
import { TypeSpecificInputs } from "./TypeSpecificInputs";
import { RuleType } from "../../../../store/rules";

function titleFromRuleType(ruleType: RuleType) {
  switch (ruleType) {
    case RuleType.EXPENSE:
      return "Add Expense";
    case RuleType.INCOME:
      return "Add Income";
    case RuleType.SAVINGS_GOAL:
      return "Add Savings Goal";
    case RuleType.LOAN:
      return "Add Loan";
    default:
      return "";
  }
}

export const RecurringRuleModal = ({
  onClose,
  canUpdate,
}: {
  onClose: () => void;
  canUpdate: boolean;
}) => {
  const form = useFormikContext<RecurringWorkingState>();

  const name = form.getFieldMeta("name").value as string;
  const value = form.getFieldMeta("value").value as number;
  const type = form.getFieldMeta("type").value as RuleType;
  const title = canUpdate ? `Update ${name}` : titleFromRuleType(type);

  return (
    <Modal show onHide={onClose} keyboard aria-label={title}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div>
            <div>
              <NameInput />
            </div>

            <div className="mt-3">
              <ValueInput />
            </div>

            <TypeSpecificInputs />

            <hr />

            {/* Frequency Selection */}
            <div>
              <FrequencySelector />
            </div>

            {/* Frequency-specific Selectors */}
            <div className="mt-3">
              <FrequencySpecificSelectors />
            </div>

            {/* Starting */}
            <div className="mt-3">
              <StartSelector />
            </div>

            {/* Ending */}
            <div className="mt-1">
              <EndSelector />
            </div>

            {canUpdate && (
              <div className="mt-1">
                <SkippedDates />
              </div>
            )}

            {canUpdate && (
              <div className="mt-1">
                <ExceptionalTransactionsWithHiding
                  defaultIsPositive={value > 0}
                />
              </div>
            )}
          </div>

          {/* Explaining input */}
          <Card className="p-1 m-0 mt-3 text-center">
            <RulePreview />
          </Card>

          {/* Warnings + errors */}
          <div>
            <RuleWarningsAndErrors />
          </div>

          {/* Submission / Actions */}
          <div className="mt-3 d-flex flex-row-reverse">
            <Button type="submit" variant="primary">
              {!canUpdate ? "Create" : `Update ${name}`}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
