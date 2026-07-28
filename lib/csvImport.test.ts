import { describe, expect, it } from "vitest";
import {
  parseCsvText,
  guessColumnMapping,
  normalizeDate,
  normalizeAmount,
  buildImportRows,
  toImportableTransactions,
} from "@/lib/csvImport";
import type { BudgetCategory } from "@/types";
function makeCategory(overrides: Partial<BudgetCategory> = {}): BudgetCategory {
  return {
    id: "cat-1",
    name: "Groceries",
    budgetLimit: 400,
    spent: 0,
    species: "tomato",
    ...overrides,
  };
}
describe("parseCsvText", () => {
  it("splits header and rows on commas", () => {
    const rows = parseCsvText("Date,Description,Amount\n2026-01-05,Coffee,4.50");
    expect(rows).toEqual([
      ["Date", "Description", "Amount"],
      ["2026-01-05", "Coffee", "4.50"],
    ]);
  });
  it("handles quoted fields containing commas", () => {
    const rows = parseCsvText('Date,Description,Amount\n2026-01-05,"Coffee, large",4.50');
    expect(rows[1]).toEqual(["2026-01-05", "Coffee, large", "4.50"]);
  });
  it("drops blank trailing lines", () => {
    const rows = parseCsvText("Date,Amount\n2026-01-05,4.50\n\n");
    expect(rows).toHaveLength(2);
  });
});
describe("guessColumnMapping", () => {
  it("matches common header keywords", () => {
    const mapping = guessColumnMapping(["Date", "Description", "Amount", "Category"]);
    expect(mapping).toEqual({ date: 0, description: 1, amount: 2, category: 3 });
  });
  it("returns null for fields it can't guess", () => {
    const mapping = guessColumnMapping(["Foo", "Bar"]);
    expect(mapping).toEqual({ date: null, description: null, amount: null, category: null });
  });
});
describe("normalizeDate", () => {
  it("passes through an already-ISO date", () => {
    expect(normalizeDate("2026-03-14")).toBe("2026-03-14");
  });
  it("converts M/D/YYYY to ISO", () => {
    expect(normalizeDate("3/4/2026")).toBe("2026-03-04");
  });
  it("returns null for garbage", () => {
    expect(normalizeDate("not a date")).toBeNull();
  });
});
describe("normalizeAmount", () => {
  it("strips currency symbols and commas", () => {
    expect(normalizeAmount("$1,234.56")).toBe(1234.56);
  });
  it("treats parenthesized values as their absolute value", () => {
    expect(normalizeAmount("(45.00)")).toBe(45);
  });
  it("returns null for zero or unparseable values", () => {
    expect(normalizeAmount("0")).toBeNull();
    expect(normalizeAmount("")).toBeNull();
  });
});
describe("buildImportRows", () => {
  const categories = [makeCategory()];
  const mapping = { date: 0, description: 1, amount: 2, category: 3 };
  it("flags an unrecognized date as an error", () => {
    const [row] = buildImportRows([["not-a-date", "Coffee", "4.50", "Groceries"]], mapping, categories);
    expect(row.error).toBe("Unrecognized date");
  });
  it("matches a category name case-insensitively", () => {
    const [row] = buildImportRows(
      [["2026-01-05", "Coffee", "4.50", "groceries"]],
      mapping,
      categories,
    );
    expect(row.categoryId).toBe("cat-1");
    expect(row.error).toBeNull();
  });
  it("leaves categoryId null when nothing matches", () => {
    const [row] = buildImportRows(
      [["2026-01-05", "Coffee", "4.50", "Unmatched Category"]],
      mapping,
      categories,
    );
    expect(row.categoryId).toBeNull();
  });
});
describe("toImportableTransactions", () => {
  const categories = [makeCategory()];
  const mapping = { date: 0, description: 1, amount: 2, category: 3 };
  it("drops rows with errors", () => {
    const rows = buildImportRows(
      [
        ["2026-01-05", "Coffee", "4.50", "Groceries"],
        ["bad-date", "Snacks", "2.00", "Groceries"],
      ],
      mapping,
      categories,
    );
    const transactions = toImportableTransactions(rows, null);
    expect(transactions).toHaveLength(1);
  });
  it("applies the fallback category to unmatched rows", () => {
    const rows = buildImportRows(
      [["2026-01-05", "Coffee", "4.50", "Unmatched"]],
      mapping,
      categories,
    );
    const transactions = toImportableTransactions(rows, "cat-1");
    expect(transactions[0].categoryId).toBe("cat-1");
  });
  it("drops unmatched rows when there is no fallback", () => {
    const rows = buildImportRows(
      [["2026-01-05", "Coffee", "4.50", "Unmatched"]],
      mapping,
      categories,
    );
    expect(toImportableTransactions(rows, null)).toHaveLength(0);
  });
});
