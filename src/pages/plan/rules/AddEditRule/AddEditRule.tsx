import { forwardRef, useMemo, useState } from "react";
import { RRule, ByWeekday } from "rrule";
import "./AddEditRule.css";
import { Field, FieldArray, FieldProps, Form, Formik } from "formik";
import { WorkingState, ONCE, YEARLY_HEBREW } from "./types";
import {
  convertWorkingStateToApiRuleMutate,
  ruleToWorkingState,
} from "./translation";
import { RulePreview } from "./RulePreview";
import { hebrewMonthToDisplayNameMap } from "./hebrew";
import { IApiRule, IApiRuleMutate } from "../../../../services/RulesService";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import Dropdown from "react-bootstrap/esm/Dropdown";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";
import { WarningInputGroup } from "../../../../components/WarningInputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CurrencyInput } from "../../../../components/CurrencyInput";

function frequencyIsIn(
  freq: WorkingState["rrule"]["freq"],
  freqs: WorkingState["rrule"]["freq"][],
): boolean {
  return freqs.includes(freq);
}

type PartialAddEditRuleType = { id: undefined } & Partial<IApiRuleMutate>;
type AddEditRuleType = IApiRule | PartialAddEditRuleType;
export interface AddEditRuleFormProps {
  onCreate: (rule: IApiRuleMutate) => Promise<void>;
  onUpdate: (rule: IApiRuleMutate) => Promise<void>;
  onClose: () => void;
  rule?: AddEditRuleType;
  highLowEnabled?: boolean;
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

export const AddEditRule = ({ ...props }: AddEditRuleFormProps) => {
  const [show, setShow] = useState(!!props.rule);

  const [rulePrefill, setRulePrefill] = useState<
    PartialAddEditRuleType | undefined
  >(undefined);

  const rule = useMemo(
    () => props.rule ?? rulePrefill,
    [props.rule, rulePrefill],
  );

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

      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          props.onClose();
        }}
        keyboard
      >
        <AddEditRuleForm {...props} rule={rule} />
      </Modal>
    </Container>
  );
};

