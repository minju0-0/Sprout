import { describe, expect, it } from "vitest";
import {
  getGoalProgress,
  isGoalComplete,
  getTrunkHeight,
  getCanopyRadius,
  getBranchCount,
} from "@/lib/goalLogic";
import type { Goal } from "@/types";
function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "goal-1",
    name: "Vacation Fund",
    targetAmount: 1000,
    currentAmount: 0,
    ...overrides,
  };
}
describe("getGoalProgress", () => {
  it("returns the current/target ratio", () => {
    expect(getGoalProgress(makeGoal({ targetAmount: 1000, currentAmount: 250 }))).toBe(0.25);
  });
  it("clamps to 1 once the target is met or exceeded", () => {
    expect(getGoalProgress(makeGoal({ targetAmount: 1000, currentAmount: 1000 }))).toBe(1);
    expect(getGoalProgress(makeGoal({ targetAmount: 1000, currentAmount: 5000 }))).toBe(1);
  });
  it("returns 0 for a zero-or-negative target instead of dividing by zero", () => {
    expect(getGoalProgress(makeGoal({ targetAmount: 0, currentAmount: 100 }))).toBe(0);
  });
});
describe("isGoalComplete", () => {
  it("is true once current reaches or passes target", () => {
    expect(isGoalComplete(makeGoal({ targetAmount: 1000, currentAmount: 1000 }))).toBe(true);
    expect(isGoalComplete(makeGoal({ targetAmount: 1000, currentAmount: 1500 }))).toBe(true);
  });
  it("is false while under target", () => {
    expect(isGoalComplete(makeGoal({ targetAmount: 1000, currentAmount: 999 }))).toBe(false);
  });
});
describe("getTrunkHeight / getCanopyRadius", () => {
  it("grow (unlike a budget plant) as progress increases", () => {
    expect(getTrunkHeight(1)).toBeGreaterThan(getTrunkHeight(0));
    expect(getCanopyRadius(1)).toBeGreaterThan(getCanopyRadius(0));
  });
});
describe("getBranchCount", () => {
  it("is 0 for a bare sapling with no progress", () => {
    expect(getBranchCount(0)).toBe(0);
  });
  it("gains a branch pair roughly every third of progress, capped at 3", () => {
    expect(getBranchCount(0.1)).toBe(1);
    expect(getBranchCount(0.4)).toBe(2);
    expect(getBranchCount(0.7)).toBe(3);
    expect(getBranchCount(1)).toBe(3);
  });
});
