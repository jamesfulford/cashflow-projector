import { RRule } from "rrule";
import { Field, FieldProps, useFormikContext } from "formik";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";
import { RecurringWorkingState, YEARLY_HEBREW } from "./types";
import { useState } from "react";
import { useSignalValue } from "../../../../store/useSignalValue";
import { startDateState } from "../../../../store/parameters";

function frequencyIsIn(
  freq: RecurringWorkingState["rrule"]["freq"],
  freqs: RecurringWorkingState["rrule"]["freq"][],
): boolean {
  return freqs.includes(freq);
}

enum StartType {
  NOW = "NOW",
  ON = "ON",
}

export const StartSelector = () => {
  const form = useFormikContext();

  const startDate = useSignalValue(startDateState);

  const _freq = form.getFieldMeta("rrule.freq")
    .value as RecurringWorkingState["rrule"]["freq"];
  // Sometimes its a string, sometimes its a number (bad library types)
  const freq = frequencyIsIn(_freq, [YEARLY_HEBREW]) ? _freq : Number(_freq);

  const interval =
    (form.getFieldMeta("rrule.interval")
      .value as RecurringWorkingState["rrule"]["interval"]) || 1;

  const count =
    (form.getFieldMeta("rrule.count")
      .value as RecurringWorkingState["rrule"]["count"]) || 0;

  const [startType, setStartType] = useState<StartType>(
    form.getFieldMeta("rrule.dtstart").value ? StartType.ON : StartType.NOW,
  );

  return (
    <Field name="rrule.dtstart">
      {({ field }: FieldProps) => {
        const requiredByInterval = interval > 1;
        const requiredByYear = frequencyIsIn(freq, [RRule.YEARLY]);
        const requiredByEndCount = !!count;
        const required =
          requiredByInterval || requiredByYear || requiredByEndCount;

        const effectiveStartType = required ? StartType.ON : startType;
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
              className="p-0 m-0 underline-on-hover"
              style={{
                color: "var(--gray-text)",
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
              aria-label="Select how it starts"
              value={effectiveStartType}
              disabled={required}
              title={required ? 'Must be "on"' : undefined}
              onChange={(e) => {
                const newStartType: StartType = e.target.value as StartType;
                setStartType(newStartType);
                if (newStartType !== startType) {
                  form.setFieldValue("rrule.dtstart", "");
                }
              }}
            >
              <option value={StartType.NOW}>immediately</option>
              <option value={StartType.ON}>on</option>
            </BSForm.Select>

            {effectiveStartType === StartType.ON ? (
              <>
                <BSForm.Control
                  type="date"
                  required={required}
                  // no min date so can select past dates (or not have to edit previously set past dates)
                  {...field}
                  value={field.value ?? startDate} // default to today (avoid React warning when undefined)
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
                {requiredByEndCount && (
                  <RequiredInputGroup
                    why={`Because the end occurs after a set number of times (is ${count}), we need to nail down which date to start counting.`}
                  />
                )}
              </>
            ) : null}
          </InputGroup>
        );
      }}
    </Field>
  );
};
