"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowRightLeft, PiggyBank, Wallet } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
import { formatCurrency } from "@/lib/currency";
import { getPercentSpent, getGrowthStage } from "@/lib/gardenLogic";
import { CategoryModal, type CategoryModalState } from "@/components/CategoryModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UpcomingBills } from "@/components/UpcomingBills";
import { CardSkeleton } from "@/components/Skeleton";
import { PlantThumbnail } from "@/components/PlantThumbnail";
import { StatusPill } from "@/components/StatusPill";
import { EnvelopeFillModal, type EnvelopeModalState } from "@/components/EnvelopeFillModal";
import { AllocationHistoryList } from "@/components/AllocationHistoryList";
import { StatCard } from "@/components/StatCard";

export default function BudgetPage() {
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const categories = useBudgetStore((state) => state.categories);
  const transactions = useBudgetStore((state) => state.transactions);
  const currencyCode = useBudgetStore((state) => state.currencyCode);
  const activeSeason = useBudgetStore((state) => state.activeSeason);
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
    return transactions.filter((t) => t.categoryId === categoryId).length;
  }
  const confirmDeleteCategory = confirmDeleteId
    ? (categories.find((c) => c.id === confirmDeleteId) ?? null)
    : null;
  const confirmDeleteTxCount = confirmDeleteId ? transactionCountFor(confirmDeleteId) : 0;

  const totalBudgeted = categories.reduce((sum, c) => sum + c.budgetLimit, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const overallPercent = totalBudgeted > 0 ? totalSpent / totalBudgeted : 0;
  const remaining = totalBudgeted - totalSpent;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl text-ink">Budget</h1>
          <p className="text-sm text-ink-soft">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"} · {formatCurrency(totalBudgeted, currencyCode)} total budgeted
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEnvelopeModal({ mode: "income" })}
            className="rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10"
          >
            Add income
          </button>
          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => setEnvelopeModal({ mode: "move" })}
              className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10"
            >
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              Move money
            </button>
          )}
          <button
            type="button"
            onClick={() => setCategoryModal({ mode: "add" })}
            className="flex items-center gap-1.5 rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add category
          </button>
        </div>
      </header>

      {!hasHydrated ? (
        <>
          <CardSkeleton bodyHeight="h-20" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Loading your budget">
            <CardSkeleton bodyHeight="h-24" />
            <CardSkeleton bodyHeight="h-24" />
            <CardSkeleton bodyHeight="h-24" />
            <CardSkeleton bodyHeight="h-24" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label="Unallocated"
              value={formatCurrency(unallocated, currencyCode)}
              tone={unallocated > 0 ? "positive" : "default"}
              subtitle="Ready to move into an envelope"
              icon={PiggyBank}
            />
            <StatCard
              label="Total budgeted"
              value={formatCurrency(totalBudgeted, currencyCode)}
              subtitle={`${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
              icon={Wallet}
            />
          </div>

          {categories.length > 0 && (
            <section className="rounded-2xl border border-moss/10 bg-card px-6 py-5 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{activeSeason} — Overall spending</p>
                <p className="font-data text-sm text-ink">
                  {formatCurrency(totalSpent, currencyCode)} / {formatCurrency(totalBudgeted, currencyCode)}
                </p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className={`h-full rounded-full ${overallPercent > 1 ? "bg-rust" : "bg-moss"}`}
                  style={{ width: `${Math.min(overallPercent, 1) * 100}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-ink-soft">
                <span>{Math.round(overallPercent * 100)}% spent</span>
                <span>{formatCurrency(Math.max(remaining, 0), currencyCode)} remaining</span>
              </div>
            </section>
          )}

          <UpcomingBills transactions={transactions} categories={categories} currencyCode={currencyCode} />

          {categories.length === 0 ? (
            <p className="rounded-2xl border border-moss/10 bg-card px-5 py-6 text-center text-sm text-ink-soft shadow-sm">
              No categories planted yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {categories.map((category) => {
                const percentSpent = getPercentSpent(category);
                const stage = getGrowthStage(percentSpent);
                const remainingForCategory = category.budgetLimit - category.spent;
                const over = remainingForCategory < 0;
                return (
                  <div key={category.id} className="rounded-2xl border border-moss/10 bg-card p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <PlantThumbnail species={category.species} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-ink">{category.name}</p>
                          <StatusPill stage={stage} />
                        </div>
                        <p className="font-data text-sm text-ink">
                          {formatCurrency(category.spent, currencyCode)}{" "}
                          <span className="text-ink-soft">of {formatCurrency(category.budgetLimit, currencyCode)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                      <div
                        className={`h-full rounded-full ${over ? "bg-rust" : "bg-moss"}`}
                        style={{ width: `${Math.min(percentSpent, 1) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className={`text-xs ${over ? "text-rust" : "text-ink-soft"}`}>
                        {over
                          ? `${formatCurrency(Math.abs(remainingForCategory), currencyCode)} over budget`
                          : `${formatCurrency(remainingForCategory, currencyCode)} remaining`}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEnvelopeModal({ mode: "move", to: category.id })}
                          aria-label={`Move money into ${category.name}`}
                          title="Fill from unallocated or another envelope"
                          className="rounded-full p-1 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryModal({ mode: "edit", category })}
                          aria-label={`Edit category: ${category.name}`}
                          className="rounded-full p-1 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(category.id)}
                          aria-label={`Delete category: ${category.name}`}
                          className="rounded-full p-1 text-ink-soft transition-colors hover:bg-rust/10 hover:text-rust"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <AllocationHistoryList events={allocationHistory} categories={categories} currencyCode={currencyCode} />
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
              ? `Deleting ${confirmDeleteCategory.name} also removes ${confirmDeleteTxCount} transaction${confirmDeleteTxCount === 1 ? "" : "s"} logged against it. This can't be undone.`
              : `This removes ${confirmDeleteCategory.name} from your garden. This can't be undone.`
          }
          onConfirm={() => { deleteCategory(confirmDeleteCategory.id); setConfirmDeleteId(null); }}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}
    </main>
  );
}