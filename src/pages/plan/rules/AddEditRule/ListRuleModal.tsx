import { Form, useFormikContext } from "formik";
import { ListWorkingState } from "./types";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import { ExceptionalTransactions } from "./ExceptionalTransactions";
import { NameInput } from "./NameInput";
import { RuleWarningsAndErrors } from "./RuleWarningsAndErrors";

export const ListRuleModal = ({
  onClose,
  canUpdate,
}: {
  onClose: () => void;
  canUpdate: boolean;
}) => {
  const form = useFormikContext<ListWorkingState>();

  const name = form.getFieldMeta("name").value as string;

  const title = canUpdate ? `Update ${name}` : "Add list of transactions";

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

            <hr />

            <ExceptionalTransactions />
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
