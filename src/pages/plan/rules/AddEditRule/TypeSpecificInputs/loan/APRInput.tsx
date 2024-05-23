import { useFormikContext } from "formik";
import { BSFormControlForNumericFormat } from "../../../../../../components/CurrencyInput";
import { useEffect } from "react";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import { NumericFormat } from "react-number-format";

export function APRInput() {
  const form = useFormikContext();

  const apr = (form.getFieldMeta("apr").value ?? 0.06) as number;

  // only run once on component load
  useEffect(() => {
    if (!apr) form.setFieldValue("apr", 0.06);

    // on unmount (if something else is selected), set to undefined
    () => {
      form.setFieldValue("apr", undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <FloatingLabel label="APR (%)">
        <NumericFormat
          placeholder={"APR (%)"}
          value={apr}
          onValueChange={(values) => {
            if (values.floatValue !== undefined) {
              form.setFieldValue("apr", values.floatValue);
            }
          }}
          isAllowed={(values) => {
            const { floatValue } = values;
            if (floatValue === undefined) return true;
            if (floatValue < 0) return false; // must be positive
            return true;
          }}
          onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.code === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          customInput={BSFormControlForNumericFormat}
          allowNegative={false}
          decimalScale={2}
          fixedDecimalScale
          thousandsGroupStyle="thousand"
          thousandSeparator=","
        />
      </FloatingLabel>
    </>
  );
}
