import { forwardRef, useImperativeHandle, useState } from "react";
import { CurrencyInput } from "./CurrencyInput";
import { ICellEditorParams } from "ag-grid-community";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faMinus } from "@fortawesome/free-solid-svg-icons/faMinus";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { AppTooltip } from "./Tooltip";

export const CustomCurrencyCellEditor = forwardRef(
  (
    {
      value,
      stopEditing,
      defaultIsPositive,
    }: ICellEditorParams & { defaultIsPositive?: boolean },
    ref,
  ) => {
    // ag-grid sometimes passes value=NaN.
    // in that case, I want to pretend it's 0
    const initialValue: number = value || 0;

    const [valueState, setValueState] = useState(Math.abs(initialValue));

    // sign:
    // - if initial value, then use that's sign (if 0, then use hint)
    // - if no initial value, then use hint
    // - if no hint, use negative
    const _defaultIsPositive = defaultIsPositive || false;
    const [isPositive, setIsPositive] = useState(
      value
        ? initialValue
          ? initialValue > 0
          : _defaultIsPositive
        : _defaultIsPositive,
    );

    useImperativeHandle(ref, () => ({
      getValue() {
        return isPositive ? valueState : -valueState;
      },
      isPopup() {
        return true;
      },
    }));

    return (
      <InputGroup>
        <InputGroup.Text>
          <AppTooltip
            content={
              <>Switch to {isPositive ? <>negative</> : <>positive</>}</>
            }
          >
            <span>
              <FontAwesomeIcon
                onClick={() => {
                  setIsPositive((s) => !s);
                }}
                style={{
                  cursor: "pointer",
                  color: isPositive ? "var(--green)" : "var(--red)",
                }}
                icon={isPositive ? faPlus : faMinus}
              />
            </span>
          </AppTooltip>
        </InputGroup.Text>
        <CurrencyInput
          style={{
            color: isPositive ? "var(--green)" : "var(--red)",
            textAlign: "end",
          }}
          value={valueState}
          label="Value"
          onValueChange={setValueState}
          onBlur={() => stopEditing()}
        />
      </InputGroup>
    );
  },
);
