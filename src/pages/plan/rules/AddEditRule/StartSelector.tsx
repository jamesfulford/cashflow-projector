import { RRule } from "rrule";
import { Field, FieldProps, useFormikContext } from "formik";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";
import { ONCE, WorkingState, YEARLY_HEBREW } from "./types";
import { useState } from "react";

function frequencyIsIn(
  freq: WorkingState["rrule"]["freq"],
  freqs: WorkingState["rrule"]["freq"][],
): boolean {
  return freqs.includes(freq);
}

enum StartType {
  NOW = "NOW",
  ON = "ON",
}

export const StartSelector = ({ startDate }: { startDate: string }) => {
  const form = useFormikContext();

  const _freq = form.getFieldMeta("rrule.freq")
    .value as WorkingState["rrule"]["freq"];
  // Sometimes its a string, sometimes its a number (bad library types)
  const freq = frequencyIsIn(_freq, [ONCE, YEARLY_HEBREW])
    ? _freq
    : Number(_freq);

  const interval =
    (form.getFieldMeta("rrule.interval")
      .value as WorkingState["rrule"]["interval"]) || 1;

  const [startType, setStartType] = useState<StartType>(
    form.getFieldMeta("rrule.dtstart").value ? StartType.ON : StartType.NOW,
  );

  return (
    <Field name="rrule.dtstart">
      {({ field }: FieldProps) => {
        const requiredByInterval = interval > 1;
        const requiredByYear = frequencyIsIn(freq, [RRule.YEARLY]);
        const required = requiredByInterval || requiredByYear;

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
  );
};
