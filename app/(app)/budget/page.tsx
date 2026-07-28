"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowRightLeft, Banknote } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
import { formatCurrency } from "@/lib/currency";
import { getPercentSpent, getGrowthStage } from "@/lib/gardenLogic";
import { plantTypeMap } from "@/constants/gardenAssets";
import { CategoryModal, type CategoryModalState } from "@/components/CategoryModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UpcomingBills } from "@/components/UpcomingBills";
import { CardSkeleton } from "@/components/Skeleton";
import { StatCard } from "@/components/StatCard";
import { EnvelopeFillModal, type EnvelopeModalState } from "@/components/EnvelopeFillModal";
import { AllocationHistoryList } from "@/components/AllocationHistoryList";
export default function BudgetPage() {
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const categories = useBudgetStore((state) => state.categories);
  const transactions = useBudgetStore((state) => state.transactions);
  const currencyCode = useBudgetStore((state) => state.currencyCode);
  const addCategory = useBudgetStore((state) => state.addCategory);
  const updateCategory = useBudgetStore((state) => state.updateCategory);
  const deleteCategory = useBudgetStore((state) => state.deleteCategory);
  const unallocated = useBudgetStore((state) => state.unallocated);
  const allocationHistory = useBudgetStore((state) => state.allocationHistory);
  const addIncome = useBudgetStore((state) => state.addIncome);
  const moveMoney = useBudgetStore((state) => state.moveMoney);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [envelopeModal, setEnvelopeModal] = useState<EnvelopeModalState | null>(null);
  function transactionCountFor(categoryId: string) {
    return transactions.filter((transaction) => transaction.categoryId === categoryId).length;
  }
  const confirmDeleteCategory = confirmDeleteId
    ? (categories.find((category) => category.id === confirmDeleteId) ?? null)
    : null;
  const confirmDeleteTxCount = confirmDeleteId ? transactionCountFor(confirmDeleteId) : 0;
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl text-ink">Budget</h1>
          <p className="text-sm text-ink-soft">
            Every category&apos;s budget, spend, and plant, all on one screen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEnvelopeModal({ mode: "income" })}
            className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <Banknote className="h-4 w-4" aria-hidden="true" />
            Add income
          </button>
          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => setEnvelopeModal({ mode: "move" })}
              className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              Move money
            </button>
          )}
          <button
            type="button"
            onClick={() => setCategoryModal({ mode: "add" })}
            className="flex items-center gap-1.5 rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add category
          </button>
        </div>
      </header>
      {!hasHydrated ? (
        <>
          <CardSkeleton bodyHeight="h-20" />
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading your budget">
            <CardSkeleton bodyHeight="h-16" />
            <CardSkeleton bodyHeight="h-16" />
            <CardSkeleton bodyHeight="h-16" />
          </div>
        </>
      ) : (
        <>
      <StatCard
        label="Unallocated"
        value={formatCurrency(unallocated, currencyCode)}
        icon={Banknote}
        tone={unallocated > 0 ? "positive" : "default"}
      />
      <UpcomingBills
        transactions={transactions}
        categories={categories}
        currencyCode={currencyCode}
      />
      {categories.length === 0 ? (
        <p className="rounded-3xl border border-moss/15 bg-card px-5 py-6 text-center text-sm text-ink-soft shadow-sm">
          No categories planted yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {categories.map((category) => {
            const percentSpent = getPercentSpent(category);
            const stage = getGrowthStage(percentSpent);
            const barColor = plantTypeMap[category.species].stages[stage].accent;
            const remaining = category.budgetLimit - category.spent;
            const txCount = transactionCountFor(category.id);
            return (
              <li
                key={category.id}
                className="rounded-3xl border border-moss/15 bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-ink">{category.name}</p>
                    <p className="text-xs text-ink-soft">
                      {plantTypeMap[category.species].label} · {txCount} transaction
                      {txCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEnvelopeModal({ mode: "move", to: category.id })}
                      aria-label={`Move money into ${category.name}`}
                      title="Fill from unallocated or another envelope"
                      className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                    >
                      <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryModal({ mode: "edit", category })}
                      aria-label={`Edit category: ${category.name}`}
                      className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(category.id)}
                      aria-label={`Delete category: ${category.name}`}
                      className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-rust/10 hover:text-rust active:bg-rust/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="font-data text-ink">
                    {formatCurrency(category.spent, currencyCode)} of{" "}
                    {formatCurrency(category.budgetLimit, currencyCode)}
                  </span>
                  <span
                    className={`font-data ${remaining < 0 ? "text-rust" : "text-ink-soft"}`}
                  >
                    {remaining < 0
                      ? `${formatCurrency(Math.abs(remaining), currencyCode)} over`
                      : `${formatCurrency(remaining, currencyCode)} left`}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(percentSpent, 1) * 100}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <AllocationHistoryList
        events={allocationHistory}
        categories={categories}
        currencyCode={currencyCode}
      />
        </>
      )}
      {categoryModal && (
        <CategoryModal
          state={categoryModal}
          onClose={() => setCategoryModal(null)}
          onSubmit={(values) => {
            if (categoryModal.mode === "edit") {
              updateCategory(categoryModal.category.id, values);
            } else {
              addCategory(values);
            }
            setCategoryModal(null);
          }}
        />
      )}
      {envelopeModal && (
        <EnvelopeFillModal
          state={envelopeModal}
          categories={categories}
          unallocated={unallocated}
          currencyCode={currencyCode}
          onClose={() => setEnvelopeModal(null)}
          onAddIncome={addIncome}
          onMoveMoney={moveMoney}
        />
      )}
      {confirmDeleteCategory && (
        <ConfirmDialog
          title="Delete category?"
          description={
            confirmDeleteTxCount > 0
              ? `Deleting ${confirmDeleteCategory.name} also removes ${confirmDeleteTxCount} transaction${
                  confirmDeleteTxCount === 1 ? "" : "s"
                } logged against it. This can't be undone.`
              : `This removes ${confirmDeleteCategory.name} from your garden. This can't be undone.`
          }
          onConfirm={() => {
            deleteCategory(confirmDeleteCategory.id);
            setConfirmDeleteId(null);
          }}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}
    </main>
  );
}
