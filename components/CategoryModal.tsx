"use client";
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { BudgetCategory, PlantSpecies } from "@/types";
import { plantTypeMap } from "@/constants/gardenAssets";
export type CategoryModalState =
  | { mode: "add" }
  | { mode: "edit"; category: BudgetCategory };
interface CategoryModalProps {
  state: CategoryModalState;
  onClose: () => void;
  onSubmit: (values: Omit<BudgetCategory, "id" | "spent">) => void;
}
const speciesOptions = Object.entries(plantTypeMap) as [PlantSpecies, (typeof plantTypeMap)[PlantSpecies]][];
export function CategoryModal({ state, onClose, onSubmit }: CategoryModalProps) {
  const editing = state.mode === "edit" ? state.category : null;
  const [name, setName] = useState(editing?.name ?? "");
  const [budgetLimit, setBudgetLimit] = useState(
    editing ? String(editing.budgetLimit) : "",
  );
  const [species, setSpecies] = useState<PlantSpecies>(editing?.species ?? "tomato");
  const [error, setError] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedLimit = Number(budgetLimit);
    if (!name.trim()) {
      setError("Give the category a name.");
      return;
    }
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      setError("Budget must be a number greater than 0.");
      return;
    }
    onSubmit({ name: name.trim(), budgetLimit: parsedLimit, species });
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="category-modal-title" className="font-display text-lg text-ink">
            {editing ? "Edit category" : "Plant a new category"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="category-name" className="text-xs text-ink-soft">
              Name
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Groceries"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="category-budget" className="text-xs text-ink-soft">
              Monthly budget
            </label>
            <input
              id="category-budget"
              type="number"
              min="0"
              step="0.01"
              value={budgetLimit}
              onChange={(event) => setBudgetLimit(event.target.value)}
              placeholder="500"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span id="category-species-label" className="text-xs text-ink-soft">
              Plant
            </span>
            <div
              role="group"
              aria-labelledby="category-species-label"
              className="grid grid-cols-5 gap-2"
            >
              {speciesOptions.map(([value, visual]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSpecies(value)}
                  aria-pressed={species === value}
                  title={visual.label}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center text-[10px] leading-tight text-ink-soft transition-colors ${
                    species === value
                      ? "border-moss bg-moss/10 text-ink"
                      : "border-moss/20 bg-canvas hover:border-moss/40 active:bg-moss/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full border border-ink/10"
                    style={{ backgroundColor: visual.stages.thriving.accent }}
                  />
                  {visual.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-rust">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              {editing ? "Save" : "Plant it"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