export const AddEditRuleForm = ({
  onCreate,
  onUpdate,
  rule,
  highLowEnabled = false,
}: AddEditRuleFormProps) => {
  const canUpdate = rule && rule.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function submit(fields: WorkingState, { setSubmitting }: any) {
    let final: IApiRuleMutate;
    try {
      final = convertWorkingStateToApiRuleMutate(fields, { highLowEnabled });
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

        const byweekday = ((props.getFieldMeta("rrule.byweekday")
          .value as WorkingState["rrule"]["byweekday"]) || []) as ByWeekday[];

        const interval =
          (props.getFieldMeta("rrule.interval")
            .value as WorkingState["rrule"]["interval"]) || 1;

        let currentRule: IApiRuleMutate | undefined;
        try {
          currentRule = convertWorkingStateToApiRuleMutate(
            props.getFieldMeta("").value as WorkingState,
            { highLowEnabled },
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
                    <Field name="name">
                      {({ field }: FieldProps) => (
                        <>
                          <InputGroup size="sm">
                            <FloatingLabel controlId="ruleName" label="Name">
                              <BSForm.Control
                                placeholder="Name"
                                type="text"
                                required
                                {...field}
                              />
                            </FloatingLabel>
                            <RequiredInputGroup />
                          </InputGroup>
                        </>
                      )}
                    </Field>
                  </div>

                  <div className="mt-3">
                    <Field name="value">
                      {({ field }: FieldProps) => {
                        const isExpense = field.value < 0;
                        const magnitude = Math.abs(field.value);
                        return (
                          <InputGroup size="sm">
                            <BSForm.Select
                              value={isExpense ? "Expense" : "Income"}
                              onChange={(e) => {
                                if (
                                  field.value < 0 &&
                                  e.target.value === "Income"
                                ) {
                                  props.setFieldValue("value", magnitude);
                                }
                                if (
                                  field.value > 0 &&
                                  e.target.value === "Expense"
                                ) {
                                  props.setFieldValue("value", -magnitude);
                                }
                              }}
                            >
                              <option value="Expense">Expense</option>
                              <option value="Income">Income</option>
                            </BSForm.Select>
                            <CurrencyInput
                              controlId="value"
                              label={"Amount"}
                              value={Math.abs(field.value)}
                              onValueChange={(newRawValue) => {
                                const newValue = isExpense
                                  ? -newRawValue
                                  : newRawValue;
                                props.setFieldValue("value", newValue);
                              }}
                              style={{
                                color: isExpense
                                  ? "var(--red)"
                                  : "var(--primary)",
                              }}
                              onBlur={() => {}}
                            />
                            <RequiredInputGroup />
                          </InputGroup>
                        );
                      }}
                    </Field>
                  </div>

                  <hr />

                  {/* Frequency Selection */}
                  <div>
                    <InputGroup>
                      <BSForm.Select
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "ON")
                            props.setFieldValue("rrule.freq", ONCE);
                          if (value === "EVERY")
                            props.setFieldValue("rrule.freq", RRule.MONTHLY);
                        }}
                        value={isOn ? "ON" : "EVERY"}
                      >
                        <option value={"ON"}>On</option>
                        <option value={"EVERY"}>Every</option>
                      </BSForm.Select>
                      {isOn && (
                        <Field name="rrule.dtstart">
                          {({ field }: FieldProps) => (
                            <>
                              <BSForm.Control type="date" required {...field} />
                              <RequiredInputGroup />
                            </>
                          )}
                        </Field>
                      )}
                      {isEvery && (
                        <Field name="rrule.interval">
                          {({ field }: FieldProps) => (
                            <>
                              <FloatingLabel
                                controlId="interval"
                                label="Interval"
                              >
                                <BSForm.Control
                                  type="number"
                                  min="1"
                                  placeholder="Interval"
                                  {...field}
                                />
                              </FloatingLabel>
                              <BSForm.Select
                                onChange={(e) => {
                                  const value = e.target.value;
                                  props.setFieldValue("rrule.freq", value);
                                }}
                                value={freq}
                              >
                                <option value={RRule.WEEKLY}>
                                  week{interval > 1 && "s"}
                                </option>
                                <option value={RRule.MONTHLY}>
                                  month{interval > 1 && "s"}
                                </option>
                                <option value={RRule.YEARLY}>
                                  year{interval > 1 && "s"}
                                </option>
                              </BSForm.Select>
                            </>
                          )}
                        </Field>
                      )}
                    </InputGroup>
                  </div>

                  {/* Frequency-specific Selectors */}
                  <div className="mt-3">
                    {/* Monthly day-of-month selector */}
                    {frequencyIsIn(freq, [RRule.MONTHLY]) && (
                      <Field name="rrule.bymonthday">
                        {({ field }: FieldProps) => (
                          <InputGroup>
                            <FloatingLabel
                              controlId="bymonthday"
                              label="Day of month"
                            >
                              <BSForm.Control
                                type="number"
                                min="1"
                                max="31"
                                placeholder="Day of month"
                                required
                                {...field}
                              />
                            </FloatingLabel>
                            {field.value > 28 && (
                              <WarningInputGroup
                                why={
                                  <span>
                                    Since this day is not included in every
                                    month, some months will be skipped. If you
                                    want to enter the last day of the month, use
                                    the 1st of the next month. If this is
                                    something you need, please let us know on{" "}
                                    <a
                                      href="https://github.com/jamesfulford/cashflow-projector/issues/7"
                                      target="_blank"
                                    >
                                      this issue tracker thread
                                    </a>
                                    .
                                  </span>
                                }
                              />
                            )}
                            <RequiredInputGroup />
                          </InputGroup>
                        )}
                      </Field>
                    )}

                    {/* YEARLY_HEBREW */}
                    {frequencyIsIn(freq, [YEARLY_HEBREW]) && (
                      <Field name="rrule.byhebrewmonth">
                        {({ field }: FieldProps) => (
                          <>
                            <label htmlFor="byhebrewmonth" className="sr-only">
                              Month
                            </label>
                            <select
                              className="form-control form-control-sm"
                              id="byhebrewmonth"
                              required
                              {...field}
                            >
                              {Array.from(
                                hebrewMonthToDisplayNameMap.entries(),
                              ).map(([value, display]: [number, string]) => {
                                return <option value={value}>{display}</option>;
                              })}
                            </select>
                          </>
                        )}
                      </Field>
                    )}

                    {/* YEARLY_HEBREW */}
                    {frequencyIsIn(freq, [YEARLY_HEBREW]) && (
                      <Field name="rrule.byhebrewday">
                        {({ field }: FieldProps) => (
                          <>
                            <label htmlFor="byhebrewday" className="sr-only">
                              Day
                            </label>
                            <input
                              className="form-control form-control-sm sl-input"
                              id="byhebrewday"
                              style={{ width: 64 }}
                              type="number"
                              min="1"
                              max="30"
                              required
                              {...field}
                            />
                          </>
                        )}
                      </Field>
                    )}

                    {/* Weekly days selector */}
                    {frequencyIsIn(freq, [RRule.WEEKLY]) && (
                      <InputGroup>
                        <FieldArray name="rrule.byweekday">
                          {(arrayHelpers) => {
                            const days = [
                              {
                                rruleday: RRule.SU.weekday,
                                displayday: "S",
                                displayName: "Sunday",
                              },
                              {
                                rruleday: RRule.MO.weekday,
                                displayday: "M",
                                displayName: "Monday",
                              },
                              {
                                rruleday: RRule.TU.weekday,
                                displayday: "T",
                                displayName: "Tuesday",
                              },
                              {
                                rruleday: RRule.WE.weekday,
                                displayday: "W",
                                displayName: "Wednesday",
                              },
                              {
                                rruleday: RRule.TH.weekday,
                                displayday: "T",
                                displayName: "Thursday",
                              },
                              {
                                rruleday: RRule.FR.weekday,
                                displayday: "F",
                                displayName: "Friday",
                              },
                              {
                                rruleday: RRule.SA.weekday,
                                displayday: "S",
                                displayName: "Saturday",
                              },
                            ];
                            return (
                              <>
                                {days.map(
                                  ({ rruleday, displayday, displayName }) => (
                                    <Button
                                      type="button"
                                      variant={
                                        byweekday.includes(rruleday)
                                          ? "primary"
                                          : "outline-primary"
                                      }
                                      data-dayofweek={rruleday}
                                      key={rruleday.toString()}
                                      title={displayName}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (byweekday.includes(rruleday)) {
                                          arrayHelpers.remove(
                                            byweekday.indexOf(rruleday),
                                          );
                                        } else {
                                          arrayHelpers.push(rruleday);
                                        }
                                      }}
                                    >
                                      {displayday}
                                    </Button>
                                  ),
                                )}
                              </>
                            );
                          }}
                        </FieldArray>
                      </InputGroup>
                    )}
                  </div>

                  {/* Starting */}
                  {isEvery && (
                    <div className="mt-3">
                      <Field name="rrule.dtstart">
                        {({ field }: FieldProps) => {
                          const required = interval > 1;
                          const freqName =
                            freq === RRule.WEEKLY
                              ? "week"
                              : freq === RRule.MONTHLY
                                ? "month"
                                : freq === RRule.YEARLY
                                  ? "year"
                                  : "";
                          const freqNamePlural = freqName + "s";
                          return (
                            <InputGroup>
                              <FloatingLabel
                                controlId="starting"
                                label="Starting"
                              >
                                <BSForm.Control
                                  type="date"
                                  required={required}
                                  {...field}
                                />
                              </FloatingLabel>
                              {required && (
                                <RequiredInputGroup
                                  why={`Because interval is greater than 1 (is ${interval}), we are skipping some ${freqNamePlural}. We need to know the first non-skipped ${freqName} so we consistently skip the same ${freqNamePlural}.`}
                                />
                              )}
                            </InputGroup>
                          );
                        }}
                      </Field>
                    </div>
                  )}

                  {/* Ending */}
                  {isEvery && (
                    <div className="mt-3">
                      <Field name="rrule.until">
                        {({ field }: FieldProps) => {
                          return (
                            <InputGroup>
                              <FloatingLabel controlId="ending" label="Ending">
                                <BSForm.Control
                                  type="date"
                                  min={
                                    props.getFieldMeta("rrule.dtstart")
                                      .value as string
                                  }
                                  {...field}
                                />
                              </FloatingLabel>
                            </InputGroup>
                          );
                        }}
                      </Field>
                    </div>
                  )}
                </div>

                {/* Explaining input */}
                <div className="p-0 m-0 mt-3 text-center">
                  <RulePreview rule={currentRule} />
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
