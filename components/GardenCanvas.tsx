import { Plus, Sprout } from "lucide-react";
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
      <section className="rounded-3xl border border-moss/15 bg-garden-bed px-6 py-14 text-center shadow-xs">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-moss/10 text-moss">
          <Sprout className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="font-display text-xl text-ink">The plot is ready for planting.</p>
        <p className="mt-1 text-sm text-ink-soft max-w-sm mx-auto">
          Add a budget category to plant your first seedling and watch your spending turn into a living garden.
        </p>
        <button
          type="button"
          onClick={onAddCategory}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-moss px-4 py-2.5 text-sm font-semibold text-canvas shadow-sm transition-all hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Plant your first category
        </button>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden rounded-3xl border-[6px] border-wood/20 bg-garden-bed p-6 shadow-inner"
      aria-label="Garden canvas"
    >
      {/* Wooden planter top lip effect via border, dirt texture inside via bg-garden-bed */}
      <div className="mb-6 flex items-center justify-between border-b border-moss/15 pb-4">
        <div>
          <h2 className="font-display text-xl text-ink">Garden Plot</h2>
          <p className="text-xs text-ink-soft">
            {categories.length} plant{categories.length === 1 ? "" : "s"} growing this season
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCategory}
          className="flex items-center gap-1.5 rounded-xl border border-moss/20 bg-card px-3.5 py-1.5 text-sm font-semibold text-moss shadow-2xs transition-all hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add category
        </button>
      </div>

      {/* Grid of living plants */}
      <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-10 py-4">
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