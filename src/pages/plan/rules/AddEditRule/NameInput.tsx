import { Field, FieldProps, useFormikContext } from "formik";
import InputGroup from "react-bootstrap/esm/InputGroup";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";
import { useEffect, useRef } from "react";
import { HelpInputGroup } from "../../../../components/HelpInputGroup";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";

export const NameInput = () => {
  // auto-focus
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);

  const form = useFormikContext();
  const isEmergencyFund = !!form.getFieldMeta("isEmergencyFund").value;

  return (
    <Field name="name">
      {({ field }: FieldProps) => (
        <>
          <InputGroup size="sm">
            {isEmergencyFund && (
              <HelpInputGroup
                helptext={
                  <>
                    Your <EmergencyFundIcon /> Emergency Fund cannot be renamed.
                  </>
                }
              />
            )}

            <FloatingLabel controlId="ruleName" label="Name">
              <BSForm.Control
                ref={ref}
                placeholder="Name"
                type="text"
                disabled={isEmergencyFund}
                required
                {...field}
              />
            </FloatingLabel>
            <RequiredInputGroup />
          </InputGroup>
        </>
      )}
    </Field>
  );
};
