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
import { DateDisplay } from "../../../../components/date/DateDisplay";
import Tippy from "@tippyjs/react";

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

  const freqName =
    freq === RRule.WEEKLY
      ? "week"
      : freq === RRule.MONTHLY
        ? "month"
        : freq === RRule.YEARLY
          ? "year"
          : "";
  const freqNamePlural = freqName + "s";

  const requiredByInterval = interval > 1;
  const requiredByIntervalWhy = `Because interval is greater than 1 (is ${interval}), we are skipping some ${freqNamePlural}. We need to know the first non-skipped ${freqName} so we consistently skip the same ${freqNamePlural}.`;
  const requiredByYear = frequencyIsIn(freq, [RRule.YEARLY]);
  const requiredByYearWhy = `Because the frequency is yearly, we need to know which day of the year to use.`;
  const requiredByEndCount = !!count;
  const requiredByEndCountWhy = `Because the end occurs after a set number of times (is ${count}), we need to nail down which date to start counting.`;
  const required = requiredByInterval || requiredByYear || requiredByEndCount;

  const effectiveStartType = required ? StartType.ON : startType;

  const [show, setShow] = useState(false);
  const effectiveShow = show || required;

  return (
    <Field name="rrule.dtstart">
      {({ field }: FieldProps) => {
        return (
          <>
            <Button
              aria-label="Show start criteria"
              variant="link"
              className={"p-0 m-0 " + (required ? "" : "underline-on-hover")}
              style={{
                color: "var(--gray-text)",
                textDecoration: "none",
                cursor: required ? "not-allowed" : "pointer",
                opacity: required ? "80%" : "100%",
              }}
              onClick={() => {
                if (required) return;
                setShow((s) => !s);
              }}
            >
              {effectiveShow ? (
                required ? (
                  <Tippy
                    content={
                      <>
                        Required.
                        <br />
                        {requiredByInterval && requiredByIntervalWhy}
                        {requiredByYear && requiredByYearWhy}
                        {requiredByEndCount && requiredByEndCountWhy}
                      </>
                    }
                  >
                    <span>Start criteria (required)</span>
                  </Tippy>
                ) : (
                  <>Hide start criteria</>
                )
              ) : (
                <>
                  Show start criteria (
                  {field.value ? (
                    <>
                      starting on <DateDisplay date={field.value} />
                    </>
                  ) : (
                    <>starting immediately</>
                  )}
                  )
                </>
              )}
            </Button>
            {effectiveShow && (
              <InputGroup className="mt-2 mb-2">
                {required ? (
                  <InputGroup.Text>Starting on</InputGroup.Text>
                ) : (
                  <InputGroup.Text>Starting</InputGroup.Text>
                )}

                {!required && (
                  <BSForm.Select
                    aria-label="Select how it starts"
                    value={effectiveStartType}
                    disabled={required}
                    onChange={(e) => {
                      const newStartType: StartType = e.target
                        .value as StartType;
                      setStartType(newStartType);
                      if (newStartType !== startType) {
                        form.setFieldValue("rrule.dtstart", "");
                      }
                    }}
                  >
                    <option value={StartType.NOW}>immediately</option>
                    <option value={StartType.ON}>on</option>
                  </BSForm.Select>
                )}

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
                      <RequiredInputGroup why={requiredByIntervalWhy} />
                    )}
                    {requiredByYear && (
                      <RequiredInputGroup why={requiredByYearWhy} />
                    )}
                    {requiredByEndCount && (
                      <RequiredInputGroup why={requiredByEndCountWhy} />
                    )}
                  </>
                ) : null}
              </InputGroup>
            )}
          </>
        );
      }}
    </Field>
  );
};
