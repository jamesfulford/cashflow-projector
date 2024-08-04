import { Field, FieldProps, useFormikContext } from "formik";

import InputGroup from "react-bootstrap/esm/InputGroup";

import BSForm from "react-bootstrap/esm/Form";
import { RequiredInputGroup } from "../../../../components/RequiredInputGroup";

import { CurrencyInputSubGroup } from "../../../../components/CurrencyInput";
import { RuleType } from "../../../../store/rules";
import { WorkingState } from "./types";
import { useEffect } from "react";
import { HelpInputGroup } from "../../../../components/HelpInputGroup";
import { SavingsGoalIcon } from "../../../../components/SavingsGoalIcon";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";

export const ValueInput = () => {
  const form = useFormikContext();

  const value = form.getFieldMeta("value").value as number;
  const type = form.getFieldMeta("type").value as RuleType;
  useEffect(() => {
    // keep value's sign in sync
    if (value > 0 && type !== RuleType.INCOME) {
      form.setFieldValue("value", -value);
    }
    if (value < 0 && type === RuleType.INCOME) {
      form.setFieldValue("value", -value);
    }
  }, [form, type, value]);

  const isEmergencyFund = !!form.getFieldMeta("isEmergencyFund").value;

  return (
    <Field name="value">
      {({ field: valueField }: FieldProps) => {
        return (
          <Field name="type">
            {({ field: typeField }: FieldProps<WorkingState["type"]>) => {
              const isIncome = typeField.value === RuleType.INCOME;

              return (
                <InputGroup size="sm">
                  {isEmergencyFund && (
                    <HelpInputGroup
                      helptext={
                        <>
                          An <EmergencyFundIcon /> Emergency Fund is a special{" "}
                          <SavingsGoalIcon /> Savings Goal that cannot be
                          converted to another type.
                        </>
                      }
                    />
                  )}

                  <BSForm.Select
                    aria-label="Income or Expense"
                    style={{ fontSize: "1rem" }}
                    {...typeField}
                    disabled={isEmergencyFund}
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
                    <option value={RuleType.LOAN}>Loan</option>
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
