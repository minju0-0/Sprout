import type { AllocationEvent, BudgetCategory, MoneyPocket } from "@/types";
import { getAvailableToMove } from "@/lib/gardenLogic";

export interface MoveMoneyInput {
  categories: BudgetCategory[];
  unallocated: number;
  from: MoneyPocket;
  to: MoneyPocket;
  amount: number;
}

export interface MoveMoneyResult {
  categories: BudgetCategory[];
  unallocated: number;
  event: AllocationEvent;
}

export class AllocationError extends Error {}

/**
 * Moves a positive amount of money from one pocket (a category envelope, or
 * the unallocated pool) to another. Pure function — no crypto.randomUUID or
 * Date.now() calls except via the injected idFactory/date, so it's testable
 * without mocking globals.
 *
 * Rules that keep the garden's numbers honest:
 * - `from` and `to` must be different pockets.
 * - amount must be a positive, finite number.
 * - a category can only give up its *available* balance (budgetLimit - spent),
 *   never money that's already been spent — see getAvailableToMove.
 * - the unallocated pool can't go negative.
 */
export function moveMoney(
  input: MoveMoneyInput,
  idFactory: () => string = () => crypto.randomUUID(),
  date: () => string = () => new Date().toISOString(),
): MoveMoneyResult {
  const { categories, unallocated, from, to, amount } = input;
  if (from === to) {
    throw new AllocationError("Source and destination must be different.");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AllocationError("Amount must be a number greater than 0.");
  }
  const available = from === "unallocated" ? unallocated : getAvailableToMove(
    categories.find((category) => category.id === from) as BudgetCategory,
  );
  if (from !== "unallocated" && !categories.some((category) => category.id === from)) {
    throw new AllocationError("Source category not found.");
  }
  if (to !== "unallocated" && !categories.some((category) => category.id === to)) {
    throw new AllocationError("Destination category not found.");
  }
  if (amount > available) {
    throw new AllocationError("That's more than is available to move.");
  }
  const nextCategories = categories.map((category) => {
    if (category.id === from) {
      return { ...category, budgetLimit: category.budgetLimit - amount };
    }
    if (category.id === to) {
      return { ...category, budgetLimit: category.budgetLimit + amount };
    }
    return category;
  });
  const nextUnallocated =
    unallocated + (from === "unallocated" ? -amount : 0) + (to === "unallocated" ? amount : 0);
  const event: AllocationEvent = {
    id: idFactory(),
    type: from === "unallocated" ? "fill" : "transfer",
    amount,
    from,
    to,
    date: date(),
  };
  return { categories: nextCategories, unallocated: nextUnallocated, event };
}

export function addIncomeEvent(
  amount: number,
  idFactory: () => string = () => crypto.randomUUID(),
  date: () => string = () => new Date().toISOString(),
  note?: string,
): AllocationEvent {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AllocationError("Amount must be a number greater than 0.");
  }
  return { id: idFactory(), type: "income", amount, from: null, to: "unallocated", note, date: date() };
}
