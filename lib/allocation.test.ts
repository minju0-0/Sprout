import { describe, expect, it } from "vitest";
import { AllocationError, addIncomeEvent, moveMoney } from "@/lib/allocation";
import type { BudgetCategory } from "@/types";

function makeCategory(overrides: Partial<BudgetCategory> = {}): BudgetCategory {
  return {
    id: "cat-1",
    name: "Groceries",
    budgetLimit: 100,
    spent: 40,
    species: "tomato",
    ...overrides,
  };
}

describe("moveMoney", () => {
  it("fills a category from unallocated", () => {
    const categories = [makeCategory()];
    const result = moveMoney(
      { categories, unallocated: 50, from: "unallocated", to: "cat-1", amount: 20 },
      () => "id-1",
      () => "2026-07-01T00:00:00.000Z",
    );
    expect(result.unallocated).toBe(30);
    expect(result.categories[0].budgetLimit).toBe(120);
    expect(result.event).toEqual({
      id: "id-1",
      type: "fill",
      amount: 20,
      from: "unallocated",
      to: "cat-1",
      date: "2026-07-01T00:00:00.000Z",
    });
  });

  it("transfers available balance between two categories", () => {
    const categories = [
      makeCategory({ id: "cat-1", budgetLimit: 100, spent: 40 }),
      makeCategory({ id: "cat-2", name: "Dining", budgetLimit: 50, spent: 10 }),
    ];
    const result = moveMoney(
      { categories, unallocated: 0, from: "cat-1", to: "cat-2", amount: 30 },
      () => "id-2",
    );
    expect(result.categories.find((c) => c.id === "cat-1")?.budgetLimit).toBe(70);
    expect(result.categories.find((c) => c.id === "cat-2")?.budgetLimit).toBe(80);
    expect(result.event.type).toBe("transfer");
  });

  it("returns money from a category back to unallocated", () => {
    const categories = [makeCategory({ budgetLimit: 100, spent: 40 })];
    const result = moveMoney({ categories, unallocated: 0, from: "cat-1", to: "unallocated", amount: 25 });
    expect(result.unallocated).toBe(25);
    expect(result.categories[0].budgetLimit).toBe(75);
  });

  it("rejects moving more than a category's available (unspent) balance", () => {
    const categories = [makeCategory({ budgetLimit: 100, spent: 90 })];
    expect(() =>
      moveMoney({ categories, unallocated: 0, from: "cat-1", to: "unallocated", amount: 20 }),
    ).toThrow(AllocationError);
  });

  it("rejects moving more than what's unallocated", () => {
    const categories = [makeCategory()];
    expect(() =>
      moveMoney({ categories, unallocated: 10, from: "unallocated", to: "cat-1", amount: 20 }),
    ).toThrow(AllocationError);
  });

  it("rejects a zero or negative amount", () => {
    const categories = [makeCategory()];
    expect(() =>
      moveMoney({ categories, unallocated: 50, from: "unallocated", to: "cat-1", amount: 0 }),
    ).toThrow(AllocationError);
  });

  it("rejects moving to the same pocket", () => {
    const categories = [makeCategory()];
    expect(() =>
      moveMoney({ categories, unallocated: 50, from: "cat-1", to: "cat-1", amount: 10 }),
    ).toThrow(AllocationError);
  });

  it("rejects an unknown category id", () => {
    const categories = [makeCategory()];
    expect(() =>
      moveMoney({ categories, unallocated: 50, from: "unallocated", to: "missing", amount: 10 }),
    ).toThrow(AllocationError);
  });
});

describe("addIncomeEvent", () => {
  it("builds an income allocation event", () => {
    const event = addIncomeEvent(500, () => "id-3", () => "2026-07-01T00:00:00.000Z", "Paycheck");
    expect(event).toEqual({
      id: "id-3",
      type: "income",
      amount: 500,
      from: null,
      to: "unallocated",
      note: "Paycheck",
      date: "2026-07-01T00:00:00.000Z",
    });
  });

  it("rejects a non-positive amount", () => {
    expect(() => addIncomeEvent(0)).toThrow(AllocationError);
  });
});
