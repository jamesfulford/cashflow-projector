import { RRule, Frequency } from "rrule";
import { Field, FieldProps, useFormikContext } from "formik";
import { RecurringWorkingState, YEARLY_HEBREW } from "./types";
import InputGroup from "react-bootstrap/esm/InputGroup";
import BSForm from "react-bootstrap/esm/Form";

function frequencyIsIn(
  freq: RecurringWorkingState["rrule"]["freq"],
  freqs: RecurringWorkingState["rrule"]["freq"][],
): boolean {
  return freqs.includes(freq);
}

export const FrequencySelector = () => {
  const form = useFormikContext();

  const _freq = form.getFieldMeta("rrule.freq")
    .value as RecurringWorkingState["rrule"]["freq"];
  // Sometimes its a string, sometimes its a number (bad library types)
  const freq = frequencyIsIn(_freq, [YEARLY_HEBREW]) ? _freq : Number(_freq);

  const interval =
    (form.getFieldMeta("rrule.interval")
      .value as RecurringWorkingState["rrule"]["interval"]) || 1;

  return (
    <InputGroup>
      <InputGroup.Text>Every</InputGroup.Text>
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
              aria-label="Select event recurring pattern"
              onChange={(e) => {
                const value = e.target.value as unknown as
                  | Frequency
                  | "biweekly"
                  | "daily";
                if (freq === value) return;

                if (value === "biweekly") {
                  form.setFieldValue("rrule.freq", RRule.WEEKLY);
                  form.setFieldValue("rrule.interval", 2);
                  return;
                }
                if (value === "daily") {
                  form.setFieldValue("rrule.freq", RRule.WEEKLY);
                  form.setFieldValue("rrule.byweekday", [
                    RRule.MO.weekday,
                    RRule.TU.weekday,
                    RRule.WE.weekday,
                    RRule.TH.weekday,
                    RRule.FR.weekday,
                  ]);
                  return;
                }

                form.setFieldValue("rrule.freq", value);

                if (value === RRule.MONTHLY) {
                  form.setFieldValue("rrule.bymonthday", 1);
                }
              }}
              value={freq}
            >
              {interval === 1 ? <option value={"daily"}>daily</option> : null}
              <option value={RRule.WEEKLY}>week{interval > 1 && "s"}</option>
              {interval === 1 ? (
                <option value={"biweekly"}>2 weeks</option>
              ) : null}
              <option value={RRule.MONTHLY}>month{interval > 1 && "s"}</option>
              <option value={RRule.YEARLY}>year{interval > 1 && "s"}</option>
            </BSForm.Select>
          </>
        )}
      </Field>
    </InputGroup>
  );
};
