"use client";
import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Plus,
  Repeat,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import type { Transaction } from "@/types";
import { useBudgetStore } from "@/store/budgetStore";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/transactions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TransactionModal, type TransactionModalState } from "@/components/TransactionModal";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { CategoryChip } from "@/components/CategoryChip";
import { CsvImportModal } from "@/components/CsvImportModal";
import { ActionToast } from "@/components/ActionToast";
import { StatCard } from "@/components/StatCard";
import { TableSkeleton, StatCardSkeletonRow } from "@/components/Skeleton";
type SortField = "date" | "category" | "description" | "amount";
type SortDir = "asc" | "desc";
const ALL_CATEGORIES = "all" as const;
function SortHeader({
  field, label, activeField, dir, onToggle, align = "left",
}: {
  field: SortField; label: string; activeField: SortField; dir: SortDir;
  onToggle: (field: SortField) => void; align?: "left" | "right";
}) {
  const isActive = activeField === field;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1 text-xs font-semibold tracking-wide uppercase ${align === "right" ? "ml-auto" : ""} ${isActive ? "text-ink" : "text-ink-soft"}`}
    >
      {label}
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
    </button>
  );
}
export default function TransactionsPage() {
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const categories = useBudgetStore((state) => state.categories);
  const transactions = useBudgetStore((state) => state.transactions);
  const currencyCode = useBudgetStore((state) => state.currencyCode);
  const activeSeason = useBudgetStore((state) => state.activeSeason);
  const addTransaction = useBudgetStore((state) => state.addTransaction);
  const importTransactions = useBudgetStore((state) => state.importTransactions);
  const updateTransaction = useBudgetStore((state) => state.updateTransaction);
  const deleteTransaction = useBudgetStore((state) => state.deleteTransaction);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionModal, setTransactionModal] = useState<TransactionModalState | null>(null);
  const [confirmDeleteTransaction, setConfirmDeleteTransaction] = useState<Transaction | null>(null);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
  function flashActionToast(message: string) {
    setActionToast(message);
    window.setTimeout(() => setActionToast(null), 1600);
  }
  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? "Unknown";
  }
  function categoryOf(id: string) {
    return categories.find((c) => c.id === id);
  }
  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== ALL_CATEGORIES || dateFrom !== "" || dateTo !== "";
  const filteredAndSorted = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = transactions.filter((transaction) => {
      if (categoryFilter !== ALL_CATEGORIES && transaction.categoryId !== categoryFilter) return false;
      if (term && !transaction.description.toLowerCase().includes(term)) return false;
      if (dateFrom && transaction.date < dateFrom) return false;
      if (dateTo && transaction.date > dateTo) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case "date": return a.date.localeCompare(b.date) * dir;
        case "category": return categoryName(a.categoryId).localeCompare(categoryName(b.categoryId)) * dir;
        case "description": return a.description.localeCompare(b.description) * dir;
        case "amount": return (a.amount - b.amount) * dir;
        default: return 0;
      }
    });
  }, [transactions, search, categoryFilter, dateFrom, dateTo, sortField, sortDir]);
  const totalSpent = filteredAndSorted.reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction =
    filteredAndSorted.length > 0 ? totalSpent / filteredAndSorted.length : 0;
  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  }
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl text-ink">Transactions</h1>
          <p className="text-sm text-ink-soft">
            {filteredAndSorted.length} transaction{filteredAndSorted.length === 1 ? "" : "s"} in view
            {hasActiveFilters && ` of ${transactions.length} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCsvImport(true)}
              className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import CSV
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            disabled={categories.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add transaction
          </button>
        </div>
      </header>
      {!hasHydrated ? (
        <>
          <StatCardSkeletonRow count={3} />
          <TableSkeleton rows={7} />
        </>
      ) : (
        <>
          {categories.length === 0 && (
            <p className="rounded-2xl border border-moss/10 bg-card px-5 py-4 text-sm text-ink-soft shadow-sm">
              Add a budget category before logging a transaction.
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Transactions"
              value={String(filteredAndSorted.length)}
              subtitle={hasActiveFilters ? "matching filters" : undefined}
              tone="default"
            />
            <StatCard
              label="Total spent"
              value={formatCurrency(totalSpent, currencyCode)}
              subtitle={hasActiveFilters ? "matching filters" : undefined}
              tone="danger"
            />
            <StatCard
              label="Average"
              value={formatCurrency(averageTransaction, currencyCode)}
              subtitle={hasActiveFilters ? "matching filters" : undefined}
              tone="default"
            />
          </div>
          <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-moss/10 bg-card px-4 py-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions..."
                className="w-full rounded-lg border border-moss/15 bg-canvas py-1.5 pl-9 pr-3 text-sm text-ink"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-lg border border-moss/15 bg-canvas px-2 py-1.5 text-sm text-ink"
            >
              <option value={ALL_CATEGORIES}>All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="rounded-lg border border-moss/15 bg-canvas px-2 py-1.5 font-data text-sm text-ink"
              aria-label="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="rounded-lg border border-moss/15 bg-canvas px-2 py-1.5 font-data text-sm text-ink"
              aria-label="To date"
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => { setSearch(""); setCategoryFilter(ALL_CATEGORIES); setDateFrom(""); setDateTo(""); }}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10"
              >
                Clear
              </button>
            )}
          </section>
          <section className="rounded-2xl border border-moss/10 bg-card shadow-sm">
            <div className="overflow-x-auto">
              {}
              <table className="w-full min-w-[680px] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[100px]" />
                  <col className="w-auto" />
                  <col className="w-[160px]" />
                  <col className="w-[130px]" />
                  <col className="w-[84px]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-card">
                  <tr>
                    <th className="border-b border-moss/10 px-5 py-3"><SortHeader field="date" label="Date" activeField={sortField} dir={sortDir} onToggle={toggleSort} /></th>
                    <th className="border-b border-moss/10 px-3 py-3"><SortHeader field="description" label="Description" activeField={sortField} dir={sortDir} onToggle={toggleSort} /></th>
                    <th className="border-b border-moss/10 px-3 py-3"><SortHeader field="category" label="Category" activeField={sortField} dir={sortDir} onToggle={toggleSort} /></th>
                    <th className="border-b border-moss/10 px-3 py-3 text-right"><SortHeader field="amount" label="Amount" activeField={sortField} dir={sortDir} onToggle={toggleSort} align="right" /></th>
                    <th className="border-b border-moss/10 px-5 py-3 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map((transaction) => {
                    const category = categoryOf(transaction.categoryId);
                    const isCredit = transaction.amount < 0;
                    return (
                      <tr key={transaction.id} className="group border-b border-moss/10 last:border-b-0 hover:bg-moss/5">
                        <td className="truncate px-5 py-3 font-data text-ink-soft">{formatDate(transaction.date)}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-ink">
                            <span className="truncate">{transaction.description}</span>
                            {transaction.isRecurring && (
                              <Repeat className="h-3 w-3 shrink-0 text-moss" role="img" aria-label="Repeats monthly" />
                            )}
                          </span>
                        </td>
                        <td className="truncate px-3 py-3">
                          {category ? <CategoryChip name={category.name} species={category.species} /> : <span className="text-ink-soft">Unknown</span>}
                        </td>
                        <td className={`truncate px-3 py-3 text-right font-data ${isCredit ? "text-moss" : "text-ink"}`}>
                          {isCredit ? "+" : "-"}
                          {formatCurrency(Math.abs(transaction.amount), currencyCode)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => setTransactionModal({ transaction })}
                              aria-label={`Edit transaction: ${transaction.description}`}
                              className="rounded-full p-1 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTransaction(transaction)}
                              aria-label={`Delete transaction: ${transaction.description}`}
                              className="rounded-full p-1 text-ink-soft transition-colors hover:bg-rust/10 hover:text-rust"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAndSorted.length === 0 && (
                <p className="py-8 text-center text-sm text-ink-soft">
                  {hasActiveFilters ? "No transactions match those filters." : "No transactions yet."}
                </p>
              )}
            </div>
          </section>
        </>
      )}
      {showAddModal && (
        <AddTransactionModal
          categories={categories}
          activeSeason={activeSeason}
          onClose={() => setShowAddModal(false)}
          onSubmit={(values) => {
            addTransaction(values);
            setShowAddModal(false);
            flashActionToast("Transaction added");
          }}
        />
      )}
      {transactionModal && (
        <TransactionModal
          state={transactionModal}
          categories={categories}
          activeSeason={activeSeason}
          onClose={() => setTransactionModal(null)}
          onSubmit={(id, values) => { updateTransaction(id, values); setTransactionModal(null); }}
        />
      )}
      {confirmDeleteTransaction && (
        <ConfirmDialog
          title="Delete transaction?"
          description={`This removes the ${formatCurrency(confirmDeleteTransaction.amount, currencyCode)} ${categoryName(confirmDeleteTransaction.categoryId)} transaction from ${formatDate(confirmDeleteTransaction.date)}. This can't be undone.`}
          onConfirm={() => { deleteTransaction(confirmDeleteTransaction.id); setConfirmDeleteTransaction(null); }}
          onClose={() => setConfirmDeleteTransaction(null)}
        />
      )}
      {showCsvImport && (
        <CsvImportModal
          categories={categories}
          currencyCode={currencyCode}
          activeSeason={activeSeason}
          onClose={() => setShowCsvImport(false)}
          onImport={(newTransactions) => {
            importTransactions(newTransactions);
            setShowCsvImport(false);
            flashActionToast(`Imported ${newTransactions.length} transaction${newTransactions.length === 1 ? "" : "s"}`);
          }}
        />
      )}
      <ActionToast message={actionToast} />
    </main>
  );
}