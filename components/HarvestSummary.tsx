"use client";
import { useState } from "react";
import type { HarvestRecord, PlantGrowthStage } from "@/types";
import { getGrowthStage, getPercentSpent } from "@/lib/gardenLogic";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
import { HarvestComparison } from "@/components/HarvestComparison";
interface HarvestSummaryProps {
  harvests: HarvestRecord[];
  currencyCode: string | null;
}
const stageLabel: Record<PlantGrowthStage, string> = {
  thriving: "Thriving",
  steady: "Steady",
  wilting: "Wilting",
  overgrown: "Overgrown",
};
const stageTone: Record<PlantGrowthStage, string> = {
  thriving: "bg-moss/15 text-moss",
  steady: "bg-sky-soft/60 text-ink",
  wilting: "bg-marigold/20 text-ink",
  overgrown: "bg-rust/15 text-rust",
};
export function HarvestSummary({ harvests, currencyCode }: HarvestSummaryProps) {
  const [compareMode, setCompareMode] = useState(false);
  if (harvests.length === 0) {
    return (
      <section
        className="rounded-3xl border border-moss/15 bg-card px-6 py-12 text-center"
        aria-label="Harvest history"
      >
        <p className="font-display text-lg text-ink">No harvests yet.</p>
        <p className="mt-1 text-sm text-ink-soft">
          Finish your first season with &ldquo;Harvest Season&rdquo; to see it recorded here.
        </p>
      </section>
    );
  }
  return (
    <section
      className="rounded-3xl border border-moss/15 bg-card px-6 py-10 shadow-sm"
      aria-label="Harvest history"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-ink">Harvest Summaries</h2>
        {harvests.length >= 2 && (
          <button
            type="button"
            onClick={() => setCompareMode((current) => !current)}
            className="rounded-lg border border-moss/20 bg-canvas px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            {compareMode ? "View list" : "Compare seasons"}
          </button>
        )}
      </div>
      {compareMode && harvests.length >= 2 ? (
        <HarvestComparison harvests={harvests} currencyCode={currencyCode} />
      ) : (
        <div className="flex flex-col gap-5">
          {harvests.map((harvest) => (
            <div key={harvest.season} className="rounded-2xl border border-moss/10 bg-canvas p-5">
              <p className="mb-3 font-display text-base text-ink">{harvest.season}</p>
              <ul className="flex flex-col gap-2">
                {harvest.categories.map((category) => {
                  const stage = getGrowthStage(getPercentSpent(category));
                  return (
                    <li
                      key={category.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-ink">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-data text-xs text-ink-soft">
                          {formatCurrency(category.spent, currencyCode)} /{" "}
                          {formatCurrency(category.budgetLimit, currencyCode)}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                            stageTone[stage],
                          )}
                        >
                          {stageLabel[stage]}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
