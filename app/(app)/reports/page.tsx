"use client";

import { useState } from "react";
import { Sprout as HarvestIcon } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
import { HarvestSummary } from "@/components/HarvestSummary";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { BudgetVsSpentChart } from "@/components/BudgetVsSpentChart";
import { SpendingTrendChart } from "@/components/SpendingTrendChart";
import { CardSkeleton } from "@/components/Skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function ReportsPage() {
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const categories = useBudgetStore((state) => state.categories);
  const activeSeason = useBudgetStore((state) => state.activeSeason);
  const harvestHistory = useBudgetStore((state) => state.harvestHistory);
  const currencyCode = useBudgetStore((state) => state.currencyCode);
  const startNewSeason = useBudgetStore((state) => state.startNewSeason);

  const [showHarvestConfirm, setShowHarvestConfirm] = useState(false);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl text-ink">Reports</h1>
          <p className="text-sm text-ink-soft">
            Every finished season, snapshotted — and compared side by side.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowHarvestConfirm(true)}
          className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10"
        >
          <HarvestIcon className="h-4 w-4" aria-hidden="true" />
          Harvest Season
        </button>
      </header>

      {!hasHydrated ? (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading your reports">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CardSkeleton bodyHeight="h-56" />
            <CardSkeleton bodyHeight="h-56" />
          </div>
          <CardSkeleton bodyHeight="h-56" />
          <CardSkeleton bodyHeight="h-40" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-moss/10 bg-card px-6 py-6 shadow-sm" aria-label="Spending by category">
              <h2 className="mb-4 font-display text-lg text-ink">Spending by category</h2>
              <CategoryBreakdownChart categories={categories} currencyCode={currencyCode} />
            </section>
            <section className="rounded-2xl border border-moss/10 bg-card px-6 py-6 shadow-sm" aria-label="Budget vs. spent">
              <h2 className="mb-4 font-display text-lg text-ink">Budget vs. spent</h2>
              <BudgetVsSpentChart categories={categories} currencyCode={currencyCode} />
            </section>
          </div>
          <section className="rounded-2xl border border-moss/10 bg-card px-6 py-6 shadow-sm" aria-label="Spending trend across seasons">
            <h2 className="mb-4 font-display text-lg text-ink">Trend across seasons</h2>
            <SpendingTrendChart
              harvests={harvestHistory}
              currentSeason={activeSeason}
              currentCategories={categories}
              currencyCode={currencyCode}
            />
          </section>
          <HarvestSummary harvests={harvestHistory} currencyCode={currencyCode} />
        </>
      )}

      {showHarvestConfirm && (
        <ConfirmDialog
          title="Harvest this season?"
          description={`This will snapshot your current spending for ${activeSeason}, reset category progress, and start a new season cycle. This action cannot be undone.`}
          confirmLabel="Harvest season"
          onConfirm={() => {
            startNewSeason();
            setShowHarvestConfirm(false);
          }}
          onClose={() => setShowHarvestConfirm(false)}
        />
      )}
    </main>
  );
}