import Link from "next/link";
import type { BudgetCategory } from "@/types";
import { getPercentSpent } from "@/lib/gardenLogic";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
interface BudgetAtAGlanceProps {
  categories: BudgetCategory[];
  currencyCode: string | null;
}
export function BudgetAtAGlance({ categories, currencyCode }: BudgetAtAGlanceProps) {
  if (categories.length === 0) return null;
  return (
    <section className="rounded-2xl border border-moss/10 bg-card px-6 py-6 shadow-sm" aria-label="Budget at a glance">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Budget at a glance</h2>
        <Link href="/budget" className="text-sm font-semibold text-moss hover:underline">
          All categories
        </Link>
      </div>
      <ul className="flex flex-col gap-4">
        {categories.map((category) => {
          const percent = getPercentSpent(category);
          const over = percent > 1;
          return (
            <li key={category.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink">{category.name}</span>
                <span className={cn("font-data", over ? "text-rust" : "text-ink-soft")}>
                  {formatCurrency(category.spent, currencyCode)} / {formatCurrency(category.budgetLimit, currencyCode)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className={cn("h-full rounded-full", over ? "bg-rust" : "bg-moss")}
                  style={{ width: `${Math.min(percent, 1) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}