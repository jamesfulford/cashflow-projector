import { useFormikContext } from "formik";
import { CurrencyInputSubGroup } from "../../../../../../components/CurrencyInput";
import { useEffect } from "react";

export function BalanceInput() {
  const form = useFormikContext();

  const balance = (form.getFieldMeta("balance").value ?? 10000) as number;

  // only run once on component load
  useEffect(() => {
    if (!balance) form.setFieldValue("balance", 10000);

    // on unmount (if something else is selected), set to undefined
    () => {
      form.setFieldValue("balance", undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CurrencyInputSubGroup
      hideSign
      controlId="balance"
      label="Loan Balance"
      value={balance}
      onValueChange={(newValue) => {
        form.setFieldValue("balance", newValue);
      }}
      style={{ color: undefined }}
      min={0}
    />
  );
}
