import { describe, expect, it } from "vitest";
import {
  getPercentSpent,
  getGrowthStage,
  getPlantHeight,
  getGardenHealth,
} from "@/lib/gardenLogic";
import type { BudgetCategory } from "@/types";
function makeCategory(overrides: Partial<BudgetCategory> = {}): BudgetCategory {
  return {
    id: "cat-1",
    name: "Groceries",
    budgetLimit: 100,
    spent: 0,
    species: "tomato",
    ...overrides,
  };
}
describe("getPercentSpent", () => {
  it("returns the spent/budget ratio", () => {
    expect(getPercentSpent(makeCategory({ budgetLimit: 100, spent: 50 }))).toBe(0.5);
  });
  it("returns 0 for a zero-or-negative budget instead of dividing by zero", () => {
    expect(getPercentSpent(makeCategory({ budgetLimit: 0, spent: 50 }))).toBe(0);
    expect(getPercentSpent(makeCategory({ budgetLimit: -10, spent: 50 }))).toBe(0);
  });
  it("can exceed 1 when overspent", () => {
    expect(getPercentSpent(makeCategory({ budgetLimit: 100, spent: 150 }))).toBe(1.5);
  });
});
describe("getGrowthStage", () => {
  it("is thriving under 50% spent", () => {
    expect(getGrowthStage(0)).toBe("thriving");
    expect(getGrowthStage(0.49)).toBe("thriving");
  });
  it("is steady between 50% and 85% spent", () => {
    expect(getGrowthStage(0.5)).toBe("steady");
    expect(getGrowthStage(0.84)).toBe("steady");
  });
  it("is wilting between 85% and 100% spent", () => {
    expect(getGrowthStage(0.85)).toBe("wilting");
    expect(getGrowthStage(1)).toBe("wilting");
  });
  it("is overgrown once spending passes the budget", () => {
    expect(getGrowthStage(1.01)).toBe("overgrown");
    expect(getGrowthStage(2)).toBe("overgrown");
  });
});
describe("getPlantHeight", () => {
  it("is tallest at 0% spent and shortest at/above the 130% clamp", () => {
    const tallest = getPlantHeight(0);
    const shortest = getPlantHeight(1.3);
    expect(tallest).toBeGreaterThan(shortest);
    expect(getPlantHeight(5)).toBe(shortest);
  });
  it("decreases monotonically as spend increases", () => {
    expect(getPlantHeight(0.2)).toBeGreaterThan(getPlantHeight(0.6));
    expect(getPlantHeight(0.6)).toBeGreaterThan(getPlantHeight(1));
  });
});
describe("getGardenHealth", () => {
  it("is unplanted with no categories — never a false 'sunny'", () => {
    expect(getGardenHealth([])).toBe("unplanted");
  });
  it("is sunny when every category is thriving or steady", () => {
    const categories = [
      makeCategory({ id: "a", budgetLimit: 100, spent: 10 }),
      makeCategory({ id: "b", budgetLimit: 100, spent: 60 }),
    ];
    expect(getGardenHealth(categories)).toBe("sunny");
  });
  it("is cloudy when any category is wilting, even if none are overgrown", () => {
    const categories = [
      makeCategory({ id: "a", budgetLimit: 100, spent: 10 }),
      makeCategory({ id: "b", budgetLimit: 100, spent: 90 }),
    ];
    expect(getGardenHealth(categories)).toBe("cloudy");
  });
  it("is storm when any category is overgrown, regardless of the others", () => {
    const categories = [
      makeCategory({ id: "a", budgetLimit: 100, spent: 10 }),
      makeCategory({ id: "b", budgetLimit: 100, spent: 150 }),
    ];
    expect(getGardenHealth(categories)).toBe("storm");
  });
});
