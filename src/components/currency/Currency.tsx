import React from "react";
import "./Currency.css";
import { formatCurrency } from "./formatCurrency";

export interface CurrencyProps {
  /**
   * US Dollar Amount to be displayed.
   */
  value: number;
}

export const Currency = React.memo(({ value }: CurrencyProps) => {
  if (value < 0) {
    return (
      <span className="currency-negative">
        <CurrencyColorless value={value} />
      </span>
    );
  }
  if (value > 0) {
    return (
      <span className="currency-positive">
        <CurrencyColorless value={value} />
      </span>
    );
  }
  return (
    <span>
      <CurrencyColorless value={0} />
    </span>
  );
});

export const CurrencyColorless = React.memo(({ value }: CurrencyProps) => {
  const presentedValue = value ? formatCurrency(value) : "-";

  return <span className="mask">{presentedValue}</span>;
});
