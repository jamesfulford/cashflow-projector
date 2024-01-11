export const numberPattern = /^(-?)(([1-9]\d*)|(0))(\.\d{2})?$/gm.source;

export function formatNumber(currency: number): string {
  return currency.toFixed(2);
}
