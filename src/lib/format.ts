const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCurrencyWithSign(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${currencyFormatter.format(Math.abs(value))}`;
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)} %`;
}

export function formatAgeYears(age: number): string {
  return `${Math.round(age)} Jahre`;
}

