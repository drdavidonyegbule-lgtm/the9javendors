export const DEFAULT_CURRENCY_SYMBOL = "₦";

/** Formats an amount with a store-configured currency symbol. */
export function formatMoney(amount: number, symbol: string = DEFAULT_CURRENCY_SYMBOL): string {
  const rounded = Math.round(Number.isFinite(amount) ? amount : 0);
  return `${symbol}${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(rounded)}`;
}

export function formatNaira(amount: number): string {
  return formatMoney(amount, DEFAULT_CURRENCY_SYMBOL);
}

export function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}
