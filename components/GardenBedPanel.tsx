"use client";

import Link from "next/link";
import type { BudgetCategory } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { GardenPlantIcon } from "@/components/GardenPlantIcon";

interface GardenBedPanelProps {
  categories: BudgetCategory[];
  currencyCode: string | null;
  activeSeason: string;
  onAddCategory: () => void;
  onEditCategory: (category: BudgetCategory) => void;
}

export function GardenBedPanel({
  categories,
  currencyCode,
  activeSeason,
  onAddCategory,
  onEditCategory,
}: GardenBedPanelProps) {
  const totalLimit = categories.reduce((sum, c) => sum + c.budgetLimit, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

  return (
    <section className="rounded-2xl border border-moss/10 bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Your Garden</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-soft">{activeSeason}</span>
          <span className="text-xs text-moss/30">•</span>
          <Link href="/budget" className="text-xs font-semibold text-moss hover:underline">
            Manage categories →
          </Link>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-bed px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">The bed is empty.</p>
          <button
            type="button"
            onClick={onAddCategory}
            className="rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light"
          >
            Add your first category
          </button>
        </div>
      ) : (
        /* Garden Plot Container */
        <div className="relative overflow-hidden rounded-2xl bg-[#e3e7d3]">
          {/* Subtle Plot Status Header inside canvas */}
          <div className="absolute left-4 top-3 z-10 flex items-center gap-2 rounded-lg bg-black/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur-xs">
            <span>
              Spent <strong className="text-ink">{formatCurrency(totalSpent, currencyCode)}</strong> of{" "}
              {formatCurrency(totalLimit, currencyCode)}
            </span>
          </div>

          {/* Plant Layout */}
          <div className="flex items-end justify-center gap-4 overflow-x-auto px-6 pb-4 pt-16 sm:gap-6">
            {categories.map((category) => (
              <GardenPlantIcon
                key={category.id}
                category={category}
                currencyCode={currencyCode}
                onClick={() => onEditCategory(category)}
              />
            ))}
          </div>

          {/* Soil Line */}
          <div className="h-6 w-full bg-[#5c4033]" />
        </div>
      )}
    </section>
  );
}