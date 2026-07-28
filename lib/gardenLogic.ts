import type { BudgetCategory, GardenHealthStatus, PlantGrowthStage } from "@/types";
export function getPercentSpent(category: BudgetCategory): number {
  if (category.budgetLimit <= 0) return 0;
  return category.spent / category.budgetLimit;
}
export function getGrowthStage(percentSpent: number): PlantGrowthStage {
  if (percentSpent > 1) return "overgrown";
  if (percentSpent >= 0.85) return "wilting";
  if (percentSpent >= 0.5) return "steady";
  return "thriving";
}
const MIN_PLANT_HEIGHT = 46;
const MAX_PLANT_HEIGHT = 132;
export function getPlantHeight(percentSpent: number): number {
  const clamped = Math.min(Math.max(percentSpent, 0), 1.3);
  return MAX_PLANT_HEIGHT - clamped * (MAX_PLANT_HEIGHT - MIN_PLANT_HEIGHT);
}
/**
 * How much of a category's funded budget is still available to move elsewhere
 * (fund a different envelope, or send back to unallocated). Only the unspent
 * portion of an envelope can be moved — money already spent isn't "there" to
 * transfer, matching Goodbudget's "available balance" model for transfers.
 */
export function getAvailableToMove(category: BudgetCategory): number {
  return Math.max(category.budgetLimit - category.spent, 0);
}
export function getGardenHealth(categories: BudgetCategory[]): GardenHealthStatus {
  if (categories.length === 0) return "unplanted";
  const stages = categories.map((category) => getGrowthStage(getPercentSpent(category)));
  if (stages.includes("overgrown")) return "storm";
  if (stages.includes("wilting")) return "cloudy";
  return "sunny";
}
