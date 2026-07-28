"use client";
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { BudgetCategory, MoneyPocket } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { getAvailableToMove } from "@/lib/gardenLogic";
export type EnvelopeModalState =
  | { mode: "income" }
  | { mode: "move"; from?: MoneyPocket; to?: MoneyPocket };
interface EnvelopeFillModalProps {
  state: EnvelopeModalState;
  categories: BudgetCategory[];
  unallocated: number;
  currencyCode: string | null;
  onClose: () => void;
  onAddIncome: (amount: number, note?: string) => void;
  onMoveMoney: (from: MoneyPocket, to: MoneyPocket, amount: number) => void;
}
function pocketLabel(pocket: MoneyPocket, categories: BudgetCategory[]): string {
  if (pocket === "unallocated") return "Unallocated";
  return categories.find((category) => category.id === pocket)?.name ?? "Unknown";
}
export function EnvelopeFillModal({
  state,
  categories,
  unallocated,
  currencyCode,
  onClose,
  onAddIncome,
  onMoveMoney,
}: EnvelopeFillModalProps) {
  const isIncome = state.mode === "income";
  const fromOptions: MoneyPocket[] = ["unallocated", ...categories.map((category) => category.id)];
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [from, setFrom] = useState<MoneyPocket>(
    state.mode === "move" ? (state.from ?? "unallocated") : "unallocated",
  );
  const [to, setTo] = useState<MoneyPocket>(
    state.mode === "move"
      ? (state.to ?? fromOptions.find((pocket) => pocket !== "unallocated") ?? "unallocated")
      : "unallocated",
  );
  const [error, setError] = useState<string | null>(null);
  const toOptions = fromOptions.filter((pocket) => pocket !== from);
  const availableFromSource =
    from === "unallocated"
      ? unallocated
      : getAvailableToMove(categories.find((category) => category.id === from) as BudgetCategory);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Amount must be a number greater than 0.");
      return;
    }
    if (isIncome) {
      onAddIncome(parsed, note.trim() || undefined);
      onClose();
      return;
    }
    if (from === to) {
      setError("Pick two different places.");
      return;
    }
    if (parsed > availableFromSource) {
      setError(`Only ${formatCurrency(availableFromSource, currencyCode)} is available there.`);
      return;
    }
    onMoveMoney(from, to, parsed);
    onClose();
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="envelope-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="envelope-modal-title" className="font-display text-lg text-ink">
            {isIncome ? "Add income" : "Move money"}
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
          {isIncome ? (
            <p className="-mt-2 text-xs text-ink-soft">
              Adds to your unallocated pool — assign it to envelopes with &quot;Move money&quot;
              whenever you&apos;re ready.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label htmlFor="envelope-from" className="text-xs text-ink-soft">
                  From
                </label>
                <select
                  id="envelope-from"
                  value={from}
                  onChange={(event) => {
                    const next = event.target.value as MoneyPocket;
                    setFrom(next);
                    if (next === to) {
                      setTo(fromOptions.find((pocket) => pocket !== next) ?? "unallocated");
                    }
                  }}
                  className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
                >
                  {fromOptions.map((pocket) => (
                    <option key={pocket} value={pocket}>
                      {pocketLabel(pocket, categories)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ink-soft">
                  {formatCurrency(availableFromSource, currencyCode)} available
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="envelope-to" className="text-xs text-ink-soft">
                  To
                </label>
                <select
                  id="envelope-to"
                  value={to}
                  onChange={(event) => setTo(event.target.value as MoneyPocket)}
                  className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
                >
                  {toOptions.map((pocket) => (
                    <option key={pocket} value={pocket}>
                      {pocketLabel(pocket, categories)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="envelope-amount" className="text-xs text-ink-soft">
              Amount
            </label>
            <input
              id="envelope-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
              autoFocus
            />
          </div>
          {isIncome && (
            <div className="flex flex-col gap-1">
              <label htmlFor="envelope-note" className="text-xs text-ink-soft">
                Note (optional)
              </label>
              <input
                id="envelope-note"
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Paycheck"
                className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
          )}
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
              {isIncome ? "Add" : "Move"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
