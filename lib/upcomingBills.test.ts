import { describe, expect, it } from "vitest";
import { getUpcomingBills } from "@/lib/upcomingBills";
import type { Transaction } from "@/types";
function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "tx-1",
    categoryId: "cat-1",
    amount: 10,
    description: "Test",
    date: "2026-07-01",
    ...overrides,
  };
}
const today = new Date("2026-07-15T00:00:00");
describe("getUpcomingBills", () => {
  it("ignores non-recurring transactions", () => {
    const result = getUpcomingBills(
      [makeTransaction({ date: "2026-07-20", isRecurring: false })],
      today,
    );
    expect(result.upcoming).toHaveLength(0);
    expect(result.posted).toHaveLength(0);
  });
  it("sorts upcoming bills soonest first", () => {
    const result = getUpcomingBills(
      [
        makeTransaction({ id: "a", date: "2026-07-28", isRecurring: true }),
        makeTransaction({ id: "b", date: "2026-07-16", isRecurring: true }),
      ],
      today,
    );
    expect(result.upcoming.map((t) => t.id)).toEqual(["b", "a"]);
  });
  it("treats today as already posted, not upcoming", () => {
    const result = getUpcomingBills(
      [makeTransaction({ date: "2026-07-15", isRecurring: true })],
      today,
    );
    expect(result.upcoming).toHaveLength(0);
    expect(result.posted).toHaveLength(1);
  });
  it("sorts posted bills most-recent first", () => {
    const result = getUpcomingBills(
      [
        makeTransaction({ id: "a", date: "2026-07-01", isRecurring: true }),
        makeTransaction({ id: "b", date: "2026-07-10", isRecurring: true }),
      ],
      today,
    );
    expect(result.posted.map((t) => t.id)).toEqual(["b", "a"]);
  });
});
