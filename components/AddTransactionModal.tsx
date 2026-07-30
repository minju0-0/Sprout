// components/AddTransactionModal.tsx
"use client";
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { BudgetCategory, Transaction } from "@/types";
import { getLocalDateString } from "@/lib/transactions";
export interface AddTransactionModalProps {
  categories: BudgetCategory[];
  onClose: () => void;
  onSubmit: (values: Omit<Transaction, "id">) => void;
}
export function AddTransactionModal({ categories, onClose, onSubmit }: AddTransactionModalProps) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => getLocalDateString());
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    if (!merchant.trim()) {
      setError("Give the transaction a merchant/description.");
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Amount must be a number greater than 0.");
      return;
    }
    onSubmit({
      categoryId,
      description: merchant.trim(),
      amount: parsed,
      date,
      isRecurring: false,
    });
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-transaction-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="add-transaction-title" className="font-display text-lg text-ink">
            Add Transaction
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
            <label htmlFor="txn-merchant" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Merchant
            </label>
            <input
              id="txn-merchant"
              type="text"
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              placeholder="e.g. Whole Foods Market"
              className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="txn-amount" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                Amount
              </label>
              <input
                id="txn-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="$0.00"
                className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="txn-date" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                Date
              </label>
              <input
                id="txn-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-sm text-ink"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="txn-category" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Category
            </label>
            <select
              id="txn-category"
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
              Save transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}