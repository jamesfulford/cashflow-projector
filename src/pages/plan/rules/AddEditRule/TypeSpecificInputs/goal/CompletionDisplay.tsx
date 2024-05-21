import { useFormikContext } from "formik";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

export function CompletionDisplay() {
  const form = useFormikContext();

  const progress = (form.getFieldMeta("progress").value ?? 0) as number;
  const goal = (form.getFieldMeta("goal").value ?? 1000) as number;

  const percentage = progress / goal;

  return (
    <InputGroupText
      style={{ color: percentage === 1 ? "var(--green)" : "inherit" }}
    >
      =&nbsp;
      <span className="mask">{(100 * percentage).toFixed(0)}</span>%
    </InputGroupText>
  );
}
