import type { BudgetCategory, HarvestRecord, Transaction } from "@/types";
import { getGardenHealth } from "@/lib/gardenLogic";
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
  return categories.map((category) => ({ ...category, spent: 0 }));
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
export interface RecurringCarryForwardResult {
  transactions: Transaction[];
  categories: BudgetCategory[];
}
export function carryForwardRecurringTransactions(
  outgoingTransactions: Transaction[],
  resetCategories: BudgetCategory[],
  newSeasonLabel: string,
): RecurringCarryForwardResult {
  const recurring = outgoingTransactions.filter((transaction) => transaction.isRecurring);
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
  rolledOver: boolean;
}
export function catchUpSeason(
  activeSeason: string,
  categories: BudgetCategory[],
  harvestHistory: HarvestRecord[],
  now: Date = new Date(),
): SeasonRolloverResult {
  const nowLabel = getCurrentSeasonLabel(now);
  if (activeSeason === nowLabel) {
    return { activeSeason, categories, harvestHistory, rolledOver: false };
  }
  const newHarvests: HarvestRecord[] = [];
  let currentCategories = categories;
  let currentSeason = activeSeason;
  let iterations = 0;
  while (currentSeason !== nowLabel && iterations < 24) {
    newHarvests.push(createHarvestRecord(currentSeason, currentCategories));
    currentCategories = resetCategoriesForNewSeason(currentCategories);
    const next = getNextSeasonLabel(currentSeason);
    if (next === currentSeason) break;
    currentSeason = next;
    iterations += 1;
  }
  return {
    activeSeason: nowLabel,
    categories: currentCategories,
    harvestHistory: [...newHarvests.reverse(), ...harvestHistory],
    rolledOver: true,
  };
}
