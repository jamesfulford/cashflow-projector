import { forwardRef, useImperativeHandle, useState } from "react";
import { CurrencyInput } from "./CurrencyInput";
import { ICellEditorParams } from "ag-grid-community";

export const CustomCurrencyCellEditor = forwardRef(
  (
    { value, stopEditing, baseSign }: ICellEditorParams & { baseSign: number },
    ref,
  ) => {
    // ag-grid sometimes passes value=NaN.
    // in that case, I want to pretend it's 0
    // and that the original sign is negative (unless another is specified)
    const trueValue = value || 0;
    const trueValueSign =
      baseSign || (value ? Math.abs(trueValue) / trueValue : -1);

    const [_inputValue, setInputValue] = useState(trueValue);
    const inputValue = trueValueSign * _inputValue;

    useImperativeHandle(ref, () => ({
      getValue() {
        return inputValue;
      },
      isPopup() {
        return true;
      },
    }));

    return (
      <CurrencyInput
        style={{
          color: trueValueSign > 0 ? "var(--green)" : "var(--red)",
        }}
        value={_inputValue}
        label="Value"
        onValueChange={setInputValue}
        onBlur={() => stopEditing()}
      />
    );
  },
);
