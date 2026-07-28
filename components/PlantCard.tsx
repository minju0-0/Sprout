"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pencil } from "lucide-react";
import type { BudgetCategory } from "@/types";
import { plantTypeMap, weedColor, soilColor } from "@/constants/gardenAssets";
import { getGrowthStage, getPercentSpent, getPlantHeight } from "@/lib/gardenLogic";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
import { PlantIllustration } from "@/components/PlantIllustration";
interface PlantCardProps {
  category: BudgetCategory;
  currencyCode: string | null;
  onEdit: () => void;
}
const GROUND_Y = 148;
export function PlantCard({ category, currencyCode, onEdit }: PlantCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const percentSpent = getPercentSpent(category);
  const stage = getGrowthStage(percentSpent);
  const height = getPlantHeight(percentSpent);
  const palette = plantTypeMap[category.species].stages[stage];
  const topY = GROUND_Y - height;
  const isOverBudget = percentSpent > 1;
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: "easeOut" as const };
  return (
    <div className="flex w-28 flex-col items-center gap-2">
      <svg
        viewBox="0 0 100 160"
        className="h-40 w-24"
        role="img"
        aria-label={`${category.name}: ${plantTypeMap[category.species].label}, ${stage}, ${formatCurrency(
          category.spent,
          currencyCode,
        )} of ${formatCurrency(category.budgetLimit, currencyCode)} spent`}
      >
        {}
        <ellipse cx="50" cy={GROUND_Y} rx="34" ry="8" fill={soilColor} />
        <PlantIllustration
          species={category.species}
          palette={palette}
          topY={topY}
          groundY={GROUND_Y}
          height={height}
          transition={transition}
        />
        {}
        <AnimatePresence>
          {stage === "overgrown" && (
            <motion.g
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
              transition={transition}
              style={{ transformOrigin: "50px 148px" }}
            >
              <path
                d="M18 148 q4 -20 9 0"
                stroke={weedColor}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M80 148 q-4 -16 -9 0"
                stroke={weedColor}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M28 148 q2 -12 6 -1"
                stroke={weedColor}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
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
