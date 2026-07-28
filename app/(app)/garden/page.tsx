"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sprout as SproutIcon,
  Coins,
  Repeat,
  Sparkles,
  Wallet,
  PiggyBank,
  Target,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useBudgetStore } from "@/store/budgetStore";
import { getGardenHealth, getPercentSpent } from "@/lib/gardenLogic";
import { getGoalProgress, isGoalComplete } from "@/lib/goalLogic";
import { captureEvent } from "@/lib/analytics";
import { formatCurrency } from "@/lib/currency";
import { formatDate, sortByDateDesc } from "@/lib/transactions";
import { WeatherBanner } from "@/components/WeatherBanner";
import { StatCard, type StatCardTone } from "@/components/StatCard";
import { GardenCanvas } from "@/components/GardenCanvas";
import { GardenAdvisor } from "@/components/GardenAdvisor";
import { CategoryModal, type CategoryModalState } from "@/components/CategoryModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { CurrencyProfilePage } from "@/components/CurrencyProfilePage";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { Walkthrough } from "@/components/Walkthrough";
import { ActionToast } from "@/components/ActionToast";
import { StatCardSkeletonRow, TableSkeleton, CardSkeleton } from "@/components/Skeleton";
const ACTION_TOAST_DURATION_MS = 1600;
const RECENT_TRANSACTIONS_LIMIT = 5;
export default function Home() {
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const categories = useBudgetStore((state) => state.categories);
  const transactions = useBudgetStore((state) => state.transactions);
  const goals = useBudgetStore((state) => state.goals);
  const activeSeason = useBudgetStore((state) => state.activeSeason);
  const currencyCode = useBudgetStore((state) => state.currencyCode);
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
  const startNewSeason = useBudgetStore((state) => state.startNewSeason);
  const fetchAdvisorNotes = useBudgetStore((state) => state.fetchAdvisorNotes);
  const askAdvisor = useBudgetStore((state) => state.askAdvisor);
  const syncStatus = useBudgetStore((state) => state.syncStatus);
  const syncError = useBudgetStore((state) => state.syncError);
  const hasSeenWalkthrough = useBudgetStore((state) => state.hasSeenWalkthrough);
  const completeWalkthrough = useBudgetStore((state) => state.completeWalkthrough);
  const gardenHealth = getGardenHealth(categories);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const recentTransactions = sortByDateDesc(transactions).slice(0, RECENT_TRANSACTIONS_LIMIT);
  const totalBudgeted = categories.reduce((sum, category) => sum + category.budgetLimit, 0);
  const totalSpent = categories.reduce((sum, category) => sum + category.spent, 0);
  const remaining = totalBudgeted - totalSpent;
  const overallPercentSpent =
    categories.length === 0
      ? 0
      : getPercentSpent({ ...categories[0], budgetLimit: totalBudgeted, spent: totalSpent });
  const spentTone: StatCardTone =
    overallPercentSpent > 1 ? "danger" : overallPercentSpent >= 0.85 ? "warning" : "default";
  const remainingTone: StatCardTone = remaining < 0 ? "danger" : "positive";
  const activeGoalCount = goals.filter((goal) => !isGoalComplete(goal)).length;
  function flashActionToast(message: string) {
    setActionToast(message);
    window.setTimeout(() => setActionToast(null), ACTION_TOAST_DURATION_MS);
  }
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold tracking-[0.2em] text-ink-soft uppercase">
              {activeSeason}
            </p>
            <h1 className="font-display text-3xl text-ink">Sprout</h1>
            <p className="text-sm text-ink-soft">
              Every category is a plant. Every dollar you save waters it.
            </p>
            <SyncStatusIndicator status={syncStatus} error={syncError} />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                startNewSeason();
                captureEvent("season_harvested", { trigger: "manual" });
              }}
              className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-card px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              <SproutIcon className="h-4 w-4" aria-hidden="true" />
              Harvest Season
            </button>
            <UserButton>
              <UserButton.UserProfilePage
                label="Currency"
                url="currency"
                labelIcon={<Coins className="h-4 w-4" aria-hidden="true" />}
              >
                <CurrencyProfilePage />
              </UserButton.UserProfilePage>
            </UserButton>
          </div>
        </header>
        {!hasHydrated ? (
          <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading your garden">
            <StatCardSkeletonRow />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <CardSkeleton bodyHeight="h-72" />
              <TableSkeleton rows={5} />
            </div>
            <CardSkeleton bodyHeight="h-24" />
            <CardSkeleton bodyHeight="h-32" />
          </div>
        ) : (
          <>
            <WeatherBanner
              status={gardenHealth}
              onAddCategory={() => setCategoryModal({ mode: "add" })}
            />
            {categories.length > 0 && (
              <div
                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                aria-label="Season at a glance"
              >
                <StatCard
                  label="Budgeted"
                  value={formatCurrency(totalBudgeted, currencyCode)}
                  icon={Wallet}
                />
                <StatCard
                  label="Spent"
                  value={formatCurrency(totalSpent, currencyCode)}
                  tone={spentTone}
                  trend={{
                    direction: overallPercentSpent > 1 ? "up" : "flat",
                    label: `${Math.round(overallPercentSpent * 100)}% of budget`,
                  }}
                  icon={Coins}
                />
                <StatCard
                  label="Remaining"
                  value={formatCurrency(remaining, currencyCode)}
                  tone={remainingTone}
                  icon={PiggyBank}
                />
                <StatCard label="Active goals" value={String(activeGoalCount)} icon={Target} />
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <GardenCanvas
                categories={categories}
                currencyCode={currencyCode}
                onAddCategory={() => setCategoryModal({ mode: "add" })}
                onEditCategory={(category) => setCategoryModal({ mode: "edit", category })}
              />
              <section
                className="rounded-3xl border border-moss/15 bg-card shadow-sm"
                aria-label="Recent transactions"
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <h2 className="font-display text-lg text-ink">Recent transactions</h2>
                    <p className="text-xs text-ink-soft">
                      {transactions.length} transaction{transactions.length === 1 ? "" : "s"} this
                      season
                    </p>
                  </div>
                  <Link
                    href="/transactions"
                    className="flex items-center gap-1 text-sm font-semibold text-moss hover:underline"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <ul className="border-t border-moss/10 px-5 py-2">
                  {recentTransactions.map((transaction) => (
                    <li
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 border-b border-moss/10 py-2.5 text-sm last:border-b-0"
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="inline-flex items-center gap-1.5 truncate text-ink">
                          {transaction.description}
                          {transaction.isRecurring && (
                            <Repeat
                              className="h-3 w-3 shrink-0 text-moss"
                              role="img"
                              aria-label="Repeats monthly"
                            />
                          )}
                        </span>
                        <span className="font-data text-xs text-ink-soft">
                          {formatDate(transaction.date)} ·{" "}
                          {categories.find((category) => category.id === transaction.categoryId)
                            ?.name ?? "Unknown"}
                        </span>
                      </div>
                      <span className="shrink-0 font-data text-sm text-ink">
                        {formatCurrency(transaction.amount, currencyCode)}
                      </span>
                    </li>
                  ))}
                </ul>
                {recentTransactions.length === 0 && (
                  <p className="border-t border-moss/10 px-5 py-6 text-center text-sm text-ink-soft">
                    No transactions yet.
                  </p>
                )}
              </section>
            </div>
            <section
              className="rounded-3xl border border-moss/15 bg-card px-6 py-6 shadow-sm"
              aria-label="Goal summary"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg text-ink">Goal Trees</h2>
                <Link
                  href="/goals"
                  className="flex items-center gap-1 text-sm font-semibold text-moss hover:underline"
                >
                  View all goals
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              {goals.length === 0 ? (
                <p className="text-sm text-ink-soft">No goals planted yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {goals.map((goal) => {
                    const progress = getGoalProgress(goal);
                    const complete = isGoalComplete(goal);
                    return (
                      <li key={goal.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-ink">
                            {goal.name}
                            {complete && (
                              <Sparkles className="h-3.5 w-3.5 text-marigold" aria-hidden="true" />
                            )}
                          </span>
                          <span className="font-data text-ink-soft">
                            {formatCurrency(goal.currentAmount, currencyCode)} /{" "}
                            {formatCurrency(goal.targetAmount, currencyCode)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                          <div
                            className="h-full rounded-full bg-moss transition-all"
                            style={{ width: `${Math.min(progress, 1) * 100}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
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
      </main>
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
          onClose={() => setCategoryModal(null)}
          onSubmit={(values) => {
            if (categoryModal.mode === "edit") {
              updateCategory(categoryModal.category.id, values);
            } else {
              addCategory(values);
              captureEvent("category_added");
              flashActionToast("Category added");
            }
            setCategoryModal(null);
          }}
        />
      )}
      <ActionToast message={actionToast} />
    </div>
  );
}
