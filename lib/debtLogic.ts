import type { Debt } from "@/types";
/** Progress toward being fully paid off: 0 (untouched) to 1 (paid off). */
export function getDebtProgress(debt: Debt): number {
  if (debt.startingAmount <= 0) return 0;
  const paidOff = debt.startingAmount - debt.currentAmount;
  return Math.min(Math.max(paidOff / debt.startingAmount, 0), 1);
}
export function isDebtPaidOff(debt: Debt): boolean {
  return debt.currentAmount <= 0;
}
const MAX_BOULDER_SCALE = 1;
const MIN_BOULDER_SCALE = 0.32;
/** The boulder shrinks as progress grows — the inverse of GoalTree's growth
 * model (a debt shrinking toward zero isn't visually the same shape as a
 * tree growing, per the roadmap's own framing). */
export function getBoulderScale(progress: number): number {
  return MAX_BOULDER_SCALE - progress * (MAX_BOULDER_SCALE - MIN_BOULDER_SCALE);
}