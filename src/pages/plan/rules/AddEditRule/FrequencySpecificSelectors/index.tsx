import { ByWeekday, RRule } from "rrule";
import { Field, FieldArray, FieldProps, useFormikContext } from "formik";
import { ONCE, WorkingState, YEARLY_HEBREW } from "../types";
import { hebrewMonthToDisplayNameMap } from "../hebrew";
import Button from "react-bootstrap/esm/Button";
import InputGroup from "react-bootstrap/esm/InputGroup";
import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../../components/RequiredInputGroup";
import { WarningInputGroup } from "../../../../../components/WarningInputGroup";

function frequencyIsIn(
  freq: WorkingState["rrule"]["freq"],
  freqs: WorkingState["rrule"]["freq"][],
): boolean {
  return freqs.includes(freq);
}

export const FrequencySpecificSelectors = () => {
  const form = useFormikContext();

  const _freq = form.getFieldMeta("rrule.freq")
    .value as WorkingState["rrule"]["freq"];
  // Sometimes its a string, sometimes its a number (bad library types)
  const freq = frequencyIsIn(_freq, [ONCE, YEARLY_HEBREW])
    ? _freq
    : Number(_freq);

  const byweekday = ((form.getFieldMeta("rrule.byweekday")
    .value as WorkingState["rrule"]["byweekday"]) || []) as ByWeekday[];

  return (
    <>
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
                  aria-label="Select how it recurs in a monthly way"
                  value={byMonthDayType}
                  onChange={(e) => {
                    const newByMonthDayType = e.target.value as ByMonthDayType;

                    if (byMonthDayType === newByMonthDayType) return;

                    if (
                      newByMonthDayType === ByMonthDayType.FIRST_AND_FIFTEENTH
                    ) {
                      form.setFieldValue("rrule.bymonthday", [1, 15]);
                    } else if (newByMonthDayType === ByMonthDayType.ON) {
                      form.setFieldValue("rrule.bymonthday", 1);
                    } else if (newByMonthDayType === ByMonthDayType.LAST) {
                      form.setFieldValue("rrule.bymonthday", -1);
                    }
                  }}
                >
                  <option value={ByMonthDayType.ON}>on day</option>
                  <option value={ByMonthDayType.FIRST_AND_FIFTEENTH}>
                    on 1st and 15th
                  </option>
                  <option value={ByMonthDayType.LAST}>on the last day</option>
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
                            Since this day is not included in every month, some
                            months will be skipped.
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
                {Array.from(hebrewMonthToDisplayNameMap.entries()).map(
                  ([value, display]: [number, string]) => {
                    return <option value={value}>{display}</option>;
                  },
                )}
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
                  {days.map(({ rruleday, displayday, displayName }) => (
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
                          arrayHelpers.remove(byweekday.indexOf(rruleday));
                        } else {
                          arrayHelpers.push(rruleday);
                        }
                      }}
                    >
                      {displayday}
                    </Button>
                  ))}
                </>
              );
            }}
          </FieldArray>
        </InputGroup>
      )}
    </>
  );
};
