import { forwardRef, useCallback, useMemo, useState } from "react";
import "./AddEditRule.css";
import { Form, Formik } from "formik";
import { WorkingState, ONCE, YEARLY_HEBREW } from "./types";
import {
  convertWorkingStateToApiRuleMutate,
  ruleToWorkingState,
} from "./translation";
import { RulePreview } from "./RulePreview";
import { IApiRule, IApiRuleMutate } from "../../../../store/rules";
import Container from "react-bootstrap/esm/Container";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import Dropdown from "react-bootstrap/esm/Dropdown";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { RuleWarningsAndErrors } from "./RuleWarningsAndErrors";
import { SkippedDates } from "./SkippedDates";
import { startDateState } from "../../../../store/parameters";
import { useSignalValue } from "../../../../store/useSignalValue";
import { ExceptionalTransactions } from "./ExceptionalTransactions";
import { NameInput } from "./NameInput";
import { ValueInput } from "./ValueInput";
import { FrequencySelector } from "./FrequencySelector";
import { FrequencySpecificSelectors } from "./FrequencySpecificSelectors";
import { StartSelector } from "./StartSelector";
import { EndSelector } from "./EndSelector";

function frequencyIsIn(
  freq: WorkingState["rrule"]["freq"],
  freqs: WorkingState["rrule"]["freq"][],
): boolean {
  return freqs.includes(freq);
}

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
    <button
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className="call-to-action mb-3 p-0"
      style={{ width: 50, height: 50, borderRadius: "50%" }}
      onClick={onClick}
    >
      {children}
    </button>
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
    <Container className="justify-content-middle text-center mt-2">
      <Dropdown>
        <Dropdown.Toggle as={CreateToggle}>
          <FontAwesomeIcon title="Create" icon={faPlus} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <DropdownItem
            style={{ color: "var(--primary)", backgroundColor: "transparent" }}
            key="income"
            title="Add Income"
            onClick={() => {
              setRulePrefill({ id: undefined, value: 5 });
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
              setRulePrefill({ id: undefined, value: -5 });
              setShow(true);
            }}
            as="button"
          >
            Expense
          </DropdownItem>
        </Dropdown.Menu>
      </Dropdown>

      {show ? (
        <Modal
          show
          onHide={onClose}
          keyboard
          aria-label="Add or update an income or expense"
        >
          <AddEditRuleForm
            onCreate={onCreate}
            onUpdate={onUpdate}
            onClose={onClose}
            rule={rule}
          />
        </Modal>
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
  const canUpdate = rule && rule.id;

  const startDate = useSignalValue(startDateState);

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
        const _freq = props.getFieldMeta("rrule.freq")
          .value as WorkingState["rrule"]["freq"];
        // Sometimes its a string, sometimes its a number (bad library types)
        const freq = frequencyIsIn(_freq, [ONCE, YEARLY_HEBREW])
          ? _freq
          : Number(_freq);

        const isOn = freq === ONCE;
        const isEvery = !isOn;

        let currentRule: IApiRuleMutate | undefined;
        try {
          currentRule = convertWorkingStateToApiRuleMutate(
            props.getFieldMeta("").value as WorkingState,
          );
        } catch {
          console.warn(
            "Was not able to convert to rule",
            props.getFieldMeta("").value,
          );
        }

        return (
          <>
            <Modal.Header closeButton>
              {canUpdate ? (
                <Modal.Title>Update {(rule as IApiRule).name}</Modal.Title>
              ) : (
                <Modal.Title>
                  {(props.getFieldMeta("value").value as number) > 0 ? (
                    <>Add Income</>
                  ) : (
                    <>Add Expense</>
                  )}
                </Modal.Title>
              )}
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
                  {isEvery && (
                    <div className="mt-3">
                      <StartSelector startDate={startDate} />
                    </div>
                  )}

                  {/* Ending */}
                  {isEvery && (
                    <div className="mt-1">
                      <EndSelector />
                    </div>
                  )}
                </div>

                {isEvery ? (
                  <div className="mt-1">
                    <SkippedDates />
                  </div>
                ) : null}

                {isEvery ? (
                  <div className="mt-1">
                    <ExceptionalTransactions />
                  </div>
                ) : null}

                {/* Explaining input */}
                <div className="p-0 m-0 mt-3 text-center">
                  <RulePreview rule={currentRule} />
                </div>

                {/* Warnings + errors */}
                <div>
                  {currentRule ? (
                    <RuleWarningsAndErrors rule={currentRule} />
                  ) : null}
                </div>

                {/* Submission / Actions */}
                <div className="mt-3 d-flex flex-row-reverse">
                  <Button type="submit" variant="primary">
                    {!canUpdate ? "Create" : `Update ${rule?.name}`}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </>
        );
      }}
    </Formik>
  );
};
