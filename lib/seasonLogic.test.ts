import { describe, expect, it } from "vitest";
import {
  getCurrentSeasonLabel,
  getNextSeasonLabel,
  createHarvestRecord,
  resetCategoriesForNewSeason,
  catchUpSeason,
  carryForwardRecurringTransactions,
} from "@/lib/seasonLogic";
import type { BudgetCategory, HarvestRecord, Transaction } from "@/types";

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "txn-1",
    categoryId: "cat-1",
    amount: 50,
    description: "Rent",
    date: "2026-07-03",
    ...overrides,
  };
}

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

describe("getCurrentSeasonLabel", () => {
  it("formats a date as 'Month YYYY'", () => {
    expect(getCurrentSeasonLabel(new Date(2026, 6, 15))).toBe("July 2026");
  });
});

describe("getNextSeasonLabel", () => {
  it("advances to the following month within the same year", () => {
    expect(getNextSeasonLabel("July 2026")).toBe("August 2026");
  });
  it("rolls over into January of the next year after December", () => {
    expect(getNextSeasonLabel("December 2026")).toBe("January 2027");
  });
  it("falls back to the original label for an unparseable input", () => {
    expect(getNextSeasonLabel("not a season")).toBe("not a season");
  });
});

describe("createHarvestRecord", () => {
  it("snapshots the season label, a deep copy of categories, and derived garden health", () => {
    const categories = [makeCategory({ spent: 90 })];
    const record = createHarvestRecord("July 2026", categories);
    expect(record.season).toBe("July 2026");
    expect(record.categories).toEqual(categories);
    expect(record.gardenHealth).toBe("cloudy");
  });
  it("deep-copies categories so mutating the source array never touches the record", () => {
    const categories = [makeCategory({ spent: 10 })];
    const record = createHarvestRecord("July 2026", categories);
    categories[0].spent = 999;
    expect(record.categories[0].spent).toBe(10);
  });
});

describe("resetCategoriesForNewSeason", () => {
  it("zeroes out spent on every category without touching anything else", () => {
    const categories = [
      makeCategory({ id: "a", spent: 40 }),
      makeCategory({ id: "b", spent: 120 }),
    ];
    const reset = resetCategoriesForNewSeason(categories);
    expect(reset.every((category) => category.spent === 0)).toBe(true);
    expect(reset[0].id).toBe("a");
    expect(reset[0].budgetLimit).toBe(100);
    expect(categories[0].spent).toBe(40);
  });
});

describe("carryForwardRecurringTransactions", () => {
  it("returns the reset categories untouched and no new transactions when nothing is recurring", () => {
    const resetCategories = [makeCategory({ spent: 0 })];
    const transactions = [makeTransaction({ isRecurring: false })];
    const result = carryForwardRecurringTransactions(transactions, resetCategories, "August 2026");
    expect(result.transactions).toEqual([]);
    expect(result.categories).toBe(resetCategories);
  });
  it("re-adds a recurring transaction and applies its amount to the matching category", () => {
    const resetCategories = [makeCategory({ id: "cat-1", spent: 0 })];
    const transactions = [
      makeTransaction({ id: "txn-1", categoryId: "cat-1", amount: 50, isRecurring: true }),
    ];
    const result = carryForwardRecurringTransactions(transactions, resetCategories, "August 2026");
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      categoryId: "cat-1",
      amount: 50,
      description: "Rent",
      date: "2026-08-01",
      isRecurring: true,
    });
    expect(result.transactions[0].id).not.toBe("txn-1");
    expect(result.categories.find((category) => category.id === "cat-1")?.spent).toBe(50);
  });
  it("ignores a recurring transaction whose category no longer exists", () => {
    const resetCategories = [makeCategory({ id: "cat-1", spent: 0 })];
    const transactions = [
      makeTransaction({ categoryId: "deleted-category", isRecurring: true }),
    ];
    const result = carryForwardRecurringTransactions(transactions, resetCategories, "August 2026");
    expect(result.transactions).toEqual([]);
    expect(result.categories[0].spent).toBe(0);
  });
  it("leaves one-off transactions out of the carried-forward set entirely", () => {
    const resetCategories = [makeCategory({ id: "cat-1", spent: 0 })];
    const transactions = [
      makeTransaction({ id: "recurring-one", isRecurring: true, amount: 20 }),
      makeTransaction({ id: "one-off", isRecurring: false, amount: 999 }),
    ];
    const result = carryForwardRecurringTransactions(transactions, resetCategories, "August 2026");
    expect(result.transactions).toHaveLength(1);
    expect(result.categories[0].spent).toBe(20);
  });
});

