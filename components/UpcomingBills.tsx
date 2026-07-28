"use client";
import { CalendarClock, Repeat } from "lucide-react";
import type { BudgetCategory, Transaction } from "@/types";
import { getUpcomingBills } from "@/lib/upcomingBills";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/transactions";
import { CategoryChip } from "@/components/CategoryChip";
interface UpcomingBillsProps {
  transactions: Transaction[];
  categories: BudgetCategory[];
  currencyCode: string | null;
}
export function UpcomingBills({ transactions, categories, currencyCode }: UpcomingBillsProps) {
  const { upcoming, posted } = getUpcomingBills(transactions);
  function categoryOf(id: string) {
    return categories.find((category) => category.id === id);
  }
  function BillRow({ transaction }: { transaction: Transaction }) {
    const category = categoryOf(transaction.categoryId);
    return (
      <li className="flex items-center justify-between gap-3 border-b border-moss/10 py-2.5 text-sm last:border-b-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-data text-xs text-ink-soft">{formatDate(transaction.date)}</span>
          {category ? (
            <CategoryChip name={category.name} species={category.species} />
          ) : (
            <span className="text-ink-soft">Unknown</span>
          )}
          <span className="truncate text-ink-soft">{transaction.description}</span>
        </div>
        <span className="shrink-0 font-data text-sm text-ink">
          {formatCurrency(transaction.amount, currencyCode)}
        </span>
      </li>
    );
  }
  return (
    <section
      className="rounded-3xl border border-moss/15 bg-card px-5 py-5 shadow-sm"
      aria-label="Upcoming recurring bills"
    >
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-moss" aria-hidden="true" />
        <h2 className="font-display text-lg text-ink">Upcoming this season</h2>
      </div>
      {upcoming.length > 0 ? (
        <ul className="flex flex-col">
          {upcoming.map((transaction) => (
            <BillRow key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      ) : posted.length > 0 ? (
        <p className="text-sm text-ink-soft">Nothing recurring due for the rest of this season.</p>
      ) : (
        <p className="text-sm text-ink-soft">
          No recurring bills yet. Mark a transaction &quot;Repeat monthly&quot; when you add or
          edit it, and it&apos;ll show up here.
        </p>
      )}
      {posted.length > 0 && (
        <details className="mt-3">
          <summary className="flex w-fit cursor-pointer items-center gap-1.5 rounded text-xs font-semibold text-ink-soft transition-colors hover:text-ink active:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss">
            <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
            {posted.length} already posted this season
          </summary>
          <ul className="mt-2 flex flex-col">
            {posted.map((transaction) => (
              <BillRow key={transaction.id} transaction={transaction} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
