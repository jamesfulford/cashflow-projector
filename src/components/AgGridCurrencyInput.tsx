import { forwardRef, useImperativeHandle, useState } from "react";
import { CurrencyInput } from "./CurrencyInput";
import { ICellEditorParams } from "ag-grid-community";

export const CustomCurrencyCellEditor = forwardRef(
  ({ value, stopEditing }: ICellEditorParams, ref) => {
    const [_inputValue, setInputValue] = useState(value);
    const inputValue = (Math.abs(value) / value) * _inputValue;

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
          color: value > 0 ? "var(--green)" : "var(--red)",
        }}
        value={_inputValue}
        label="Value"
        onValueChange={setInputValue}
        onBlur={() => stopEditing()}
      />
    );
  },
);
