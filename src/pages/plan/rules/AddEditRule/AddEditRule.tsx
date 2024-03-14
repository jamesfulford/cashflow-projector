import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { RRule, ByWeekday, Frequency } from "rrule";
import "./AddEditRule.css";
import { Field, FieldArray, FieldProps, Form, Formik } from "formik";
import { WorkingState, ONCE, YEARLY_HEBREW } from "./types";
import {
  convertWorkingStateToApiRuleMutate,
  ruleToWorkingState,
} from "./translation";
import { RulePreview } from "./RulePreview";
import { hebrewMonthToDisplayNameMap } from "./hebrew";
import { IApiRule, IApiRuleMutate } from "../../../../store/rules";
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
import { IParameters } from "../../../../store/parameters";
import { RuleWarningsAndErrors } from "./RuleWarningsAndErrors";
import { Exceptions } from "./Exceptions";

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
  highLowEnabled?: boolean;
  parameters: IParameters;
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

      {show ? (
        <Modal
          show
          onHide={() => {
            setShow(false);
            props.onClose();
          }}
          keyboard
        >
          <AddEditRuleForm {...props} rule={rule} />
        </Modal>
      ) : null}
    </Container>
  );
};

export const AddEditRuleForm = ({
  onCreate,
  onUpdate,
  rule,
  highLowEnabled = false,
  parameters,
}: AddEditRuleFormProps) => {
  const ruleNameInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (ruleNameInputRef.current) ruleNameInputRef.current.focus();
  }, []);
  const canUpdate = rule && rule.id;

  const { startDate } = parameters;

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

  enum StartType {
    NOW = "NOW",
    ON = "ON",
  }
  const [startType, setStartType] = useState<StartType>(
    initialValues.rrule.dtstart ? StartType.ON : StartType.NOW,
  );

  enum EndType {
    NEVER = "NEVER",
    ON = "ON",
    AFTER = "AFTER",
  }
  const [endType, setEndType] = useState<EndType>(
    initialValues.rrule.until
      ? EndType.ON
      : initialValues.rrule.count
        ? EndType.AFTER
        : EndType.NEVER,
  );

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
                                ref={ruleNameInputRef}
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
                              <BSForm.Control
                                type="date"
                                required
                                min={startDate}
                                {...field}
                              />
                              <RequiredInputGroup />
                            </>
                          )}
                        </Field>
                      )}
                      {isEvery && (
                        <Field name="rrule.interval">
                          {({ field }: FieldProps) => (
                            <>
                              <BSForm.Control
                                type="number"
                                min="1"
                                placeholder="Interval"
                                {...field}
                              />
                              <BSForm.Select
                                onChange={(e) => {
                                  const value = e.target.value as unknown as
                                    | Frequency
                                    | "biweekly"
                                    | "daily";
                                  if (freq === value) return;

                                  if (value === "biweekly") {
                                    props.setFieldValue(
                                      "rrule.freq",
                                      RRule.WEEKLY,
                                    );
                                    props.setFieldValue("rrule.interval", 2);
                                    return;
                                  }
                                  if (value === "daily") {
                                    props.setFieldValue(
                                      "rrule.freq",
                                      RRule.WEEKLY,
                                    );
                                    props.setFieldValue("rrule.byweekday", [
                                      RRule.MO.weekday,
                                      RRule.TU.weekday,
                                      RRule.WE.weekday,
                                      RRule.TH.weekday,
                                      RRule.FR.weekday,
                                    ]);
                                    return;
                                  }

                                  props.setFieldValue("rrule.freq", value);

                                  if (value === RRule.MONTHLY) {
                                    props.setFieldValue("rrule.bymonthday", 1);
                                  }
                                }}
                                value={freq}
                              >
                                {interval === 1 ? (
                                  <option value={"daily"}>daily</option>
                                ) : null}
                                <option value={RRule.WEEKLY}>
                                  week{interval > 1 && "s"}
                                </option>
                                {interval === 1 ? (
                                  <option value={"biweekly"}>2 weeks</option>
                                ) : null}
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
                        {({ field }: FieldProps) => {
                          enum ByMonthDayType {
                            FIRST_AND_FIFTEENTH = "1_AND_15",
                            ON = "ON",
                            LAST = "LAST",
                          }
                          const byMonthDayType = Array.isArray(field.value)
                            ? ByMonthDayType.FIRST_AND_FIFTEENTH
                            : field.value === -1
                              ? ByMonthDayType.LAST
                              : ByMonthDayType.ON;
                          return (
                            <InputGroup>
                              <InputGroup.Text>Monthly</InputGroup.Text>
                              <BSForm.Select
                                value={byMonthDayType}
                                onChange={(e) => {
                                  const newByMonthDayType = e.target
                                    .value as ByMonthDayType;

                                  if (byMonthDayType === newByMonthDayType)
                                    return;

                                  if (
                                    newByMonthDayType ===
                                    ByMonthDayType.FIRST_AND_FIFTEENTH
                                  ) {
                                    props.setFieldValue(
                                      "rrule.bymonthday",
                                      [1, 15],
                                    );
                                  } else if (
                                    newByMonthDayType === ByMonthDayType.ON
                                  ) {
                                    props.setFieldValue("rrule.bymonthday", 1);
                                  } else if (
                                    newByMonthDayType === ByMonthDayType.LAST
                                  ) {
                                    props.setFieldValue("rrule.bymonthday", -1);
                                  }
                                }}
                              >
                                <option value={ByMonthDayType.ON}>
                                  on day
                                </option>
                                <option
                                  value={ByMonthDayType.FIRST_AND_FIFTEENTH}
                                >
                                  on 1st and 15th
                                </option>
                                <option value={ByMonthDayType.LAST}>
                                  on the last day
                                </option>
                              </BSForm.Select>

                              {byMonthDayType === ByMonthDayType.ON ? (
                                <>
                                  <BSForm.Control
                                    type="number"
                                    min="1"
                                    max="31"
                                    placeholder="Day of month"
                                    required
                                    {...field}
                                  />
                                  {field.value > 28 && (
                                    <WarningInputGroup
                                      why={
                                        <span>
                                          Since this day is not included in
                                          every month, some months will be
                                          skipped.
                                        </span>
                                      }
                                    />
                                  )}
                                  <RequiredInputGroup />
                                </>
                              ) : null}
                            </InputGroup>
                          );
                        }}
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
                        <InputGroup.Text>On weekdays</InputGroup.Text>
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
                          const requiredByInterval = interval > 1;
                          const requiredByYear = frequencyIsIn(freq, [
                            RRule.YEARLY,
                          ]);
                          const required = requiredByInterval || requiredByYear;

                          const effectiveStartType = required
                            ? StartType.ON
                            : startType;
                          const freqName =
                            freq === RRule.WEEKLY
                              ? "week"
                              : freq === RRule.MONTHLY
                                ? "month"
                                : freq === RRule.YEARLY
                                  ? "year"
                                  : "";
                          const freqNamePlural = freqName + "s";

                          if (effectiveStartType === StartType.NOW) {
                            return (
                              <Button
                                variant="link"
                                className="p-0 m-0"
                                style={{
                                  color: "var(--tertiary)",
                                  textDecoration: "none",
                                }}
                                onClick={() => {
                                  setStartType(StartType.ON);
                                }}
                              >
                                Starts immediately
                              </Button>
                            );
                          }
                          return (
                            <InputGroup>
                              <InputGroup.Text>Starting</InputGroup.Text>
                              <BSForm.Select
                                value={effectiveStartType}
                                disabled={required}
                                title={required ? 'Must be "on"' : undefined}
                                onChange={(e) => {
                                  const newStartType: StartType = e.target
                                    .value as StartType;
                                  setStartType(newStartType);
                                  if (newStartType !== startType) {
                                    props.setFieldValue("rrule.dtstart", "");
                                  }
                                }}
                              >
                                <option value={StartType.NOW}>
                                  immediately
                                </option>
                                <option value={StartType.ON}>on</option>
                              </BSForm.Select>

                              {effectiveStartType === StartType.ON ? (
                                <>
                                  <BSForm.Control
                                    type="date"
                                    required={required}
                                    min={startDate}
                                    {...field}
                                  />
                                  {requiredByInterval && (
                                    <RequiredInputGroup
                                      why={`Because interval is greater than 1 (is ${interval}), we are skipping some ${freqNamePlural}. We need to know the first non-skipped ${freqName} so we consistently skip the same ${freqNamePlural}.`}
                                    />
                                  )}
                                  {requiredByYear && (
                                    <RequiredInputGroup
                                      why={`Because the frequency is yearly, we need to know which day of the year to use.`}
                                    />
                                  )}
                                </>
                              ) : null}
                            </InputGroup>
                          );
                        }}
                      </Field>
                    </div>
                  )}

                  {/* Ending */}
                  {isEvery && (
                    <div className="mt-1">
                      {endType === EndType.NEVER ? (
                        <>
                          <Button
                            variant="link"
                            className="p-0 m-0"
                            style={{
                              color: "var(--tertiary)",
                              textDecoration: "none",
                            }}
                            onClick={() => {
                              setEndType(EndType.ON);
                            }}
                          >
                            Never ends
                          </Button>
                        </>
                      ) : (
                        <>
                          <InputGroup>
                            <InputGroup.Text>Ending</InputGroup.Text>
                            <BSForm.Select
                              value={endType}
                              onChange={(e) => {
                                const newEndType = e.target.value as EndType;
                                setEndType(newEndType);
                                if (newEndType !== endType) {
                                  props.setFieldValue("rrule.until", "");
                                  props.setFieldValue(
                                    "rrule.count",
                                    newEndType === EndType.AFTER ? 10 : 0,
                                  ); // if 0, translates to undefined
                                }
                              }}
                            >
                              <option value={EndType.NEVER}>never</option>
                              <option value={EndType.ON}>on</option>
                              <option value={EndType.AFTER}>after</option>
                            </BSForm.Select>
                            {endType === EndType.ON ? (
                              <Field name="rrule.until">
                                {({ field }: FieldProps) => {
                                  return (
                                    <BSForm.Control
                                      type="date"
                                      min={
                                        (props.getFieldMeta("rrule.dtstart")
                                          .value as string) || startDate
                                      }
                                      {...field}
                                    />
                                  );
                                }}
                              </Field>
                            ) : null}
                            {endType === EndType.AFTER ? (
                              <Field name="rrule.count">
                                {({ field }: FieldProps) => {
                                  return (
                                    <>
                                      <BSForm.Control
                                        placeholder="After"
                                        type="number"
                                        min={1}
                                        {...field}
                                      />
                                      <InputGroup.Text>
                                        {field.value > 1 ? "times" : "time"}
                                      </InputGroup.Text>
                                    </>
                                  );
                                }}
                              </Field>
                            ) : null}
                          </InputGroup>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {isEvery ? (
                  <div className="mt-1">
                    <Exceptions parameters={parameters} />
                  </div>
                ) : null}

                {/* Explaining input */}
                <div className="p-0 m-0 mt-3 text-center">
                  <RulePreview rule={currentRule} />
                </div>

                {/* Warnings + errors */}
                <div>
                  {currentRule ? (
                    <RuleWarningsAndErrors
                      rule={currentRule}
                      parameters={parameters}
                    />
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
