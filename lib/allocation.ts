// lib/allocation.ts
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
  // Validate that both pockets actually exist BEFORE looking anything up
  // by id — getAvailableToMove() below dereferences the found category
  // directly, so doing this after would let an unknown `from` throw a raw
  // TypeError instead of a clean AllocationError.
  if (from !== "unallocated" && !categories.some((category) => category.id === from)) {
    throw new AllocationError("Source category not found.");
  }
  if (to !== "unallocated" && !categories.some((category) => category.id === to)) {
    throw new AllocationError("Destination category not found.");
  }
  const available =
    from === "unallocated"
      ? unallocated
      : getAvailableToMove(categories.find((category) => category.id === from) as BudgetCategory);
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