describe("catchUpSeason", () => {
  it("is a no-op when activeSeason already matches the real calendar month", () => {
    const categories = [makeCategory({ spent: 40 })];
    const now = new Date(2026, 6, 15);
    const result = catchUpSeason("July 2026", categories, [], [], now);
    expect(result.rolledOver).toBe(false);
    expect(result.activeSeason).toBe("July 2026");
    expect(result.categories).toBe(categories);
    expect(result.transactions).toEqual([]);
    expect(result.harvestHistory).toEqual([]);
  });

  it("harvests exactly one season when the calendar has moved by one month and carries recurring transactions", () => {
    const categories = [makeCategory({ id: "cat-1", spent: 90 })];
    const transactions = [makeTransaction({ categoryId: "cat-1", amount: 50, isRecurring: true })];
    const now = new Date(2026, 7, 1);

    const result = catchUpSeason("July 2026", categories, [], transactions, now);

    expect(result.rolledOver).toBe(true);
    expect(result.activeSeason).toBe("August 2026");
    // New active season categories should reflect the carried-forward $50 recurring item
    expect(result.categories.find((c) => c.id === "cat-1")?.spent).toBe(50);
    expect(result.harvestHistory).toHaveLength(1);
    expect(result.harvestHistory[0].season).toBe("July 2026");
    expect(result.harvestHistory[0].categories[0].spent).toBe(90);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].date).toBe("2026-08-01");
  });

  it("harvests one record per skipped month and carries recurring transactions into every intermediate harvest snapshot", () => {
    const categories = [makeCategory({ id: "cat-1", spent: 50 })];
    const transactions = [makeTransaction({ categoryId: "cat-1", amount: 30, isRecurring: true })];
    const now = new Date(2026, 9, 1); // Jump from July to October (skipping Aug & Sep)

    const result = catchUpSeason("July 2026", categories, [], transactions, now);

    expect(result.activeSeason).toBe("October 2026");
    expect(result.harvestHistory.map((record) => record.season)).toEqual([
      "September 2026",
      "August 2026",
      "July 2026",
    ]);

    // July harvest records initial snapshot state before reset ($50)
    expect(result.harvestHistory[2].categories[0].spent).toBe(50);

    // August & September harvest snapshots should show $30 applied from recurring carry-forward
    expect(result.harvestHistory[1].categories[0].spent).toBe(30); // August
    expect(result.harvestHistory[0].categories[0].spent).toBe(30); // September

    // Active October category should also have $30 carried forward
    expect(result.categories[0].spent).toBe(30);

    // Final transaction set reflects the carried forward item dated for the current month (October)
    expect(result.transactions[0].date).toBe("2026-10-01");
  });

  it("prepends new harvests ahead of existing harvest history rather than replacing it", () => {
    const existing: HarvestRecord[] = [
      { season: "June 2026", categories: [], gardenHealth: "sunny" },
    ];
    const now = new Date(2026, 7, 1);
    const result = catchUpSeason("July 2026", [makeCategory()], existing, [], now);
    expect(result.harvestHistory[0].season).toBe("July 2026");
    expect(result.harvestHistory[1]).toBe(existing[0]);
  });

  it("falls back to the current label instead of looping forever on a malformed activeSeason", () => {
    const now = new Date(2026, 6, 15);
    const result = catchUpSeason("not a season", [makeCategory()], [], [], now);
    expect(result.rolledOver).toBe(true);
    expect(result.activeSeason).toBe("July 2026");
    expect(result.harvestHistory).toHaveLength(1);
    expect(result.harvestHistory[0].season).toBe("not a season");
  });
});