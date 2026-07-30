import type { BudgetCategory } from "@/types";
import { getPercentSpent } from "@/lib/gardenLogic";
import { cn } from "@/lib/cn";
interface GardenCategoryPillsProps {
  categories: BudgetCategory[];
}
export function GardenCategoryPills({ categories }: GardenCategoryPillsProps) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const percent = Math.round(getPercentSpent(category) * 100);
        const over = getPercentSpent(category) > 1;
        return (
          <span
            key={category.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              over ? "bg-rust/10 text-rust" : "bg-moss/10 text-moss-700",
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", over ? "bg-rust" : "bg-moss")}
              aria-hidden="true"
            />
            {category.name} {percent}%
          </span>
        );
      })}
    </div>
  );
}