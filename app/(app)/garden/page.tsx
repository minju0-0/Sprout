"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Wallet, Coins, PiggyBank, Target, Plus } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
import { getGardenHealth, getPercentSpent } from "@/lib/gardenLogic";
import { isDateInSeason } from "@/lib/seasonLogic";
import { captureEvent } from "@/lib/analytics";
import { formatCurrency } from "@/lib/currency";
import { sortByDateDesc } from "@/lib/transactions";
import { WeatherBanner } from "@/components/WeatherBanner";
import { StatCard, type StatCardTone } from "@/components/StatCard";
import { GardenBedPanel } from "@/components/GardenBedPanel";
import { RecentTransactionsList } from "@/components/RecentTransactionsList";
import { BudgetAtAGlance } from "@/components/BudgetAtAGlance";
import { GardenAdvisor } from "@/components/GardenAdvisor";
import { CategoryModal, type CategoryModalState } from "@/components/CategoryModal";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Walkthrough } from "@/components/Walkthrough";
import { ActionToast } from "@/components/ActionToast";
import { StatCardSkeletonRow, TableSkeleton, CardSkeleton } from "@/components/Skeleton";
const ACTION_TOAST_DURATION_MS = 1600;
const RECENT_TRANSACTIONS_LIMIT = 6;
export default function GardenPage() {
  const addTransaction = useBudgetStore((state) => state.addTransaction);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const categories = useBudgetStore((state) => state.categories);
  const transactions = useBudgetStore((state) => state.transactions);
  const goals = useBudgetStore((state) => state.goals);
  const currencyCode = useBudgetStore((state) => state.currencyCode);
  const activeSeason = useBudgetStore((state) => state.activeSeason);
  const unallocated = useBudgetStore((state) => state.unallocated);
  const setCurrencyCode = useBudgetStore((state) => state.setCurrencyCode);
  const advisorNotes = useBudgetStore((state) => state.advisorNotes);
  const isAdvisorLoading = useBudgetStore((state) => state.isAdvisorLoading);
  const advisorError = useBudgetStore((state) => state.advisorError);
  const advisorSource = useBudgetStore((state) => state.advisorSource);
  const askAnswer = useBudgetStore((state) => state.askAnswer);
  const isAdvisorAsking = useBudgetStore((state) => state.isAdvisorAsking);
  const advisorAskError = useBudgetStore((state) => state.advisorAskError);
  const advisorAskSource = useBudgetStore((state) => state.advisorAskSource);
  const addCategory = useBudgetStore((state) => state.addCategory);
  const updateCategory = useBudgetStore((state) => state.updateCategory);
  const fetchAdvisorNotes = useBudgetStore((state) => state.fetchAdvisorNotes);
  const askAdvisor = useBudgetStore((state) => state.askAdvisor);
  const hasSeenWalkthrough = useBudgetStore((state) => state.hasSeenWalkthrough);
  const completeWalkthrough = useBudgetStore((state) => state.completeWalkthrough);
  const gardenHealth = getGardenHealth(categories);
  const { user, isLoaded } = useUser();
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  // Only this season's transactions belong on the "at a glance" dashboard —
  // a previous season's activity is already frozen into its own harvest
  // record and lives on /reports, not here.
  const currentSeasonTransactions = transactions.filter((transaction) =>
    isDateInSeason(transaction.date, activeSeason),
  );
  const recentTransactions = sortByDateDesc(currentSeasonTransactions).slice(
    0,
    RECENT_TRANSACTIONS_LIMIT,
  );
  const totalBudgeted = categories.reduce((sum, c) => sum + c.budgetLimit, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = totalBudgeted - totalSpent;
  const overallPercentSpent =
    categories.length === 0
      ? 0
      : getPercentSpent({ ...categories[0], budgetLimit: totalBudgeted, spent: totalSpent });
  const spentTone: StatCardTone =
    overallPercentSpent > 1 ? "danger" : overallPercentSpent >= 0.85 ? "warning" : "default";
  const remainingTone: StatCardTone = remaining < 0 ? "danger" : "positive";
  const activeGoalCount = goals.length;
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  function flashActionToast(message: string) {
    setActionToast(message);
    window.setTimeout(() => setActionToast(null), ACTION_TOAST_DURATION_MS);
  }
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 sm:px-8">
      {}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl text-ink">
            Good {timeOfDayGreeting()}
            {isLoaded && (user?.firstName || user?.username) ? `, ${user.firstName ?? user.username}` : ""}
          </h1>
          <p className="text-sm text-ink-soft">Here&apos;s what your garden looks like today.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddTransaction(true)}
          disabled={categories.length === 0}
          className="flex items-center gap-1.5 rounded-xl bg-moss px-4 py-2 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add transaction
        </button>
      </header>
      {!hasHydrated ? (
        <>
          <CardSkeleton bodyHeight="h-16" />
          <StatCardSkeletonRow />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            <CardSkeleton bodyHeight="h-72" />
            <TableSkeleton rows={5} />
          </div>
          <CardSkeleton bodyHeight="h-40" />
        </>
      ) : (
        <>
          {}
          <WeatherBanner
            status={gardenHealth}
            percentSpent={categories.length > 0 ? overallPercentSpent : undefined}
            onAddCategory={() => setCategoryModal({ mode: "add" })}
          />
          {}
          {categories.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Season at a glance">
              <StatCard
                label="Budgeted"
                value={formatCurrency(totalBudgeted, currencyCode)}
                subtitle="This month"
                icon={Wallet}
              />
              <StatCard
                label="Spent"
                value={formatCurrency(totalSpent, currencyCode)}
                tone={spentTone}
                subtitle={`${Math.round(overallPercentSpent * 100)}% of budget`}
                icon={Coins}
              />
              <StatCard
                label="Remaining"
                value={formatCurrency(remaining, currencyCode)}
                tone={remainingTone}
                subtitle={`${Math.round((1 - overallPercentSpent) * 100)}% left`}
                icon={PiggyBank}
              />
              <StatCard
                label="Active goals"
                value={String(activeGoalCount)}
                subtitle={`${formatCurrency(totalGoalSaved, currencyCode)} saved total`}
                icon={Target}
              />
            </div>
          )}
          {}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
            <GardenBedPanel
              categories={categories}
              currencyCode={currencyCode}
              activeSeason={activeSeason}
              onAddCategory={() => setCategoryModal({ mode: "add" })}
              onEditCategory={(category) => setCategoryModal({ mode: "edit", category })}
            />
            <RecentTransactionsList
              transactions={recentTransactions}
              categories={categories}
              currencyCode={currencyCode}
              totalCount={currentSeasonTransactions.length}
            />
          </div>
          {}
          <BudgetAtAGlance categories={categories} currencyCode={currencyCode} />
          {}
          <GardenAdvisor
            notes={advisorNotes}
            isLoading={isAdvisorLoading}
            error={advisorError}
            source={advisorSource}
            onRefresh={fetchAdvisorNotes}
            askAnswer={askAnswer}
            isAsking={isAdvisorAsking}
            askError={advisorAskError}
            askSource={advisorAskSource}
            onAsk={(question) => {
              askAdvisor(question);
              captureEvent("advisor_question_asked");
            }}
          />
        </>
      )}
      {}
      {showAddTransaction && (
        <AddTransactionModal
          categories={categories}
          activeSeason={activeSeason}
          onClose={() => setShowAddTransaction(false)}
          onSubmit={(values) => {
            addTransaction(values);
            setShowAddTransaction(false);
            flashActionToast("Transaction added");
          }}
        />
      )}
      {hasHydrated && currencyCode === null && <OnboardingModal onConfirm={setCurrencyCode} />}
      {hasHydrated && currencyCode !== null && !hasSeenWalkthrough && (
        <Walkthrough
          onComplete={() => {
            completeWalkthrough();
            captureEvent("walkthrough_completed");
          }}
        />
      )}
      {categoryModal && (
        <CategoryModal
          state={categoryModal}
          unallocated={unallocated}
          currencyCode={currencyCode}
          onClose={() => setCategoryModal(null)}
          onSubmit={(values, fundFromUnallocated) => {
            if (categoryModal.mode === "edit") {
              updateCategory(categoryModal.category.id, values, fundFromUnallocated);
            } else {
              addCategory(values, fundFromUnallocated);
              captureEvent("category_added");
              flashActionToast("Category added");
            }
            setCategoryModal(null);
          }}
        />
      )}
      <ActionToast message={actionToast} />
    </main>
  );
}
function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}