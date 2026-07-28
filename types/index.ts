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
}
export interface Debt {
  id: string;
  name: string;
  /** The original amount owed when the debt was first tracked — never changes after creation, same treatment as a Goal's targetAmount. */
  startingAmount: number;
  /** What's left to pay off. Decreases toward 0 as payments are logged. */
  currentAmount: number;
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