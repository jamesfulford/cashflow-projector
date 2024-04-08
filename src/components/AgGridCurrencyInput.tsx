import { forwardRef, useImperativeHandle, useState } from "react";
import { CurrencyInput } from "./CurrencyInput";
import { ICellEditorParams } from "ag-grid-community";

export const CustomCurrencyCellEditor = forwardRef(
  ({ value, stopEditing }: ICellEditorParams, ref) => {
    const [inputValue, setInputValue] = useState(value);

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
        allowNegative
        value={inputValue}
        label="Value"
        onValueChange={setInputValue}
        onBlur={() => stopEditing()}
      />
    );
  },
);
