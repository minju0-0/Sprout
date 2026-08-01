"use client";
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { BudgetCategory, PlantSpecies } from "@/types";
import { plantTypeMap } from "@/constants/gardenAssets";
import { PlantThumbnail } from "@/components/PlantThumbnail";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
export type CategoryModalState =
  | { mode: "add" }
  | { mode: "edit"; category: BudgetCategory };
interface CategoryModalProps {
  state: CategoryModalState;
  unallocated: number;
  currencyCode: string | null;
  onClose: () => void;
  onSubmit: (values: Omit<BudgetCategory, "id" | "spent">, fundFromUnallocated: boolean) => void;
}
const speciesOptions = Object.keys(plantTypeMap) as PlantSpecies[];
export function CategoryModal({ state, unallocated, currencyCode, onClose, onSubmit }: CategoryModalProps) {
  const editing = state.mode === "edit" ? state.category : null;
  const [name, setName] = useState(editing?.name ?? "");
  const previousLimit = editing?.baseBudgetLimit ?? editing?.budgetLimit ?? 0;
  const [budgetLimit, setBudgetLimit] = useState(editing ? String(previousLimit) : "");
  const [species, setSpecies] = useState<PlantSpecies>(editing?.species ?? "tomato");
  const [fundFromUnallocated, setFundFromUnallocated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsedPreview = Number(budgetLimit);
  const delta = editing && Number.isFinite(parsedPreview) ? parsedPreview - previousLimit : 0;
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
    if (!editing && fundFromUnallocated && parsedLimit > unallocated) {
      setError(`Only ${formatCurrency(unallocated, currencyCode)} available in Unallocated.`);
      return;
    }
    if (editing && fundFromUnallocated) {
      const editDelta = parsedLimit - previousLimit;
      if (editDelta > 0 && editDelta > unallocated) {
        setError(`Only ${formatCurrency(unallocated, currencyCode)} available in Unallocated.`);
        return;
      }
    }
    onSubmit({ name: name.trim(), budgetLimit: parsedLimit, species }, fundFromUnallocated);
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
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="category-modal-title" className="font-display text-lg text-ink">
            {editing ? "Edit category" : "Add Budget Category"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="category-name" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Category name
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Groceries"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="category-budget" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Monthly budget
            </label>
            <input
              id="category-budget"
              type="number"
              min="0"
              step="0.01"
              value={budgetLimit}
              onChange={(event) => setBudgetLimit(event.target.value)}
              placeholder="$0.00"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
            />
            {editing && editing.baseBudgetLimit !== undefined && editing.baseBudgetLimit !== editing.budgetLimit && (
              <p className="text-xs text-ink-soft">
                Currently shows your baseline budget, not this season&apos;s envelope-adjusted
                amount — saving resets any mid-season fills/transfers on this category.
              </p>
            )}
          </div>
          {!editing && (
            <label
              htmlFor="category-fund-unallocated"
              className={cn(
                "flex items-start gap-2 rounded-xl border border-moss/15 bg-canvas px-3 py-2.5 text-xs text-ink-soft",
                unallocated <= 0 && "opacity-50",
              )}
            >
              <input
                id="category-fund-unallocated"
                type="checkbox"
                checked={fundFromUnallocated}
                onChange={(event) => setFundFromUnallocated(event.target.checked)}
                disabled={unallocated <= 0}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-moss"
              />
              <span>
                Fund from Unallocated ({formatCurrency(unallocated, currencyCode)} available) —
                deducts this budget from your unallocated pool instead of just setting a target.
                Leave unchecked to plant a category without moving any real money yet.
              </span>
            </label>
          )}
          {editing && delta !== 0 && Number.isFinite(parsedPreview) && parsedPreview > 0 && (
            <label
              htmlFor="category-fund-delta"
              className={cn(
                "flex items-start gap-2 rounded-xl border border-moss/15 bg-canvas px-3 py-2.5 text-xs text-ink-soft",
                delta > 0 && unallocated <= 0 && "opacity-50",
              )}
            >
              <input
                id="category-fund-delta"
                type="checkbox"
                checked={fundFromUnallocated}
                onChange={(event) => setFundFromUnallocated(event.target.checked)}
                disabled={delta > 0 && unallocated <= 0}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-moss"
              />
              <span>
                {delta > 0
                  ? `Fund the extra ${formatCurrency(delta, currencyCode)} from Unallocated (${formatCurrency(unallocated, currencyCode)} available) — otherwise this just raises the target with no money moving.`
                  : `Return the freed-up ${formatCurrency(Math.abs(delta), currencyCode)} to Unallocated — otherwise it simply disappears from the budget.`}
              </span>
            </label>
          )}
          <div className="flex flex-col gap-2">
            <span id="category-species-label" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Choose a plant species
            </span>
            <div
              role="group"
              aria-labelledby="category-species-label"
              className="grid grid-cols-5 gap-2"
            >
              {speciesOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSpecies(value)}
                  aria-pressed={species === value}
                  title={plantTypeMap[value].label}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-2 text-center text-[10px] leading-tight transition-colors ${
                    species === value
                      ? "border-moss bg-moss/5 text-ink"
                      : "border-moss/15 bg-canvas text-ink-soft hover:border-moss/30"
                  }`}
                >
                  <PlantThumbnail species={value} size={44} />
                  {plantTypeMap[value].label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-rust">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-moss/20 px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light"
            >
              {editing ? "Save" : "Save category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}