import { describe, expect, it } from "vitest";
import { getDebtProgress, isDebtPaidOff, getBoulderScale } from "@/lib/debtLogic";
import type { Debt } from "@/types";
function makeDebt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: "debt-1",
    name: "Credit Card",
    startingAmount: 1000,
    currentAmount: 1000,
    ...overrides,
  };
}
describe("getDebtProgress", () => {
  it("is 0 for an untouched debt", () => {
    expect(getDebtProgress(makeDebt({ startingAmount: 1000, currentAmount: 1000 }))).toBe(0);
  });
  it("returns the paid-off fraction as payments are made", () => {
    expect(getDebtProgress(makeDebt({ startingAmount: 1000, currentAmount: 750 }))).toBe(0.25);
  });
  it("clamps to 1 once the debt is fully paid or overpaid", () => {
    expect(getDebtProgress(makeDebt({ startingAmount: 1000, currentAmount: 0 }))).toBe(1);
    expect(getDebtProgress(makeDebt({ startingAmount: 1000, currentAmount: -50 }))).toBe(1);
  });
  it("returns 0 for a zero-or-negative starting amount instead of dividing by zero", () => {
    expect(getDebtProgress(makeDebt({ startingAmount: 0, currentAmount: 0 }))).toBe(0);
  });
});
describe("isDebtPaidOff", () => {
  it("is true once currentAmount reaches or drops below zero", () => {
    expect(isDebtPaidOff(makeDebt({ currentAmount: 0 }))).toBe(true);
    expect(isDebtPaidOff(makeDebt({ currentAmount: -10 }))).toBe(true);
  });
  it("is false while a balance remains", () => {
    expect(isDebtPaidOff(makeDebt({ currentAmount: 1 }))).toBe(false);
  });
});
describe("getBoulderScale", () => {
  it("shrinks (unlike a goal tree, which grows) as progress increases", () => {
    expect(getBoulderScale(0)).toBeGreaterThan(getBoulderScale(0.5));
    expect(getBoulderScale(0.5)).toBeGreaterThan(getBoulderScale(1));
  });
  it("is largest at 0 progress and smallest at 1", () => {
    expect(getBoulderScale(0)).toBe(1);
    expect(getBoulderScale(1)).toBeLessThan(1);
  });
});