export interface ContributionEntry {
  id: string;
  amount: number;
  date: string;
}
export type PlantGrowthStage = "thriving" | "steady" | "wilting" | "overgrown";
export type PlantSpecies =
  | "tomato"
  | "sunflower"
  | "succulent"
  | "fern"
  | "berry-bush";
export interface BudgetCategory {
  id: string;
  name: string;
  budgetLimit: number;
  /**
   * The category's official monthly budget target, as last set via the
   * category form. `budgetLimit` is the *effective* envelope amount and can
   * be temporarily inflated during a season by "Move money"/"Add income"
   * fills; `baseBudgetLimit` is what `budgetLimit` resets back to at the
   * next season rollover, so one-time envelope fills don't silently become
   * permanent budget increases. Optional for backward compatibility with
   * categories persisted before this field existed — falls back to
   * `budgetLimit` wherever it's read.
   */
  baseBudgetLimit?: number;
  spent: number;
  species: PlantSpecies;
}
export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  isRecurring?: boolean;
}
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  history?: ContributionEntry[];
}
export interface Debt {
  id: string;
  name: string;
  startingAmount: number;
  currentAmount: number;
  history?: ContributionEntry[];
}
export type GardenHealthStatus = "unplanted" | "sunny" | "cloudy" | "storm";
export interface HarvestRecord {
  season: string;
  categories: BudgetCategory[];
  gardenHealth: GardenHealthStatus;
}
export interface AdvisorNote {
  id: string;
  categoryId?: string;
  message: string;
}
export interface AdvisorAnswer {
  categoryId?: string;
  message: string;
}
export type SyncStatus = "idle" | "saving" | "saved" | "error";
export type MoneyPocket = string | "unallocated";
export type AllocationEventType = "income" | "fill" | "transfer";
export interface AllocationEvent {
  id: string;
  type: AllocationEventType;
  amount: number;
  from: MoneyPocket | null;
  to: MoneyPocket | null;
  note?: string;
  date: string;
}
export interface GardenState {
  categories: BudgetCategory[];
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  activeSeason: string;
  harvestHistory: HarvestRecord[];
  currencyCode: string | null;
  unallocated: number;
  allocationHistory: AllocationEvent[];
}