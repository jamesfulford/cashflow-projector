import React, {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  RefObject,
} from "react";
import Form from "react-bootstrap/esm/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import InputGroup from "react-bootstrap/esm/InputGroup";
import type { FormControlProps } from "react-bootstrap";
import { Omit, BsPrefixProps } from "react-bootstrap/esm/helpers";
import { JSX } from "react/jsx-runtime";
import { InputAttributes, NumericFormat } from "react-number-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";

const BSFormControlForNumericFormat = (
  props: JSX.IntrinsicAttributes &
    Omit<
      Omit<
        DetailedHTMLProps<
          InputHTMLAttributes<HTMLInputElement>,
          HTMLInputElement
        >,
        "ref"
      > & {
        ref?:
          | ((instance: HTMLInputElement | null) => void)
          | RefObject<HTMLInputElement>
          | null
          | undefined;
      },
      BsPrefixProps<"input"> & FormControlProps
    > &
    BsPrefixProps<"input"> &
    FormControlProps & { children?: ReactNode },
) => {
  return <Form.Control {...props} size={undefined} data-mask="true" />;
};

export interface CurrencyInputProps {
  label: string;
  value: number;
  onValueChange: (newValue: number) => void;
  onBlur?: () => void;
  style?: InputAttributes["style"];
  allowNegative?: boolean;
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
    onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    }}
    valueIsNumericString
    onBlur={props.onBlur}
    customInput={BSFormControlForNumericFormat}
    style={{
      ...(props.value && {
        color: (props.value as number) > 0 ? "var(--primary)" : "var(--red)",
      }),
      ...props.style,
    }}
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
}
export const CurrencyInputSubGroup = (props: CurrencyInputSubGroupProps) => {
  // For use inside of an InputGroup
  return (
    <>
      <InputGroup.Text>
        <FontAwesomeIcon icon={faDollarSign} />
      </InputGroup.Text>
      <FloatingLabel controlId={props.controlId} label={props.label}>
        <CurrencyInput {...props} />
      </FloatingLabel>
    </>
  );
};
