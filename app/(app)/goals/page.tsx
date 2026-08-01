"use client";
import { useState } from "react";
import { Plus, Sparkles, PartyPopper, Scissors, Pencil, Trash2 } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
import { GoalModal, type GoalModalState } from "@/components/GoalModal";
import { DebtModal, type DebtModalState } from "@/components/DebtModal";
import { HistoryModal } from "@/components/HistoryModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CardSkeleton } from "@/components/Skeleton";
import { GoalTree } from "@/components/GoalTree";
import { DebtBoulder } from "@/components/DebtBoulder";
import { formatCurrency } from "@/lib/currency";
import type { Goal, Debt } from "@/types";
export default function GoalsPage() {
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const goals = useBudgetStore((state) => state.goals);
  const debts = useBudgetStore((state) => state.debts);
  const currencyCode = useBudgetStore((state) => state.currencyCode);
  const unallocated = useBudgetStore((state) => state.unallocated);
  const addContribution = useBudgetStore((state) => state.addContribution);
  const addGoal = useBudgetStore((state) => state.addGoal);
  const updateGoal = useBudgetStore((state) => state.updateGoal);
  const deleteGoal = useBudgetStore((state) => state.deleteGoal);
  const addDebt = useBudgetStore((state) => state.addDebt);
  const updateDebt = useBudgetStore((state) => state.updateDebt);
  const deleteDebt = useBudgetStore((state) => state.deleteDebt);
  const addDebtPayment = useBudgetStore((state) => state.addDebtPayment);
  const [goalModal, setGoalModal] = useState<GoalModalState | null>(null);
  const [debtModal, setDebtModal] = useState<DebtModalState | null>(null);
const [historyModal, setHistoryModal] = useState<
  { type: "goal"; goal: Goal } | { type: "debt"; debt: Debt } | null
>(null);
  const [confirmDeleteGoal, setConfirmDeleteGoal] = useState<Goal | null>(null);
  const [confirmDeleteDebt, setConfirmDeleteDebt] = useState<Debt | null>(null);
  const [goalAmounts, setGoalAmounts] = useState<Record<string, string>>({});
  const [debtAmounts, setDebtAmounts] = useState<Record<string, string>>({});
  const [goalErrors, setGoalErrors] = useState<Record<string, string>>({});
  const [debtErrors, setDebtErrors] = useState<Record<string, string>>({});
  // Bug fix (unallocated sourcing): per-goal/per-debt "did the person opt to
  // actually pull this contribution/payment from the shared unallocated
  // pool" flag. Defaults false everywhere, matching the exact old behavior
  // (a contribution is just a tracking number) until someone opts in.
  const [goalFundFlags, setGoalFundFlags] = useState<Record<string, boolean>>({});
  const [debtFundFlags, setDebtFundFlags] = useState<Record<string, boolean>>({});
  const activeGoalsCount = goals.filter((g) => g.currentAmount < g.targetAmount).length;
  const activeDebtsCount = debts.filter((d) => d.currentAmount > 0).length;
  function clearGoalError(goalId: string) {
    setGoalErrors((prev) => {
      if (!prev[goalId]) return prev;
      const next = { ...prev };
      delete next[goalId];
      return next;
    });
  }
  function clearDebtError(debtId: string) {
    setDebtErrors((prev) => {
      if (!prev[debtId]) return prev;
      const next = { ...prev };
      delete next[debtId];
      return next;
    });
  }
  const handleGoalSubmit = (e: React.FormEvent, goalId: string) => {
    e.preventDefault();
    const raw = goalAmounts[goalId] ?? "";
    const val = Number(raw);
    // Bug #5 fix: surface a real inline error instead of silently no-op'ing
    // on an empty, non-numeric, or non-positive amount.
    if (!raw.trim() || !Number.isFinite(val) || val <= 0) {
      setGoalErrors((prev) => ({ ...prev, [goalId]: "Enter an amount greater than 0." }));
      return;
    }
    const fund = goalFundFlags[goalId] ?? false;
    if (fund && val > unallocated) {
      setGoalErrors((prev) => ({
        ...prev,
        [goalId]: `Only ${formatCurrency(unallocated, currencyCode)} available in Unallocated.`,
      }));
      return;
    }
    clearGoalError(goalId);
    addContribution(goalId, val, fund);
    setGoalAmounts((prev) => ({ ...prev, [goalId]: "" }));
  };
  const handleDebtSubmit = (e: React.FormEvent, debtId: string) => {
    e.preventDefault();
    const raw = debtAmounts[debtId] ?? "";
    const val = Number(raw);
    if (!raw.trim() || !Number.isFinite(val) || val <= 0) {
      setDebtErrors((prev) => ({ ...prev, [debtId]: "Enter an amount greater than 0." }));
      return;
    }
    const fund = debtFundFlags[debtId] ?? false;
    if (fund) {
      const debt = debts.find((d) => d.id === debtId);
      // Bug fix: validate against what will actually be deducted (the
      // amount capped to what's still owed), not the raw entered figure —
      // otherwise a slightly-over payment gets wrongly rejected even when
      // the real cost is well within what's available.
      const applied = debt ? Math.min(val, debt.currentAmount) : val;
      if (applied > unallocated) {
        setDebtErrors((prev) => ({
          ...prev,
          [debtId]: `Only ${formatCurrency(unallocated, currencyCode)} available in Unallocated.`,
        }));
        return;
      }
    }
    clearDebtError(debtId);
    addDebtPayment(debtId, val, fund);
    setDebtAmounts((prev) => ({ ...prev, [debtId]: "" }));
  };
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 sm:px-10">
      {}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Goals & Debts</h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            {goals.length} savings goal{goals.length === 1 ? "" : "s"} · {debts.length} debt
            {debts.length === 1 ? "" : "s"} in progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDebtModal({ mode: "add" })}
            className="flex items-center gap-1.5 rounded-xl border border-moss/20 bg-card px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-canvas"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add debt
          </button>
          <button
            type="button"
            onClick={() => setGoalModal({ mode: "add" })}
            className="flex items-center gap-1.5 rounded-xl bg-moss px-4 py-2 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add goal
          </button>
        </div>
      </header>
      {!hasHydrated ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CardSkeleton bodyHeight="h-56" />
          <CardSkeleton bodyHeight="h-56" />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {}
          <section aria-label="Savings Goals">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Savings Goals</h2>
              <span className="rounded-full bg-moss/10 px-2.5 py-0.5 text-xs font-semibold text-moss">
                {activeGoalsCount} active
              </span>
            </div>
            {goals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-moss/20 p-8 text-center text-sm text-ink-soft">
                No savings goals created yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {goals.map((goal) => {
                  const complete = goal.currentAmount >= goal.targetAmount;
                  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                  return (
                    <div
                      key={goal.id}
                      onClick={() => setHistoryModal({ type: "goal", goal })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setHistoryModal({ type: "goal", goal })
                      }
                      aria-label={`View contribution history for ${goal.name}`}
                      className="group flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-moss/10 bg-card p-6 shadow-sm transition-all hover:border-moss/30 hover:shadow-md cursor-pointer"
                    >
                      {}
                      <div className="shrink-0 flex items-center justify-center self-center my-auto p-2 scale-110 -translate-y-1 transform-gpu [&>div>div.text-center]:hidden [&>div>form]:hidden">
                        <GoalTree
                          goal={goal}
                          currencyCode={currencyCode}
                          onContribute={() => {}}
                          onEdit={() => {}}
                        />
                      </div>
                      {}
                      <div className="flex flex-1 flex-col justify-between self-stretch gap-4 min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
                                Savings Goal
                              </span>
                              <h3 className="flex items-center gap-1.5 text-base font-bold text-ink group-hover:text-moss transition-colors">
                                {goal.name}
                                {complete && (
                                  <Sparkles className="h-4 w-4 text-marigold" aria-hidden="true" />
                                )}
                              </h3>
                            </div>
                            {}
                            <div
                              className="flex items-center gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setGoalModal({ mode: "edit", goal })}
                                className="rounded p-1 text-ink-soft hover:text-moss transition-colors"
                                aria-label={`Edit ${goal.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteGoal(goal)}
                                className="rounded p-1 text-ink-soft hover:text-rust transition-colors"
                                aria-label={`Delete ${goal.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1.5 font-data text-xs text-ink-soft">
                            <div className="flex justify-between">
                              <span>Saved:</span>
                              <span className="font-semibold text-moss">
                                {formatCurrency(goal.currentAmount, currencyCode)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Target:</span>
                              <span className="font-semibold text-ink">
                                {formatCurrency(goal.targetAmount, currencyCode)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-moss/10 pt-3">
                          {complete ? (
                            <span className="font-data text-xs font-semibold text-moss">
                              🎉 Goal Achieved!
                            </span>
                          ) : (
                            <div className="space-y-2">
                              <p className="font-data text-[11px] text-ink-soft">
                                <strong className="text-ink">
                                  {formatCurrency(remaining, currencyCode)}
                                </strong>{" "}
                                remaining
                              </p>
                              {}
                              <form
                                onSubmit={(e) => handleGoalSubmit(e, goal.id)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="flex flex-col gap-1.5"
                              >
                                <div className="flex gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={goalAmounts[goal.id] || ""}
                                    onChange={(e) => {
                                      setGoalAmounts({ ...goalAmounts, [goal.id]: e.target.value });
                                      clearGoalError(goal.id);
                                    }}
                                    placeholder="Add $"
                                    aria-invalid={Boolean(goalErrors[goal.id])}
                                    className="w-full min-w-0 rounded-lg border border-moss/20 bg-canvas px-2.5 py-1 font-data text-xs text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
                                  />
                                  <button
                                    type="submit"
                                    className="shrink-0 rounded-lg bg-moss px-3 py-1 text-xs font-semibold text-canvas transition-colors hover:bg-moss-light"
                                  >
                                    Add
                                  </button>
                                </div>
                                <label className="flex items-center gap-1.5 text-[10px] text-ink-soft">
                                  <input
                                    type="checkbox"
                                    checked={goalFundFlags[goal.id] ?? false}
                                    onChange={(e) =>
                                      setGoalFundFlags((prev) => ({
                                        ...prev,
                                        [goal.id]: e.target.checked,
                                      }))
                                    }
                                    disabled={unallocated <= 0}
                                    className="h-3 w-3 accent-moss"
                                  />
                                  Fund from Unallocated ({formatCurrency(unallocated, currencyCode)} avail.)
                                </label>
                                {goalErrors[goal.id] && (
                                  <p className="text-[11px] text-rust">{goalErrors[goal.id]}</p>
                                )}
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          {}
          <section aria-label="Debt Boulders">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Debt Boulders</h2>
              <span className="rounded-full bg-rust/10 px-2.5 py-0.5 text-xs font-semibold text-rust">
                {activeDebtsCount} active
              </span>
            </div>
            {debts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-moss/20 p-8 text-center text-sm text-ink-soft">
                No debt boulders tracked yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {debts.map((debt) => {
                  const paidOff = debt.currentAmount === 0;
                  const paidAmount = Math.max(0, debt.startingAmount - debt.currentAmount);
                  return (
                    <div
                      key={debt.id}
                      onClick={() => setHistoryModal({ type: "debt", debt })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setHistoryModal({ type: "debt", debt })
                      }
                      aria-label={`View payment history for ${debt.name}`}
                      className="group flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-moss/10 bg-card p-6 shadow-sm transition-all hover:border-moss/30 hover:shadow-md cursor-pointer"
                    >
                      {}
                      <div className="shrink-0 flex items-center justify-center self-center my-auto p-2 scale-125 -translate-y-5 transform-gpu [&>div>div.text-center]:hidden [&>div>form]:hidden">
                        <DebtBoulder
                          debt={debt}
                          currencyCode={currencyCode}
                          onPay={() => {}}
                          onEdit={() => {}}
                        />
                      </div>
                      {}
                      <div className="flex flex-1 flex-col justify-between self-stretch gap-4 min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rust">
                                Debt Reduction
                              </span>
                              <h3 className="flex items-center gap-1.5 text-base font-bold text-ink group-hover:text-rust transition-colors">
                                {debt.name}
                                {paidOff ? (
                                  <PartyPopper className="h-4 w-4 text-marigold" aria-hidden="true" />
                                ) : (
                                  <Scissors className="h-4 w-4 text-rust" aria-hidden="true" />
                                )}
                              </h3>
                            </div>
                            {}
                            <div
                              className="flex items-center gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setDebtModal({ mode: "edit", debt })}
                                className="rounded p-1 text-ink-soft hover:text-moss transition-colors"
                                aria-label={`Edit ${debt.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteDebt(debt)}
                                className="rounded p-1 text-ink-soft hover:text-rust transition-colors"
                                aria-label={`Delete ${debt.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1.5 font-data text-xs text-ink-soft">
                            <div className="flex justify-between">
                              <span>Remaining:</span>
                              <span className="font-semibold text-rust">
                                {formatCurrency(debt.currentAmount, currencyCode)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Starting:</span>
                              <span className="font-semibold text-ink">
                                {formatCurrency(debt.startingAmount, currencyCode)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-moss/10 pt-3">
                          {paidOff ? (
                            <span className="font-data text-xs font-semibold text-moss">
                              🌸 Debt Paid Off!
                            </span>
                          ) : (
                            <div className="space-y-2">
                              <p className="font-data text-[11px] text-ink-soft">
                                <strong className="text-moss">
                                  {formatCurrency(paidAmount, currencyCode)}
                                </strong>{" "}
                                paid down
                              </p>
                              {}
                              <form
                                onSubmit={(e) => handleDebtSubmit(e, debt.id)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="flex flex-col gap-1.5"
                              >
                                <div className="flex gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={debtAmounts[debt.id] || ""}
                                    onChange={(e) => {
                                      setDebtAmounts({ ...debtAmounts, [debt.id]: e.target.value });
                                      clearDebtError(debt.id);
                                    }}
                                    placeholder="Pay $"
                                    aria-invalid={Boolean(debtErrors[debt.id])}
                                    className="w-full min-w-0 rounded-lg border border-moss/20 bg-canvas px-2.5 py-1 font-data text-xs text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
                                  />
                                  <button
                                    type="submit"
                                    className="shrink-0 rounded-lg bg-moss px-3 py-1 text-xs font-semibold text-canvas transition-colors hover:bg-moss-light"
                                  >
                                    Pay
                                  </button>
                                </div>
                                <label className="flex items-center gap-1.5 text-[10px] text-ink-soft">
                                  <input
                                    type="checkbox"
                                    checked={debtFundFlags[debt.id] ?? false}
                                    onChange={(e) =>
                                      setDebtFundFlags((prev) => ({
                                        ...prev,
                                        [debt.id]: e.target.checked,
                                      }))
                                    }
                                    disabled={unallocated <= 0}
                                    className="h-3 w-3 accent-moss"
                                  />
                                  Fund from Unallocated ({formatCurrency(unallocated, currencyCode)} avail.)
                                </label>
                                {debtErrors[debt.id] && (
                                  <p className="text-[11px] text-rust">{debtErrors[debt.id]}</p>
                                )}
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
      {}
      {goalModal && (
        <GoalModal
          state={goalModal}
          onClose={() => setGoalModal(null)}
          onSubmit={(values) => {
            if (goalModal.mode === "edit") {
              updateGoal(goalModal.goal.id, values);
            } else {
              addGoal(values);
            }
            setGoalModal(null);
          }}
        />
      )}
      {debtModal && (
        <DebtModal
          state={debtModal}
          currencyCode={currencyCode}
          onClose={() => setDebtModal(null)}
          onSubmit={(values) => {
            if (debtModal.mode === "edit") {
              updateDebt(debtModal.debt.id, values);
            } else {
              addDebt(values);
            }
            setDebtModal(null);
          }}
        />
      )}
      {historyModal?.type === "goal" && (
        <HistoryModal
          title={`${historyModal.goal.name} — Contributions`}
          subtitle={`${formatCurrency(
            historyModal.goal.currentAmount,
            currencyCode
          )} saved of ${formatCurrency(historyModal.goal.targetAmount, currencyCode)}`}
          entries={historyModal.goal.history ?? []}
          currencyCode={currencyCode}
          accentClassName="text-moss"
          emptyLabel="No contributions logged yet."
          onClose={() => setHistoryModal(null)}
        />
      )}
      {historyModal?.type === "debt" && (
        <HistoryModal
          title={`${historyModal.debt.name} — Payments`}
          subtitle={`${formatCurrency(
            historyModal.debt.currentAmount,
            currencyCode
          )} remaining of ${formatCurrency(historyModal.debt.startingAmount, currencyCode)}`}
          entries={historyModal.debt.history ?? []}
          currencyCode={currencyCode}
          accentClassName="text-rust"
          emptyLabel="No payments logged yet."
          onClose={() => setHistoryModal(null)}
        />
      )}
      {confirmDeleteGoal && (
        <ConfirmDialog
          title="Delete goal?"
          description={`This removes ${confirmDeleteGoal.name} and its saved progress.`}
          onConfirm={() => {
            deleteGoal(confirmDeleteGoal.id);
            setConfirmDeleteGoal(null);
          }}
          onClose={() => setConfirmDeleteGoal(null)}
        />
      )}
      {confirmDeleteDebt && (
        <ConfirmDialog
          title="Delete debt?"
          description={`This removes ${confirmDeleteDebt.name} and its payment history.`}
          onConfirm={() => {
            deleteDebt(confirmDeleteDebt.id);
            setConfirmDeleteDebt(null);
          }}
          onClose={() => setConfirmDeleteDebt(null)}
        />
      )}
    </main>
  );
}