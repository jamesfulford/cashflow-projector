import { Field, FieldProps } from "formik";
import InputGroup from "react-bootstrap/esm/InputGroup";
import BSForm from "react-bootstrap/esm/Form";
import { useSignalValue } from "../../../../store/useSignalValue";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";
import { todayState } from "../../../../store/reconcile";

export const StartSelector = () => {
  const today = useSignalValue(todayState);

  return (
    <Field name="rrule.dtstart">
      {({ field }: FieldProps) => {
        return (
          <>
            <InputGroup className="mt-2 mb-2">
              <InputGroup.Text>Starting on</InputGroup.Text>
              <BSForm.Control
                type="date"
                required
                // no min date so can select past dates (or not have to edit previously set past dates)
                {...field}
                value={field.value ?? today} // default to today (good UX and avoids React warning when undefined)
              />
              <RequiredInputGroup />
            </InputGroup>
          </>
        );
      }}
    </Field>
  );
};
