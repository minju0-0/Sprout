"use client";
import { useState } from "react";
import { useBudgetStore } from "@/store/budgetStore";
import { GoalGrove } from "@/components/GoalGrove";
import { GoalModal, type GoalModalState } from "@/components/GoalModal";
import { DebtPile } from "@/components/DebtPile";
import { DebtModal, type DebtModalState } from "@/components/DebtModal";
import { CardSkeleton } from "@/components/Skeleton";
export default function GoalsPage() {
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const goals = useBudgetStore((state) => state.goals);
  const debts = useBudgetStore((state) => state.debts);
  const currencyCode = useBudgetStore((state) => state.currencyCode);
  const addContribution = useBudgetStore((state) => state.addContribution);
  const addGoal = useBudgetStore((state) => state.addGoal);
  const updateGoal = useBudgetStore((state) => state.updateGoal);
  const addDebt = useBudgetStore((state) => state.addDebt);
  const updateDebt = useBudgetStore((state) => state.updateDebt);
  const addDebtPayment = useBudgetStore((state) => state.addDebtPayment);
  const [goalModal, setGoalModal] = useState<GoalModalState | null>(null);
  const [debtModal, setDebtModal] = useState<DebtModalState | null>(null);
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12 sm:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl text-ink">Goals</h1>
        <p className="text-sm text-ink-soft">
          Every savings goal grows its own tree toward its target — every debt shrinks toward
          zero.
        </p>
      </header>
      {!hasHydrated ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-busy="true"
          aria-label="Loading your goals"
        >
          <CardSkeleton bodyHeight="h-48" />
          <CardSkeleton bodyHeight="h-48" />
        </div>
      ) : (
        <>
          <GoalGrove
            goals={goals}
            currencyCode={currencyCode}
            onContribute={addContribution}
            onAddGoal={() => setGoalModal({ mode: "add" })}
            onEditGoal={(goal) => setGoalModal({ mode: "edit", goal })}
          />
          <DebtPile
            debts={debts}
            currencyCode={currencyCode}
            onPay={addDebtPayment}
            onAddDebt={() => setDebtModal({ mode: "add" })}
            onEditDebt={(debt) => setDebtModal({ mode: "edit", debt })}
          />
        </>
      )}
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
    </main>
  );
}