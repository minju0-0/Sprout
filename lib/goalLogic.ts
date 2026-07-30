import type { Goal } from "@/types";
export function getGoalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(Math.max(goal.currentAmount / goal.targetAmount, 0), 1);
}
export function isGoalComplete(goal: Goal): boolean {
  return goal.currentAmount >= goal.targetAmount;
}
const MIN_TRUNK_HEIGHT = 30;
const MAX_TRUNK_HEIGHT = 118;
export function getTrunkHeight(progress: number): number {
  return MIN_TRUNK_HEIGHT + progress * (MAX_TRUNK_HEIGHT - MIN_TRUNK_HEIGHT);
}
const MIN_CANOPY_RADIUS = 10;
const MAX_CANOPY_RADIUS = 26;
export function getCanopyRadius(progress: number): number {
  return MIN_CANOPY_RADIUS + progress * (MAX_CANOPY_RADIUS - MIN_CANOPY_RADIUS);
}
export function getBranchCount(progress: number): number {
  return Math.min(3, Math.floor(progress * 3) + (progress > 0 ? 1 : 0));
}

export function getDaysLeft(targetDate: string | undefined, now: Date = new Date()): number | null {
  if (!targetDate) return null;
  const target = new Date(`${targetDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - now.setHours(0, 0, 0, 0);
  return Math.max(Math.ceil(diffMs / 86_400_000), 0);
}
