import { Form, useFormikContext } from "formik";
import { ListWorkingState } from "./types";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import { ExceptionalTransactions } from "./ExceptionalTransactions";
import { NameInput } from "./NameInput";
import { RuleWarningsAndErrors } from "./RuleWarningsAndErrors";
import { useEffect } from "react";

export const ListRuleModal = ({
  onClose,
  canUpdate,
}: {
  onClose: () => void;
  canUpdate: boolean;
}) => {
  const form = useFormikContext<ListWorkingState>();

  const name = form.getFieldMeta("name").value as string;

  // set default name if none exists
  useEffect(() => {
    if (!canUpdate && !name)
      form.setFieldValue("name", "One-time transactions");
  }, [canUpdate, form, name]);

  const title = canUpdate ? `Update ${name}` : "Add one-time transactions";

  return (
    <Modal show onHide={onClose} keyboard aria-label={title} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div>
            <div>
              <NameInput />
            </div>

            <hr />

            <ExceptionalTransactions baseSign={-1} />
          </div>

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
