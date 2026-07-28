"use client";
import { useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { BudgetCategory, HarvestRecord } from "@/types";
import { getGrowthStage, getPercentSpent } from "@/lib/gardenLogic";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
interface HarvestComparisonProps {
  harvests: HarvestRecord[];
  currencyCode: string | null;
}
interface ComparisonRow {
  id: string;
  name: string;
  categoryA: BudgetCategory | null;
  categoryB: BudgetCategory | null;
}
function buildComparisonRows(seasonA: HarvestRecord, seasonB: HarvestRecord): ComparisonRow[] {
  const rows = new Map<string, ComparisonRow>();
  for (const category of seasonA.categories) {
    rows.set(category.id, { id: category.id, name: category.name, categoryA: category, categoryB: null });
  }
  for (const category of seasonB.categories) {
    const existing = rows.get(category.id);
    if (existing) {
      existing.categoryB = category;
    } else {
      rows.set(category.id, { id: category.id, name: category.name, categoryA: null, categoryB: category });
    }
  }
  return Array.from(rows.values()).sort((a, b) => a.name.localeCompare(b.name));
}
export function HarvestComparison({ harvests, currencyCode }: HarvestComparisonProps) {
  const [seasonAIndex, setSeasonAIndex] = useState(0);
  const [seasonBIndex, setSeasonBIndex] = useState(Math.min(1, harvests.length - 1));
  const seasonA = harvests[seasonAIndex];
  const seasonB = harvests[seasonBIndex];
  const rows = buildComparisonRows(seasonA, seasonB);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Season A
          <select
            value={seasonAIndex}
            onChange={(event) => setSeasonAIndex(Number(event.target.value))}
            className="rounded-lg border border-moss/20 bg-canvas px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
          >
            {harvests.map((harvest, index) => (
              <option key={harvest.season} value={index}>
                {harvest.season}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          vs. Season B
          <select
            value={seasonBIndex}
            onChange={(event) => setSeasonBIndex(Number(event.target.value))}
            className="rounded-lg border border-moss/20 bg-canvas px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
          >
            {harvests.map((harvest, index) => (
              <option key={harvest.season} value={index}>
                {harvest.season}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-moss/10 bg-canvas">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-moss/10 text-left text-xs text-ink-soft uppercase">
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">{seasonA.season}</th>
              <th className="px-4 py-3 font-semibold">{seasonB.season}</th>
              <th className="px-4 py-3 font-semibold">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const spentA = row.categoryA?.spent ?? null;
              const spentB = row.categoryB?.spent ?? null;
              const delta = spentA !== null && spentB !== null ? spentB - spentA : null;
              return (
                <tr key={row.id} className="border-b border-moss/5 last:border-0">
                  <td className="px-4 py-3 text-ink">{row.name}</td>
                  <td className="px-4 py-3 font-data text-xs text-ink-soft">
                    {row.categoryA
                      ? `${formatCurrency(row.categoryA.spent, currencyCode)} / ${formatCurrency(row.categoryA.budgetLimit, currencyCode)} (${getGrowthStage(getPercentSpent(row.categoryA))})`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-data text-xs text-ink-soft">
                    {row.categoryB
                      ? `${formatCurrency(row.categoryB.spent, currencyCode)} / ${formatCurrency(row.categoryB.budgetLimit, currencyCode)} (${getGrowthStage(getPercentSpent(row.categoryB))})`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {delta === null ? (
                      <span className="text-xs text-ink-soft">—</span>
                    ) : (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs font-semibold",
                          delta > 0 ? "text-rust" : delta < 0 ? "text-moss" : "text-ink-soft",
                        )}
                      >
                        {delta > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : delta < 0 ? (
                          <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {formatCurrency(Math.abs(delta), currencyCode)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
