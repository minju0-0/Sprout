"use client";
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Goal } from "@/types";
export type GoalModalState = { mode: "add" } | { mode: "edit"; goal: Goal };
interface GoalModalProps {
  state: GoalModalState;
  onClose: () => void;
  onSubmit: (values: Omit<Goal, "id" | "currentAmount">) => void;
}
export function GoalModal({ state, onClose, onSubmit }: GoalModalProps) {
  const editing = state.mode === "edit" ? state.goal : null;
  const [name, setName] = useState(editing?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(
    editing ? String(editing.targetAmount) : "",
  );
  const [error, setError] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedTarget = Number(targetAmount);
    if (!name.trim()) {
      setError("Give the goal a name.");
      return;
    }
    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      setError("Target must be a number greater than 0.");
      return;
    }
    onSubmit({ name: name.trim(), targetAmount: parsedTarget });
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="goal-modal-title" className="font-display text-lg text-ink">
            {editing ? "Edit goal" : "Plant a new goal"}
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
            <label htmlFor="goal-name" className="text-xs text-ink-soft">
              Name
            </label>
            <input
              id="goal-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Trip to Japan"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="goal-target" className="text-xs text-ink-soft">
              Target amount
            </label>
            <input
              id="goal-target"
              type="number"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={(event) => setTargetAmount(event.target.value)}
              placeholder="2500"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
            />
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
