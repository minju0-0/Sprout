import Link from "next/link";
import { ArrowRight, Repeat } from "lucide-react";
import type { BudgetCategory, Transaction } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/transactions";
import { CategoryChip } from "@/components/CategoryChip";
interface RecentTransactionsListProps {
  transactions: Transaction[];
  categories: BudgetCategory[];
  currencyCode: string | null;
  totalCount: number;
}
export function RecentTransactionsList({
  transactions,
  categories,
  currencyCode,
  totalCount,
}: RecentTransactionsListProps) {
  return (
    <section className="rounded-2xl border border-moss/10 bg-card shadow-sm" aria-label="Recent transactions">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="font-display text-lg text-ink">Recent Transactions</h2>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-sm font-semibold text-moss hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <ul className="border-t border-moss/10 px-2 py-2">
        {transactions.map((transaction) => {
          const category = categories.find((c) => c.id === transaction.categoryId);
          const isCredit = transaction.amount < 0;
          return (
            <li
              key={transaction.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-moss/5"
            >
              {}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="inline-flex items-center gap-1.5 truncate text-ink">
                  {transaction.description}
                  {transaction.isRecurring && (
                    <Repeat className="h-3 w-3 shrink-0 text-moss" role="img" aria-label="Repeats monthly" />
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                  {formatDate(transaction.date)}
                  {category && <CategoryChip name={category.name} species={category.species} />}
                </span>
              </div>
              <span
                className={`shrink-0 font-data text-sm ${isCredit ? "text-moss" : "text-ink"}`}
              >
                {isCredit ? "+" : "-"}
                {formatCurrency(Math.abs(transaction.amount), currencyCode)}
              </span>
            </li>
          );
        })}
        {transactions.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-ink-soft">
            No transactions logged this season yet.
          </p>
        )}
      </ul>
      {totalCount > transactions.length && (
        <p className="border-t border-moss/10 px-5 py-2 text-center text-xs text-ink-soft">
          {totalCount} transaction{totalCount === 1 ? "" : "s"} this season
        </p>
      )}
    </section>
  );
}