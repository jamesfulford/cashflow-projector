import { RRule, Frequency } from "rrule";
import { Field, FieldProps, useFormikContext } from "formik";
import { ONCE, WorkingState, YEARLY_HEBREW } from "./types";
import InputGroup from "react-bootstrap/esm/InputGroup";
import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";

function frequencyIsIn(
  freq: WorkingState["rrule"]["freq"],
  freqs: WorkingState["rrule"]["freq"][],
): boolean {
  return freqs.includes(freq);
}

export const FrequencySelector = () => {
  const form = useFormikContext();

  const _freq = form.getFieldMeta("rrule.freq")
    .value as WorkingState["rrule"]["freq"];
  // Sometimes its a string, sometimes its a number (bad library types)
  const freq = frequencyIsIn(_freq, [ONCE, YEARLY_HEBREW])
    ? _freq
    : Number(_freq);
  const isOn = freq === ONCE;
  const isEvery = !isOn;

  const interval =
    (form.getFieldMeta("rrule.interval")
      .value as WorkingState["rrule"]["interval"]) || 1;

  return (
    <InputGroup>
      <BSForm.Select
        aria-label="Select whether fixed dates or recurring"
        onChange={(e) => {
          const value = e.target.value;
          if (value === "ON") form.setFieldValue("rrule.freq", ONCE);
          if (value === "EVERY")
            form.setFieldValue("rrule.freq", RRule.MONTHLY);
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
                <option value={RRule.MONTHLY}>
                  month{interval > 1 && "s"}
                </option>
                <option value={RRule.YEARLY}>year{interval > 1 && "s"}</option>
              </BSForm.Select>
            </>
          )}
        </Field>
      )}
    </InputGroup>
  );
};
