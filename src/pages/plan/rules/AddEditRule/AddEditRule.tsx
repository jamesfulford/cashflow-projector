import { forwardRef, useCallback, useMemo, useState } from "react";
import "./AddEditRule.css";
import { Formik } from "formik";
import { WorkingState } from "./types";
import {
  convertWorkingStateToApiRuleMutate,
  ruleToWorkingState,
} from "./translation";
import { IApiRule, IApiRuleMutate } from "../../../../store/rules";
import Container from "react-bootstrap/esm/Container";
import Dropdown from "react-bootstrap/esm/Dropdown";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { RecurringRuleModal } from "./RecurringRuleModal";
import { ListRuleModal } from "./ListRuleModal";
import { RRule } from "rrule";
import Button from "react-bootstrap/esm/Button";

type PartialAddEditRuleType = { id: undefined } & Partial<IApiRuleMutate>;
type AddEditRuleType = IApiRule | PartialAddEditRuleType;
export interface AddEditRuleFormProps {
  onCreate: (rule: IApiRuleMutate) => void;
  onUpdate: (rule: IApiRuleMutate) => void;
  onClose: () => void;
  rule?: AddEditRuleType;
}

interface CreateToggleProps extends React.PropsWithChildren {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (e: any) => void;
}
const CreateToggle = forwardRef(
  ({ children, onClick }: CreateToggleProps, ref) => (
    <Button
      variant="success"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      onClick={onClick}
    >
      {children}
    </Button>
  ),
);

export const AddEditRule = (props: AddEditRuleFormProps) => {
  const [show, setShow] = useState(!!props.rule);

  const [rulePrefill, setRulePrefill] = useState<
    PartialAddEditRuleType | undefined
  >(undefined);

  const rule = useMemo(
    () => props.rule ?? rulePrefill,
    [props.rule, rulePrefill],
  );

  const onCreate = props.onCreate;
  const onUpdate = props.onUpdate;
  const onClose = useCallback(() => {
    props.onClose();
    setShow(false);
  }, [props]);

  return (
    <Container className="justify-content-middle text-center mt-3 mb-3">
      <Dropdown>
        <Dropdown.Toggle as={CreateToggle}>
          Add{" "}
          <FontAwesomeIcon
            title="Create"
            icon={faPlus}
            style={{ cursor: "pointer" }}
          />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <DropdownItem
            style={{ color: "var(--green)", backgroundColor: "transparent" }}
            key="income"
            title="Add Income"
            onClick={() => {
              setRulePrefill({
                id: undefined,
                value: 5,
                rrule: new RRule({
                  interval: 1,
                  freq: RRule.MONTHLY,

                  bymonthday: 1,
                }).toString(),
              });
              setShow(true);
            }}
            as="button"
          >
            Income
          </DropdownItem>
          <DropdownItem
            style={{ color: "var(--red)", backgroundColor: "transparent" }}
            key="expense"
            title="Add Expense"
            onClick={() => {
              setRulePrefill({
                id: undefined,
                value: -5,
                rrule: new RRule({
                  interval: 1,
                  freq: RRule.MONTHLY,

                  bymonthday: 1,
                }).toString(),
              });
              setShow(true);
            }}
            as="button"
          >
            Expense
          </DropdownItem>
          <Dropdown.Divider />
          <DropdownItem
            style={{
              color: "var(--gray-text)",
              backgroundColor: "transparent",
            }}
            key="list"
            title="One-time transactions"
            onClick={() => {
              setRulePrefill({
                id: undefined,
                value: 0,
                rrule: undefined,
              });
              setShow(true);
            }}
            as="button"
          >
            One-time transactions
          </DropdownItem>
        </Dropdown.Menu>
      </Dropdown>

      {show ? (
        <AddEditRuleForm
          onCreate={onCreate}
          onUpdate={onUpdate}
          onClose={onClose}
          rule={rule}
        />
      ) : null}
    </Container>
  );
};

export const AddEditRuleForm = ({
  onCreate,
  onUpdate,
  onClose,
  rule,
}: AddEditRuleFormProps) => {
  const canUpdate = Boolean(rule && rule.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function submit(fields: WorkingState, { setSubmitting }: any) {
    let final: IApiRuleMutate;
    try {
      final = convertWorkingStateToApiRuleMutate(fields);
    } catch (e) {
      console.error(e);
      return;
    }

    if (!canUpdate) {
      await onCreate(final);
    } else {
      await onUpdate(final);
    }

    setSubmitting(false);
    onClose();
  }

  const initialValues = ruleToWorkingState(rule);

  return (
    <Formik initialValues={initialValues} onSubmit={submit}>
      {(props) => {
        const ruleType = props.getFieldMeta("ruleType")
          .value as WorkingState["ruleType"];

        if (ruleType === "recurring") {
          return <RecurringRuleModal onClose={onClose} canUpdate={canUpdate} />;
        } else if (ruleType === "list") {
          return <ListRuleModal onClose={onClose} canUpdate={canUpdate} />;
        }
      }}
    </Formik>
  );
};
