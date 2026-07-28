import countryToCurrency from "country-to-currency";
export const COMMON_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "PHP",
  "INR",
  "AUD",
  "CAD",
  "SGD",
  "CNY",
  "KRW",
  "MXN",
  "BRL",
  "ZAR",
  "CHF",
  "NZD",
  "IDR",
  "THB",
  "VND",
  "AED",
] as const;
export function formatCurrency(amount: number, currencyCode: string | null): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode ?? "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
export function getCurrencyLabel(currencyCode: string): string {
  try {
    const displayNames = new Intl.DisplayNames(undefined, { type: "currency" });
    const name = displayNames.of(currencyCode);
    return name ? `${currencyCode} — ${name}` : currencyCode;
  } catch {
    return currencyCode;
  }
}
export function detectCurrencyCode(): string {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    if (region && region in countryToCurrency) {
      return countryToCurrency[region];
    }
  } catch {
  }
  return "USD";
}
