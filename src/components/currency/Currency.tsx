import React from "react";
import "./Currency.css";

var formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return formatter.format(value);
}

export interface CurrencyProps {
  /**
   * US Dollar Amount to be displayed.
   */
  value: number;
}

export const Currency = ({ value }: CurrencyProps) => {
  const presentedValue = formatCurrency(value);

  if (value < 0) {
    return <span className="currency-negative">{presentedValue}</span>;
  }
  return <span className="currency-positive">{presentedValue}</span>;
};
