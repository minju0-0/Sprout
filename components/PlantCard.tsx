"use client";
import { Pencil } from "lucide-react";
import type { BudgetCategory } from "@/types";
import { getGrowthStage, getPercentSpent } from "@/lib/gardenLogic";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
import { PlantIllustration } from "@/components/PlantIllustration";

interface PlantCardProps {
  category: BudgetCategory;
  currencyCode: string | null;
  onEdit: () => void;
}

export function PlantCard({ category, currencyCode, onEdit }: PlantCardProps) {
  const percentSpent = getPercentSpent(category);
  const stage = getGrowthStage(percentSpent);
  const isOverBudget = percentSpent > 1;

  return (
    <div className="flex w-28 flex-col items-center gap-2">
      <div className="flex h-40 w-24 items-end justify-center">
        <PlantIllustration species={category.species} stage={stage} size={96} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink">{category.name}</p>
        <p
          className={cn(
            "font-data text-xs",
            isOverBudget ? "text-rust font-semibold" : "text-ink-soft",
          )}
        >
          {formatCurrency(category.spent, currencyCode)} /{" "}
          {formatCurrency(category.budgetLimit, currencyCode)}
        </p>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${category.name}`}
          className="mt-1 inline-flex items-center gap-1 rounded text-[11px] text-ink-soft transition-colors hover:text-moss active:text-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Edit
        </button>
      </div>
    </div>
  );
}