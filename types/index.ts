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
// NEW: transient notice shown once when checkSeasonRollover() actually
// advances the season (whether by one month or several skipped ones) so
// the user finds out their garden was harvested automatically, instead of
// just quietly landing on a reset garden with no explanation.
export interface SeasonRolloverNotice {
  harvestedSeasons: string[];
  newSeason: string;
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