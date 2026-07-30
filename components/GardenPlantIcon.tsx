"use client";

import type { BudgetCategory } from "@/types";
import { getGrowthStage, getPercentSpent } from "@/lib/gardenLogic";
import { formatCurrency } from "@/lib/currency";
import { PlantIllustration } from "@/components/PlantIllustration";

interface GardenPlantIconProps {
  category: BudgetCategory;
  currencyCode: string | null;
  onClick: () => void;
}

export function GardenPlantIcon({ category, currencyCode, onClick }: GardenPlantIconProps) {
  const percentSpent = getPercentSpent(category);
  const stage = getGrowthStage(percentSpent);
  const pctDisplay = Math.round(percentSpent * 100);

  return (
    <div className="group relative flex flex-col items-center">
      {/* Hover Tooltip Popup */}
      <div className="pointer-events-none absolute -top-8 z-20 hidden rounded-xl bg-[#2e3328] px-3 py-1.5 text-center text-xs text-white shadow-md group-hover:flex group-hover:flex-col group-hover:items-center">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{category.name}</span>
          <span
            className={`text-[10px] font-bold ${
              pctDisplay > 100 ? "text-rust-200" : "text-moss-light"
            }`}
          >
            {pctDisplay}%
          </span>
        </div>
        <span className="font-data text-[11px] opacity-80">
          {formatCurrency(category.spent, currencyCode)} / {formatCurrency(category.budgetLimit, currencyCode)}
        </span>
        {/* Arrow */}
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2e3328]" />
      </div>

      {/* Plant Icon Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label={`Edit ${category.name}`}
        className="flex h-40 w-28 shrink-0 items-end justify-center rounded-lg transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
      >
        <PlantIllustration species={category.species} stage={stage} size={110} />
      </button>
    </div>
  );
}