"use client";
import { useState, type FormEvent } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { BudgetCategory, Transaction } from "@/types";
import { isDateInSeason } from "@/lib/seasonLogic";
export type TransactionModalState = { transaction: Transaction };
interface TransactionModalProps {
  state: TransactionModalState;
  categories: BudgetCategory[];
  activeSeason: string;
  onClose: () => void;
  onSubmit: (id: string, updates: Omit<Transaction, "id">) => void;
}
export function TransactionModal({
  state,
  categories,
  activeSeason,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const { transaction } = state;
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(Math.abs(transaction.amount)));
  const [isCredit, setIsCredit] = useState(transaction.amount < 0);
  const [date, setDate] = useState(transaction.date);
  const [isRecurring, setIsRecurring] = useState(Boolean(transaction.isRecurring));
  const [error, setError] = useState<string | null>(null);
  const dateOutsideSeason = Boolean(date) && !isDateInSeason(date, activeSeason);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    if (!description.trim()) {
      setError("Give the transaction a description.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a number greater than 0.");
      return;
    }
    if (!date) {
      setError("Choose a date.");
      return;
    }
    onSubmit(transaction.id, {
      categoryId,
      description: description.trim(),
      amount: isCredit ? -parsedAmount : parsedAmount,
      date,
      isRecurring,
    });
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="transaction-modal-title" className="font-display text-lg text-ink">
            Edit transaction
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
            <label htmlFor="transaction-category" className="text-xs text-ink-soft">
              Category
            </label>
            <select
              id="transaction-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="transaction-description" className="text-xs text-ink-soft">
              Description
            </label>
            <input
              id="transaction-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Coffee with a friend"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="transaction-amount" className="text-xs text-ink-soft">
                Amount
              </label>
              <input
                id="transaction-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="transaction-date" className="text-xs text-ink-soft">
                Date
              </label>
              <input
                id="transaction-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
              />
            </div>
          </div>
          {dateOutsideSeason && (
            <p className="flex items-start gap-1.5 rounded-lg bg-marigold/10 px-3 py-2 text-xs text-marigold-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              This date falls outside {activeSeason} — it&apos;ll stay logged, but won&apos;t count
              toward this season&apos;s budget until that month is harvested.
            </p>
          )}
          <label
            htmlFor="transaction-credit"
            className="flex items-center gap-1.5 text-xs text-ink-soft"
          >
            <input
              id="transaction-credit"
              type="checkbox"
              checked={isCredit}
              onChange={(event) => setIsCredit(event.target.checked)}
              className="h-3.5 w-3.5 accent-moss"
            />
            This is a refund / credit — adds money back to the category
          </label>
          <label
            htmlFor="transaction-recurring"
            className="flex items-center gap-1.5 text-xs text-ink-soft"
          >
            <input
              id="transaction-recurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(event) => setIsRecurring(event.target.checked)}
              className="h-3.5 w-3.5 accent-moss"
            />
            Repeat monthly — re-added automatically next season
          </label>
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}