import type { BudgetCategory, HarvestRecord, Transaction } from "@/types";
import { getGardenHealth } from "@/lib/gardenLogic";
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export function getCurrentSeasonLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}
export function getNextSeasonLabel(currentLabel: string): string {
  const [monthName, yearString] = currentLabel.split(" ");
  const monthIndex = MONTH_NAMES.indexOf(monthName);
  const year = Number(yearString);
  if (monthIndex === -1 || !Number.isFinite(year)) {
    return currentLabel;
  }
  const nextMonthIndex = (monthIndex + 1) % 12;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  return `${MONTH_NAMES[nextMonthIndex]} ${nextYear}`;
}
export function createHarvestRecord(
  season: string,
  categories: BudgetCategory[],
): HarvestRecord {
  return {
    season,
    categories: categories.map((category) => ({ ...category })),
    gardenHealth: getGardenHealth(categories),
  };
}
export function resetCategoriesForNewSeason(categories: BudgetCategory[]): BudgetCategory[] {
  return categories.map((category) => ({
    ...category,
    spent: 0,
    budgetLimit: category.baseBudgetLimit ?? category.budgetLimit,
  }));
}
/**
 * Bug fix (money-conservation): resetCategoriesForNewSeason snaps a
 * category's budgetLimit back down to its baseBudgetLimit, discarding any
 * mid-season "Move money" fill on top of it. That fill was real money moved
 * out of the unallocated pool — if it wasn't spent, it has to go somewhere
 * when the season resets, or it's destroyed instead of just reset.
 *
 * This computes, per category, the unspent portion of the mid-season fill
 * only (never the category's original baseline budget) — capped at what's
 * actually unspent, since spent money isn't there to refund. Callers add
 * the total to `unallocated` at the same time they reset categories.
 */
export function getSeasonEndUnallocatedRefund(categories: BudgetCategory[]): number {
  return categories.reduce((total, category) => {
    const baseline = category.baseBudgetLimit ?? category.budgetLimit;
    const midSeasonFill = category.budgetLimit - baseline;
    const unspent = category.budgetLimit - category.spent;
    const refund = Math.max(0, Math.min(midSeasonFill, unspent));
    return total + refund;
  }, 0);
}
function getSeasonStartDate(seasonLabel: string): string {
  const [monthName, yearString] = seasonLabel.split(" ");
  const monthIndex = MONTH_NAMES.indexOf(monthName);
  const year = Number(yearString);
  if (monthIndex === -1 || !Number.isFinite(year)) {
    return new Date().toISOString().slice(0, 10);
  }
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}
export function isDateInSeason(dateIso: string, seasonLabel: string): boolean {
  const seasonStart = getSeasonStartDate(seasonLabel);
  return dateIso.slice(0, 7) === seasonStart.slice(0, 7);
}
export interface RecurringCarryForwardResult {
  transactions: Transaction[];
  categories: BudgetCategory[];
}
export function carryForwardRecurringTransactions(
  outgoingTransactions: Transaction[],
  resetCategories: BudgetCategory[],
  currentSeasonLabel: string,
  newSeasonLabel: string,
): RecurringCarryForwardResult {
  const recurring = outgoingTransactions.filter(
    (transaction) =>
      transaction.isRecurring && isDateInSeason(transaction.date, currentSeasonLabel),
  );
  if (recurring.length === 0) {
    return { transactions: [], categories: resetCategories };
  }
  const date = getSeasonStartDate(newSeasonLabel);
  const existingCategoryIds = new Set(resetCategories.map((category) => category.id));
  const carriedTransactions: Transaction[] = [];
  let categories = resetCategories;
  for (const source of recurring) {
    if (!existingCategoryIds.has(source.categoryId)) continue;
    const carried: Transaction = {
      id: crypto.randomUUID(),
      categoryId: source.categoryId,
      amount: source.amount,
      description: source.description,
      date,
      isRecurring: true,
    };
    carriedTransactions.push(carried);
    categories = categories.map((category) =>
      category.id === carried.categoryId
        ? { ...category, spent: category.spent + carried.amount }
        : category,
    );
  }
  return { transactions: carriedTransactions, categories };
}
export interface SeasonRolloverResult {
  activeSeason: string;
  categories: BudgetCategory[];
  harvestHistory: HarvestRecord[];
  transactions: Transaction[];
  rolledOver: boolean;
  unallocatedRefund: number;
}
export function catchUpSeason(
  activeSeason: string,
  categories: BudgetCategory[],
  harvestHistory: HarvestRecord[],
  transactions: Transaction[] = [],
  now: Date = new Date(),
): SeasonRolloverResult {
  const nowLabel = getCurrentSeasonLabel(now);
  if (activeSeason === nowLabel) {
    return {
      activeSeason,
      categories,
      harvestHistory,
      transactions,
      rolledOver: false,
      unallocatedRefund: 0,
    };
  }
  const newHarvests: HarvestRecord[] = [];
  let currentCategories = categories;
  let currentSeason = activeSeason;
  let ledger = transactions;
  let iterations = 0;
  let unallocatedRefund = 0;
  while (currentSeason !== nowLabel && iterations < 24) {
    newHarvests.push(createHarvestRecord(currentSeason, currentCategories));
    const next = getNextSeasonLabel(currentSeason);
    if (next === currentSeason) break;
    // Bug fix: capture any unspent mid-season envelope fill before it's
    // reset away, so it can be handed back to the unallocated pool instead
    // of vanishing. Only the first iteration can have a nonzero fill —
    // after resetCategoriesForNewSeason runs once, budgetLimit already
    // equals baseBudgetLimit, so later iterations naturally contribute 0.
    unallocatedRefund += getSeasonEndUnallocatedRefund(currentCategories);
    const resetCategories = resetCategoriesForNewSeason(currentCategories);
    const carried = carryForwardRecurringTransactions(
      ledger,
      resetCategories,
      currentSeason,
      next,
    );
    currentCategories = carried.categories;
    ledger = [...carried.transactions, ...ledger];
    currentSeason = next;
    iterations += 1;
  }
  return {
    activeSeason: nowLabel,
    categories: currentCategories,
    harvestHistory: [...newHarvests.reverse(), ...harvestHistory],
    transactions: ledger,
    rolledOver: true,
    unallocatedRefund,
  };
}