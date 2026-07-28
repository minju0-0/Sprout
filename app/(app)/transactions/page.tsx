"use client";
import { useMemo, useState, type FormEvent } from "react";
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
import { captureEvent } from "@/lib/analytics";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TransactionModal, type TransactionModalState } from "@/components/TransactionModal";
import { CategoryChip } from "@/components/CategoryChip";
import { CsvImportModal } from "@/components/CsvImportModal";
import { ActionToast } from "@/components/ActionToast";
import { TableSkeleton } from "@/components/Skeleton";
type SortField = "date" | "category" | "description" | "amount";
type SortDir = "asc" | "desc";
const ALL_CATEGORIES = "all" as const;
function SortHeader({
  field,
  label,
  activeField,
  dir,
  onToggle,
  align = "left",
}: {
  field: SortField;
  label: string;
  activeField: SortField;
  dir: SortDir;
  onToggle: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = activeField === field;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1 font-medium ${align === "right" ? "ml-auto" : ""} ${
        isActive ? "text-ink" : "text-ink-soft"
      }`}
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
  const [addCategoryId, setAddCategoryId] = useState(categories[0]?.id ?? "");
  const [addDescription, setAddDescription] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addIsRecurring, setAddIsRecurring] = useState(false);
  const [transactionModal, setTransactionModal] = useState<TransactionModalState | null>(null);
  const [confirmDeleteTransaction, setConfirmDeleteTransaction] = useState<Transaction | null>(
    null,
  );
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
  function flashActionToast(message: string) {
    setActionToast(message);
    window.setTimeout(() => setActionToast(null), 1600);
  }
  const selectedAddCategoryId = categories.some((category) => category.id === addCategoryId)
    ? addCategoryId
    : (categories[0]?.id ?? "");
  function categoryName(id: string) {
    return categories.find((category) => category.id === id)?.name ?? "Unknown";
  }
  function categoryOf(id: string) {
    return categories.find((category) => category.id === id);
  }
  const filteredAndSorted = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = transactions.filter((transaction) => {
      if (categoryFilter !== ALL_CATEGORIES && transaction.categoryId !== categoryFilter) {
        return false;
      }
      if (term && !transaction.description.toLowerCase().includes(term)) {
        return false;
      }
      if (dateFrom && transaction.date < dateFrom) {
        return false;
      }
      if (dateTo && transaction.date > dateTo) {
        return false;
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case "date":
          return a.date.localeCompare(b.date) * dir;
        case "category":
          return categoryName(a.categoryId).localeCompare(categoryName(b.categoryId)) * dir;
        case "description":
          return a.description.localeCompare(b.description) * dir;
        case "amount":
          return (a.amount - b.amount) * dir;
        default:
          return 0;
      }
    });
  }, [transactions, search, categoryFilter, dateFrom, dateTo, sortField, sortDir, categoryName]);
  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  }
  function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(addAmount);
    const isValid =
      selectedAddCategoryId &&
      addDescription.trim() &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0;
    if (!isValid) return;
    addTransaction({
      categoryId: selectedAddCategoryId,
      description: addDescription.trim(),
      amount: parsedAmount,
      date: new Date().toISOString().slice(0, 10),
      isRecurring: addIsRecurring,
    });
    setAddDescription("");
    setAddAmount("");
    setAddIsRecurring(false);
  }
  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== ALL_CATEGORIES || dateFrom !== "" || dateTo !== "";
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl text-ink">Transactions</h1>
          <p className="text-sm text-ink-soft">
            {transactions.length} transaction{transactions.length === 1 ? "" : "s"} this season.
          </p>
        </div>
        {categories.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCsvImport(true)}
            className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import CSV
          </button>
        )}
      </header>
      {!hasHydrated ? (
        <TableSkeleton rows={7} />
      ) : (
        <>
      <section className="rounded-3xl border border-moss/15 bg-card p-5 shadow-sm">
        {categories.length === 0 ? (
          <p className="rounded-lg bg-canvas px-3 py-2 text-sm text-ink-soft">
            Add a budget category before logging a transaction.
          </p>
        ) : (
          <form onSubmit={handleAddSubmit} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="add-category" className="text-xs text-ink-soft">
                Category
              </label>
              <select
                id="add-category"
                value={selectedAddCategoryId}
                onChange={(event) => setAddCategoryId(event.target.value)}
                className="rounded-lg border border-moss/20 bg-canvas px-2 py-1.5 text-sm text-ink"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[160px] flex-1 flex-col gap-1">
              <label htmlFor="add-description" className="text-xs text-ink-soft">
                Description
              </label>
              <input
                id="add-description"
                type="text"
                value={addDescription}
                onChange={(event) => setAddDescription(event.target.value)}
                placeholder="Coffee with a friend"
                className="rounded-lg border border-moss/20 bg-canvas px-2 py-1.5 text-sm text-ink"
              />
            </div>
            <div className="flex w-24 flex-col gap-1">
              <label htmlFor="add-amount" className="text-xs text-ink-soft">
                Amount
              </label>
              <input
                id="add-amount"
                type="number"
                min="0"
                step="0.01"
                value={addAmount}
                onChange={(event) => setAddAmount(event.target.value)}
                placeholder="0.00"
                className="rounded-lg border border-moss/20 bg-canvas px-2 py-1.5 font-data text-sm text-ink"
              />
            </div>
            <label
              htmlFor="add-recurring"
              className="flex items-center gap-1.5 pb-1.5 text-xs text-ink-soft"
            >
              <input
                id="add-recurring"
                type="checkbox"
                checked={addIsRecurring}
                onChange={(event) => setAddIsRecurring(event.target.checked)}
                className="h-3.5 w-3.5 accent-moss"
              />
              Repeat monthly
            </label>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </button>
          </form>
        )}
      </section>
      <section className="flex flex-wrap items-end gap-2">
        <div className="flex min-w-[180px] flex-1 flex-col gap-1">
          <label htmlFor="filter-search" className="text-xs text-ink-soft">
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
            <input
              id="filter-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search descriptions"
              className="w-full rounded-lg border border-moss/20 bg-card py-1.5 pl-8 pr-2 text-sm text-ink"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-category" className="text-xs text-ink-soft">
            Category
          </label>
          <select
            id="filter-category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border border-moss/20 bg-card px-2 py-1.5 text-sm text-ink"
          >
            <option value={ALL_CATEGORIES}>All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-date-from" className="text-xs text-ink-soft">
            From
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-lg border border-moss/20 bg-card px-2 py-1.5 font-data text-sm text-ink"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-date-to" className="text-xs text-ink-soft">
            To
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="rounded-lg border border-moss/20 bg-card px-2 py-1.5 font-data text-sm text-ink"
          />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryFilter(ALL_CATEGORIES);
              setDateFrom("");
              setDateTo("");
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Clear filters
          </button>
        )}
      </section>
      <section className="rounded-3xl border border-moss/15 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="text-xs tracking-wide text-ink-soft uppercase">
                <th className="border-b border-moss/10 px-5 py-3">
                  <SortHeader
                    field="date"
                    label="Date"
                    activeField={sortField}
                    dir={sortDir}
                    onToggle={toggleSort}
                  />
                </th>
                <th className="border-b border-moss/10 px-3 py-3">
                  <SortHeader
                    field="category"
                    label="Category"
                    activeField={sortField}
                    dir={sortDir}
                    onToggle={toggleSort}
                  />
                </th>
                <th className="border-b border-moss/10 px-3 py-3">
                  <SortHeader
                    field="description"
                    label="Description"
                    activeField={sortField}
                    dir={sortDir}
                    onToggle={toggleSort}
                  />
                </th>
                <th className="border-b border-moss/10 px-3 py-3 text-right">
                  <SortHeader
                    field="amount"
                    label="Amount"
                    activeField={sortField}
                    dir={sortDir}
                    onToggle={toggleSort}
                    align="right"
                  />
                </th>
                <th className="border-b border-moss/10 px-5 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((transaction) => (
                <tr key={transaction.id} className="border-b border-moss/10 last:border-b-0 hover:bg-moss/5">
                  <td className="px-5 py-2.5 font-data text-ink-soft">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-3 py-2.5">
                    {(() => {
                      const category = categoryOf(transaction.categoryId);
                      return category ? (
                        <CategoryChip name={category.name} species={category.species} />
                      ) : (
                        <span className="text-ink-soft">Unknown</span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2.5 text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      {transaction.description}
                      {transaction.isRecurring && (
                        <Repeat
                          className="h-3 w-3 shrink-0 text-moss"
                          role="img"
                          aria-label="Repeats monthly"
                        />
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-data text-ink">
                    {formatCurrency(transaction.amount, currencyCode)}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setTransactionModal({ transaction })}
                        aria-label={`Edit transaction: ${transaction.description}`}
                        className="rounded-full p-1 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTransaction(transaction)}
                        aria-label={`Delete transaction: ${transaction.description}`}
                        className="rounded-full p-1 text-ink-soft transition-colors hover:bg-rust/10 hover:text-rust active:bg-rust/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
      {transactionModal && (
        <TransactionModal
          state={transactionModal}
          categories={categories}
          onClose={() => setTransactionModal(null)}
          onSubmit={(id, values) => {
            updateTransaction(id, values);
            setTransactionModal(null);
          }}
        />
      )}
      {confirmDeleteTransaction && (
        <ConfirmDialog
          title="Delete transaction?"
          description={`This removes the ${formatCurrency(
            confirmDeleteTransaction.amount,
            currencyCode,
          )} ${categoryName(confirmDeleteTransaction.categoryId)} transaction from ${formatDate(
            confirmDeleteTransaction.date,
          )}. This can't be undone.`}
          onConfirm={() => {
            deleteTransaction(confirmDeleteTransaction.id);
            setConfirmDeleteTransaction(null);
          }}
          onClose={() => setConfirmDeleteTransaction(null)}
        />
      )}
      {showCsvImport && (
        <CsvImportModal
          categories={categories}
          currencyCode={currencyCode}
          onClose={() => setShowCsvImport(false)}
          onImport={(newTransactions) => {
            importTransactions(newTransactions);
            setShowCsvImport(false);
            const count = newTransactions.length;
            captureEvent("transactions_imported", { count });
            flashActionToast(`Imported ${count} transaction${count === 1 ? "" : "s"}`);
          }}
        />
      )}
      <ActionToast message={actionToast} />
    </main>
  );
}
