import { Field, FieldProps } from "formik";
import InputGroup from "react-bootstrap/esm/InputGroup";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";
import { useEffect, useRef } from "react";

export const NameInput = () => {
  // auto-focus
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);

  return (
    <Field name="name">
      {({ field }: FieldProps) => (
        <>
          <InputGroup size="sm">
            <FloatingLabel controlId="ruleName" label="Name">
              <BSForm.Control
                ref={ref}
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
  );
};
