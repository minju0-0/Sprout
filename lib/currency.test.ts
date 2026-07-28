import { afterEach, describe, expect, it, vi } from "vitest";
import { formatCurrency, getCurrencyLabel, detectCurrencyCode } from "@/lib/currency";
describe("formatCurrency", () => {
  it("formats using the given currency code", () => {
    expect(formatCurrency(1234, "USD")).toBe("$1,234");
  });
  it("falls back to USD when currencyCode is null (pre-onboarding)", () => {
    expect(formatCurrency(1234, null)).toBe("$1,234");
  });
  it("falls back to USD instead of throwing on an unrecognized code", () => {
    expect(() => formatCurrency(1234, "NOT_A_CODE")).not.toThrow();
    expect(formatCurrency(1234, "NOT_A_CODE")).toBe("$1,234");
  });
});
describe("getCurrencyLabel", () => {
  it("pairs the code with its display name", () => {
    expect(getCurrencyLabel("PHP")).toBe("PHP — Philippine Peso");
  });
  it("falls back to just the code instead of throwing on an unrecognized code", () => {
    expect(() => getCurrencyLabel("NOT_A_CODE")).not.toThrow();
  });
});
describe("detectCurrencyCode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("maps a recognized browser locale region to its currency", () => {
    vi.stubGlobal("navigator", { language: "en-GB" });
    expect(detectCurrencyCode()).toBe("GBP");
  });
  it("falls back to USD instead of throwing when the locale can't be read", () => {
    vi.stubGlobal("navigator", { language: "xx-XX-XX-INVALID!!!" });
    expect(detectCurrencyCode()).toBe("USD");
  });
});
