"use client";
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Debt } from "@/types";
export type DebtModalState = { mode: "add" } | { mode: "edit"; debt: Debt };
interface DebtModalProps {
  state: DebtModalState;
  onClose: () => void;
  onSubmit: (values: Omit<Debt, "id" | "currentAmount">) => void;
}
export function DebtModal({ state, onClose, onSubmit }: DebtModalProps) {
  const editing = state.mode === "edit" ? state.debt : null;
  const [name, setName] = useState(editing?.name ?? "");
  const [startingAmount, setStartingAmount] = useState(
    editing ? String(editing.startingAmount) : "",
  );
  const [error, setError] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(startingAmount);
    if (!name.trim()) {
      setError("Give the debt a name.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount owed must be a number greater than 0.");
      return;
    }
    onSubmit({ name: name.trim(), startingAmount: parsedAmount });
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="debt-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="debt-modal-title" className="font-display text-lg text-ink">
            {editing ? "Edit debt" : "Track a new debt"}
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
            <label htmlFor="debt-name" className="text-xs text-ink-soft">
              Name
            </label>
            <input
              id="debt-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Credit Card"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="debt-amount" className="text-xs text-ink-soft">
              Total owed
            </label>
            <input
              id="debt-amount"
              type="number"
              min="0"
              step="0.01"
              value={startingAmount}
              onChange={(event) => setStartingAmount(event.target.value)}
              placeholder="2500"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
            />
            {editing && (
              <p className="text-xs text-ink-soft">
                Changes the starting balance only — payments already logged aren&apos;t affected.
              </p>
            )}
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
              {editing ? "Save" : "Track it"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}