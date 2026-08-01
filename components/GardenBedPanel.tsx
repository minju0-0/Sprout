"use client";
import Link from "next/link";
import type { BudgetCategory } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { GardenPlantIcon } from "@/components/GardenPlantIcon";
import { GardenBedBackground } from "@/components/GardenBedBackground";
interface GardenBedPanelProps {
  categories: BudgetCategory[];
  currencyCode: string | null;
  activeSeason: string;
  onAddCategory: () => void;
  onEditCategory: (category: BudgetCategory) => void;
}
// Brick/masonry pattern: rows alternate 3, 2, 3, 2... so each shorter row's
// plants sit centered in the gaps of the row above it, instead of one long
// horizontal strip that either scrolls sideways or grows unpredictably wide.
const ROW_SIZES = [3, 2] as const;
function chunkIntoBrickRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  let index = 0;
  let sizeIndex = 0;
  while (index < items.length) {
    const size = ROW_SIZES[sizeIndex % ROW_SIZES.length];
    rows.push(items.slice(index, index + size));
    index += size;
    sizeIndex += 1;
  }
  return rows;
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
  const rows = chunkIntoBrickRows(categories);
  return (
    <section className="rounded-2xl border border-moss/10 bg-card p-6 shadow-sm">
      {}
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
        <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-xl bg-bed px-6 py-12 text-center">
          <GardenBedBackground />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <p className="text-sm text-ink-soft">The bed is empty.</p>
            <button
              type="button"
              onClick={onAddCategory}
              className="rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light"
            >
              Add your first category
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-[#e3e7d3]">
          {}
          <GardenBedBackground />
          {}
          <div className="absolute left-4 top-3 z-10 flex items-center gap-2 rounded-lg bg-black/10 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur-xs">
            <span>
              Spent <strong className="text-ink">{formatCurrency(totalSpent, currencyCode)}</strong> of{" "}
              {formatCurrency(totalLimit, currencyCode)}
            </span>
          </div>
          {}
          <div className="relative z-10 flex flex-col items-center px-6 pb-6 pt-16">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={
                  rowIndex === 0
                    ? "flex items-end justify-center gap-4 sm:gap-6"
                    : "-mt-6 flex items-end justify-center gap-4 sm:-mt-9 sm:gap-6"
                }
              >
                {row.map((category) => (
                  <GardenPlantIcon
                    key={category.id}
                    category={category}
                    currencyCode={currencyCode}
                    onClick={() => onEditCategory(category)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}