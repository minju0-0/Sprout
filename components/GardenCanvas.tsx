import { Plus } from "lucide-react";
import type { BudgetCategory } from "@/types";
import { PlantCard } from "@/components/PlantCard";
interface GardenCanvasProps {
  categories: BudgetCategory[];
  currencyCode: string | null;
  onAddCategory: () => void;
  onEditCategory: (category: BudgetCategory) => void;
}
export function GardenCanvas({ categories, currencyCode, onAddCategory, onEditCategory }: GardenCanvasProps) {
  if (categories.length === 0) {
    return (
      <section className="rounded-3xl border border-moss/15 bg-bed px-6 py-12 text-center">
        <p className="font-display text-lg text-ink">The bed is empty.</p>
        <p className="mt-1 text-sm text-ink-soft">
          Add a budget category to plant your first seedling.
        </p>
        <button
          type="button"
          onClick={onAddCategory}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add your first category
        </button>
      </section>
    );
  }
  return (
    <section
      className="rounded-3xl border border-moss/15 bg-bed px-6 py-10 shadow-sm"
      aria-label="Garden canvas"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Garden</h2>
        <button
          type="button"
          onClick={onAddCategory}
          className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add category
        </button>
      </div>
      <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-8">
        {categories.map((category) => (
          <PlantCard
            key={category.id}
            category={category}
            currencyCode={currencyCode}
            onEdit={() => onEditCategory(category)}
          />
        ))}
      </div>
    </section>
  );
}
