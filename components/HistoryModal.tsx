// components/HistoryModal.tsx
"use client";
import { X, History as HistoryIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/transactions";

export interface HistoryEntry {
  id: string;
  amount: number;
  date: string;
}

interface HistoryModalProps {
  title: string;
  subtitle?: string;
  entries: HistoryEntry[];
  currencyCode: string | null;
  accentClassName?: string;
  emptyLabel?: string;
  totalLabel?: string;
  onClose: () => void;
}

export function HistoryModal({
  title,
  subtitle,
  entries,
  currencyCode,
  accentClassName = "text-moss",
  emptyLabel = "No entries yet.",
  totalLabel = "Total logged",
  onClose,
}: HistoryModalProps) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="history-modal-title" className="font-display text-lg text-ink">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-ink-soft">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-3 flex items-center justify-between rounded-xl bg-canvas px-3 py-2 text-sm">
          <span className="text-ink-soft">{totalLabel}</span>
          <span className={`font-data font-semibold ${accentClassName}`}>
            {formatCurrency(total, currencyCode)}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">{emptyLabel}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {sorted.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-moss/5"
                >
                  <span className="flex items-center gap-2 text-ink-soft">
                    <HistoryIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatDate(entry.date)}
                  </span>
                  <span className={`font-data font-semibold ${accentClassName}`}>
                    {formatCurrency(entry.amount, currencyCode)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}