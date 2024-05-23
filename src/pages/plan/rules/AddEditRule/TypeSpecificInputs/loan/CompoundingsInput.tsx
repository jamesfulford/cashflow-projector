import { useFormikContext } from "formik";
import { useEffect } from "react";
import Form from "react-bootstrap/esm/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";

enum CompoundingsOptions {
  YEARLY = "YEARLY",
  MONTHLY = "MONTHLY",
  DAILY = "DAILY",
}
function optionToNumber(option: CompoundingsOptions): number {
  switch (option) {
    case CompoundingsOptions.DAILY:
      return 365;
    case CompoundingsOptions.MONTHLY:
      return 12;
    case CompoundingsOptions.YEARLY:
      return 1;
  }
}
function numberToOption(number: number): CompoundingsOptions | undefined {
  switch (number) {
    case 1:
      return CompoundingsOptions.YEARLY;
    case 12:
      return CompoundingsOptions.MONTHLY;
    case 365:
      return CompoundingsOptions.DAILY;
  }
}
export function CompoundingsInput() {
  const form = useFormikContext();

  const compoundingsYearlyNumber = (form.getFieldMeta("compoundingsYearly")
    .value ?? 12) as number;
  const compoundingsYearlyOption =
    numberToOption(compoundingsYearlyNumber) ?? CompoundingsOptions.MONTHLY;

  // only run once on component load
  useEffect(() => {
    if (!compoundingsYearlyNumber) form.setFieldValue("compoundingsYearly", 12);

    // on unmount (if something else is selected), set to undefined
    () => {
      form.setFieldValue("compoundingsYearly", undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FloatingLabel label="Compounds">
      <Form.Select
        aria-label="How often it compounds"
        style={{ fontSize: "1rem" }}
        value={compoundingsYearlyOption}
        onChange={(e) => {
          const number =
            optionToNumber(e.target.value as CompoundingsOptions) ?? 12;
          form.setFieldValue("compoundingsYearly", number);
        }}
      >
        <option value={CompoundingsOptions.YEARLY}>Yearly</option>
        <option value={CompoundingsOptions.MONTHLY}>Monthly</option>
        <option value={CompoundingsOptions.DAILY}>Daily</option>
      </Form.Select>
    </FloatingLabel>
  );
}
