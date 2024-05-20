import { useFormikContext } from "formik";
import { CurrencyInputSubGroup } from "../../../../../components/CurrencyInput";
import { useEffect } from "react";

export function GoalInput() {
  const form = useFormikContext();

  const goal = (form.getFieldMeta("goal").value ?? 1000) as number;

  // only run once on component load
  useEffect(() => {
    if (!goal) form.setFieldValue("goal", 1000);

    // on unmount (if something else is selected), set to undefined
    () => {
      form.setFieldValue("goal", undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CurrencyInputSubGroup
      hideSign
      controlId="goal"
      label="Goal"
      value={goal}
      onValueChange={(newValue) => {
        form.setFieldValue("goal", newValue);
      }}
      style={{ color: undefined }}
      min={0.01} // no 0
    />
  );
}
