import { Field, FieldProps, useFormikContext } from "formik";

import InputGroup from "react-bootstrap/esm/InputGroup";

import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";

import { CurrencyInputSubGroup } from "../../../../components/CurrencyInput";
import { RuleType } from "../../../../store/rules";
import { WorkingState } from "./types";

export const ValueInput = () => {
  const form = useFormikContext();
  return (
    <Field name="value">
      {({ field: valueField }: FieldProps) => {
        return (
          <Field name="type">
            {({ field: typeField }: FieldProps<WorkingState["type"]>) => {
              const isIncome = typeField.value === RuleType.INCOME;

              return (
                <InputGroup size="sm">
                  <BSForm.Select
                    aria-label="Income or Expense"
                    style={{ fontSize: "1rem" }}
                    {...typeField}
                    onChange={(e) => {
                      typeField.onChange(e);
                      const newRuleType = e.target.value as RuleType;

                      // maintain value's sign
                      if (
                        valueField.value < 0 &&
                        newRuleType === RuleType.INCOME
                      ) {
                        form.setFieldValue("value", Math.abs(valueField.value));
                      } else if (
                        valueField.value > 0 &&
                        newRuleType !== RuleType.INCOME
                      ) {
                        form.setFieldValue(
                          "value",
                          -Math.abs(valueField.value),
                        );
                      }
                    }}
                  >
                    <option value={RuleType.EXPENSE}>Expense</option>
                    <option value={RuleType.INCOME}>Income</option>
                    <option value={RuleType.SAVINGS_GOAL}>Savings Goal</option>
                  </BSForm.Select>
                  <CurrencyInputSubGroup
                    controlId="value"
                    label={"Amount"}
                    value={Math.abs(valueField.value)}
                    onValueChange={(newRawValue) => {
                      const newValue = isIncome ? newRawValue : -newRawValue;
                      form.setFieldValue("value", newValue);
                    }}
                    style={{
                      color: isIncome ? "var(--green)" : "var(--red)",
                    }}
                  />
                  <RequiredInputGroup />
                </InputGroup>
              );
            }}
          </Field>
        );
      }}
    </Field>
  );
};
