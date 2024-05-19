import { Field, FieldProps } from "formik";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import BSForm from "react-bootstrap/esm/Form";
import { useFormikContext } from "formik";
import { useState } from "react";
import { DateDisplay } from "../../../../components/date/DateDisplay";
import { registerSupportFor } from "../../../../services/vote";
import { RuleType } from "../../../../store/rules";

enum EndType {
  NEVER = "NEVER",
  ON = "ON", // set date
  AFTER = "AFTER", // finite count
  ON_GOAL_REACHED = "ON_GOAL_REACHED", // when $ amount hit (record balance, goal; maintain with reconciliation)
  ON_PAID_OFF = "ON_PAID_OFF", // when loan paid off (record balance due, interest rate, simple/compound; maintain with reconciliation)
}

export const EndSelector = () => {
  const form = useFormikContext();

  const until = form.getFieldMeta("rrule.until").value as string | undefined;
  const count = form.getFieldMeta("rrule.count").value as number | undefined;

  const [endType, setEndType] = useState<EndType>(
    until ? EndType.ON : count ? EndType.AFTER : EndType.NEVER,
  );

  const [show, setShow] = useState(false);

  // don't allow setting end selector if is savings goal or loan
  const type = form.getFieldMeta("type").value as RuleType;
  if ([RuleType.LOAN, RuleType.SAVINGS_GOAL].includes(type)) return null;

  return (
    <>
      <Button
        variant="link"
        className="p-0 m-0 underline-on-hover"
        style={{
          color: "var(--gray-text)",
          textDecoration: "none",
        }}
        onClick={() => {
          setShow((s) => !s);
        }}
      >
        {show ? (
          <>Hide ending criteria</>
        ) : (
          <>
            Show ending criteria (
            {until ? (
              <>
                ending on <DateDisplay date={until} />
              </>
            ) : count ? (
              <>
                ending after {count} {count > 1 ? "times" : "time"}
              </>
            ) : (
              <>never ending</>
            )}
            )
          </>
        )}
      </Button>
      {show && (
        <InputGroup className="mt-2 mb-2">
          <InputGroup.Text>Ending</InputGroup.Text>
          <BSForm.Select
            aria-label="Select how it ends"
            value={endType}
            onChange={(e) => {
              const newEndType = e.target.value as EndType;

              if (newEndType === EndType.ON_PAID_OFF) {
                registerSupportFor("end_type_on_paid_off");
                alert(
                  `Thank you for clicking! We're still considering creating this feature, and your click helps us know what you would find useful.`,
                );
                return;
              }

              setEndType(newEndType);
              if (newEndType !== endType) {
                form.setFieldValue("rrule.until", "");
                form.setFieldValue(
                  "rrule.count",
                  newEndType === EndType.AFTER ? 10 : 0,
                ); // if 0, translates to undefined

                if (newEndType === EndType.ON_GOAL_REACHED) {
                  form.setFieldValue("type", RuleType.SAVINGS_GOAL);
                } else {
                  form.setFieldValue(
                    "type",
                    (form.getFieldMeta("value").value as number) > 0
                      ? RuleType.INCOME
                      : RuleType.EXPENSE,
                  );
                }
              }
            }}
          >
            <option value={EndType.NEVER}>never</option>
            <option value={EndType.ON}>on</option>
            <option value={EndType.AFTER}>after</option>
            <option value={EndType.ON_GOAL_REACHED}>when saved enough</option>
            <option value={EndType.ON_PAID_OFF}>when loan paid off</option>
          </BSForm.Select>
          {endType === EndType.ON ? (
            <Field name="rrule.until">
              {({ field }: FieldProps) => {
                return (
                  <BSForm.Control
                    type="date"
                    min={form.getFieldMeta("rrule.dtstart").value as string}
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
      )}
    </>
  );
};
