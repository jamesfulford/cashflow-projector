const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  const s = formatter.format(value);
  if (s.endsWith(".00")) return s.replaceAll(".00", "");
  return s;
}
