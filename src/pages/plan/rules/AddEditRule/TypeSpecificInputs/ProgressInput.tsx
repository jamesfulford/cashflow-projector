import { useFormikContext } from "formik";
import { CurrencyInputSubGroup } from "../../../../../components/CurrencyInput";
import { useEffect } from "react";

export function ProgressInput() {
  const form = useFormikContext();

  const progress = (form.getFieldMeta("progress").value ?? 0) as number;
  const goal = (form.getFieldMeta("goal").value ?? 1000) as number;

  // only run once on component load
  useEffect(() => {
    if (!progress) form.setFieldValue("progress", 0);

    // on unmount (if something else is selected), set to undefined
    () => {
      form.setFieldValue("progress", undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if goal changes, update progress
  useEffect(() => {
    if (progress > goal) form.setFieldValue("progress", goal);
  }, [progress, goal, form]);

  return (
    <CurrencyInputSubGroup
      hideSign
      controlId="progress"
      label="Progress"
      value={progress}
      onValueChange={(newValue) => {
        if (newValue > goal) {
          form.setFieldValue("progress", goal);
        } else {
          form.setFieldValue("progress", newValue);
        }
      }}
      style={{ color: undefined }}
      min={0}
      max={goal}
    />
  );
}
