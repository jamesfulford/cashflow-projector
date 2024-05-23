import React, {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  RefObject,
} from "react";
import Form from "react-bootstrap/esm/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import InputGroup from "react-bootstrap/esm/InputGroup";
// eslint-disable-next-line no-restricted-imports
import type { FormControlProps } from "react-bootstrap";
import { Omit, BsPrefixProps } from "react-bootstrap/esm/helpers";
import { JSX } from "react/jsx-runtime";
import { InputAttributes, NumericFormat } from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons/faDollarSign";
import { BSFormControlForNumericFormat } from "./CurrencyInput";

export interface CurrencyInputProps {
  label: string;
  value: number;
  onValueChange: (newValue: number) => void;
  onBlur?: () => void;
  style?: InputAttributes["style"];
  allowNegative?: boolean;
  min?: number;
  max?: number;
}

export const CurrencyInput = (props: CurrencyInputProps) => (
  <NumericFormat
    placeholder={props.label}
    value={props.value}
    onValueChange={(values) => {
      if (values.floatValue !== undefined) {
        props.onValueChange(values.floatValue);
      }
    }}
    isAllowed={(values) => {
      const { floatValue } = values;
      if (floatValue === undefined) return true;
      if (props.min !== undefined && floatValue < props.min) return false;
      if (props.max !== undefined && floatValue > props.max) return false;
      return true;
    }}
    onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    }}
    valueIsNumericString
    onBlur={props.onBlur}
    customInput={BSFormControlForNumericFormat}
    allowNegative={props.allowNegative ?? false}
    decimalScale={2}
    fixedDecimalScale
    thousandsGroupStyle="thousand"
    thousandSeparator=","
    maxLength={15}
  />
);

interface CurrencyInputSubGroupProps extends CurrencyInputProps {
  controlId: string;
  hideSign?: boolean;
}
export const CurrencyInputSubGroup = (props: CurrencyInputSubGroupProps) => {
  // For use inside of an InputGroup
  return (
    <>
      {props.hideSign ? null : (
        <InputGroup.Text>
          <FontAwesomeIcon icon={faDollarSign} />
        </InputGroup.Text>
      )}

      <FloatingLabel controlId={props.controlId} label={props.label}>
        <CurrencyInput {...props} />
      </FloatingLabel>
    </>
  );
};
