import { Field, FieldProps, useFormikContext } from "formik";

import InputGroup from "react-bootstrap/esm/InputGroup";

import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";

import { CurrencyInputSubGroup } from "../../../../components/CurrencyInput";

export const ValueInput = () => {
  const form = useFormikContext();
  return (
    <Field name="value">
      {({ field }: FieldProps) => {
        const isExpense = field.value < 0;
        const magnitude = Math.abs(field.value);
        return (
          <InputGroup size="sm">
            <BSForm.Select
              aria-label="Income or Expense"
              value={isExpense ? "Expense" : "Income"}
              onChange={(e) => {
                if (field.value < 0 && e.target.value === "Income") {
                  form.setFieldValue("value", magnitude);
                }
                if (field.value > 0 && e.target.value === "Expense") {
                  form.setFieldValue("value", -magnitude);
                }
              }}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </BSForm.Select>
            <CurrencyInputSubGroup
              controlId="value"
              label={"Amount"}
              value={Math.abs(field.value)}
              onValueChange={(newRawValue) => {
                const newValue = isExpense ? -newRawValue : newRawValue;
                form.setFieldValue("value", newValue);
              }}
              onBlur={() => {}}
            />
            <RequiredInputGroup />
          </InputGroup>
        );
      }}
    </Field>
  );
};
