import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type {
  AdvisorAnswer,
  AdvisorNote,
  AllocationEvent,
  BudgetCategory,
  Debt,
  GardenState,
  Goal,
  HarvestRecord,
  MoneyPocket,
  SyncStatus,
  Transaction,
} from "@/types";
import { seedCategories } from "@/data/seedCategories";
import { seedTransactions } from "@/data/seedTransactions";
import { seedGoals } from "@/data/seedGoals";
import { addIncomeEvent, moveMoney } from "@/lib/allocation";
import {
  carryForwardRecurringTransactions,
  catchUpSeason,
  createHarvestRecord,
  getCurrentSeasonLabel,
  getNextSeasonLabel,
  resetCategoriesForNewSeason,
} from "@/lib/seasonLogic";
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
interface BudgetStore {
  categories: BudgetCategory[];
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  activeSeason: string;
  harvestHistory: HarvestRecord[];
  currencyCode: string | null;
  unallocated: number;
  allocationHistory: AllocationEvent[];
  advisorNotes: AdvisorNote[];
  isAdvisorLoading: boolean;
  advisorError: string | null;
  advisorSource: "live" | "fallback" | null;
  askAnswer: AdvisorAnswer | null;
  isAdvisorAsking: boolean;
  advisorAskError: string | null;
  advisorAskSource: "live" | "fallback" | null;
  hasHydrated: boolean;
  hasSeenWalkthrough: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  importTransactions: (transactions: Omit<Transaction, "id">[]) => void;
  updateTransaction: (id: string, updates: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addContribution: (goalId: string, amount: number) => void;
  addGoal: (goal: Omit<Goal, "id" | "currentAmount">) => void;
  updateGoal: (id: string, updates: Omit<Goal, "id" | "currentAmount">) => void;
  addDebt: (debt: Omit<Debt, "id" | "currentAmount">) => void;
  updateDebt: (id: string, updates: Omit<Debt, "id" | "currentAmount">) => void;
  addDebtPayment: (debtId: string, amount: number) => void;
  addCategory: (category: Omit<BudgetCategory, "id" | "spent">) => void;
  updateCategory: (id: string, updates: Omit<BudgetCategory, "id" | "spent">) => void;
  deleteCategory: (id: string) => void;
  addIncome: (amount: number, note?: string) => void;
  moveMoney: (from: MoneyPocket, to: MoneyPocket, amount: number) => void;
  setCurrencyCode: (currencyCode: string) => void;
  startNewSeason: () => void;
  checkSeasonRollover: () => void;
  fetchAdvisorNotes: () => Promise<void>;
  askAdvisor: (question: string) => Promise<void>;
  setHasHydrated: (hasHydrated: boolean) => void;
  loadGardenState: (state: GardenState) => void;
  setSyncStatus: (status: SyncStatus, error?: string | null) => void;
  completeWalkthrough: () => void;
}
export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      categories: seedCategories,
      transactions: seedTransactions,
      goals: seedGoals,
      debts: [],
      activeSeason: getCurrentSeasonLabel(),
      harvestHistory: [],
      currencyCode: null,
      unallocated: 0,
      allocationHistory: [],
      advisorNotes: [],
      isAdvisorLoading: false,
      advisorError: null,
      advisorSource: null,
      askAnswer: null,
      isAdvisorAsking: false,
      advisorAskError: null,
      advisorAskSource: null,
      hasHydrated: false,
      hasSeenWalkthrough: false,
      syncStatus: "idle",
      syncError: null,
      addTransaction: (transaction) =>
        set((state) => {
          const newTransaction: Transaction = {
            ...transaction,
            id: crypto.randomUUID(),
          };
          return {
            transactions: [newTransaction, ...state.transactions],
            categories: state.categories.map((category) =>
              category.id === transaction.categoryId
                ? { ...category, spent: category.spent + transaction.amount }
                : category,
            ),
          };
        }),
      importTransactions: (transactions) =>
        set((state) => {
          if (transactions.length === 0) return state;
          const newTransactions: Transaction[] = transactions.map((transaction) => ({
            ...transaction,
            id: crypto.randomUUID(),
          }));
          const spentByCategory = new Map<string, number>();
          for (const transaction of transactions) {
            spentByCategory.set(
              transaction.categoryId,
              (spentByCategory.get(transaction.categoryId) ?? 0) + transaction.amount,
            );
          }
          return {
            transactions: [...newTransactions, ...state.transactions],
            categories: state.categories.map((category) => {
              const added = spentByCategory.get(category.id);
              return added ? { ...category, spent: category.spent + added } : category;
            }),
          };
        }),
      updateTransaction: (id, updates) =>
        set((state) => {
          const existing = state.transactions.find((transaction) => transaction.id === id);
          if (!existing) return state;
          const updated: Transaction = { ...updates, id };
          return {
            transactions: state.transactions.map((transaction) =>
              transaction.id === id ? updated : transaction,
            ),
            categories: state.categories.map((category) => {
              const wasSource = category.id === existing.categoryId;
              const isDestination = category.id === updates.categoryId;
              if (wasSource && isDestination) {
                return { ...category, spent: category.spent - existing.amount + updates.amount };
              }
              if (wasSource) {
                return { ...category, spent: category.spent - existing.amount };
              }
              if (isDestination) {
                return { ...category, spent: category.spent + updates.amount };
              }
              return category;
            }),
          };
        }),
      deleteTransaction: (id) =>
        set((state) => {
          const existing = state.transactions.find((transaction) => transaction.id === id);
          if (!existing) return state;
          return {
            transactions: state.transactions.filter((transaction) => transaction.id !== id),
            categories: state.categories.map((category) =>
              category.id === existing.categoryId
                ? { ...category, spent: category.spent - existing.amount }
                : category,
            ),
          };
        }),
      addContribution: (goalId, amount) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? { ...goal, currentAmount: goal.currentAmount + amount }
              : goal,
          ),
        })),
      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, { ...goal, id: crypto.randomUUID(), currentAmount: 0 }],
        })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)),
        })),
      addDebt: (debt) =>
        set((state) => ({
          debts: [
            ...state.debts,
            { ...debt, id: crypto.randomUUID(), currentAmount: debt.startingAmount },
          ],
        })),
      updateDebt: (id, updates) =>
        set((state) => ({
          debts: state.debts.map((debt) => (debt.id === id ? { ...debt, ...updates } : debt)),
        })),
      addDebtPayment: (debtId, amount) =>
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === debtId
              ? { ...debt, currentAmount: Math.max(debt.currentAmount - amount, 0) }
              : debt,
          ),
        })),
      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: crypto.randomUUID(), spent: 0 },
          ],
        })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updates } : category,
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          transactions: state.transactions.filter((transaction) => transaction.categoryId !== id),
        })),
      addIncome: (amount, note) =>
        set((state) => {
          const event = addIncomeEvent(amount, undefined, undefined, note);
          return {
            unallocated: state.unallocated + amount,
            allocationHistory: [event, ...state.allocationHistory],
          };
        }),
      moveMoney: (from, to, amount) =>
        set((state) => {
          const result = moveMoney({
            categories: state.categories,
            unallocated: state.unallocated,
            from,
            to,
            amount,
          });
          return {
            categories: result.categories,
            unallocated: result.unallocated,
            allocationHistory: [result.event, ...state.allocationHistory],
          };
        }),
      setCurrencyCode: (currencyCode) => set({ currencyCode }),
      startNewSeason: () =>
        set((state) => {
          const nextSeason = getNextSeasonLabel(state.activeSeason);
          const resetCategories = resetCategoriesForNewSeason(state.categories);
          const carried = carryForwardRecurringTransactions(
            state.transactions,
            resetCategories,
            nextSeason,
          );
          return {
            harvestHistory: [
              createHarvestRecord(state.activeSeason, state.categories),
              ...state.harvestHistory,
            ],
            categories: carried.categories,
            transactions: carried.transactions,
            activeSeason: nextSeason,
          };
        }),
      checkSeasonRollover: () => {
        const state = get();
        const result = catchUpSeason(state.activeSeason, state.categories, state.harvestHistory);
        if (!result.rolledOver) return;
        const carried = carryForwardRecurringTransactions(
          state.transactions,
          result.categories,
          result.activeSeason,
        );
        set({
          activeSeason: result.activeSeason,
          categories: carried.categories,
          harvestHistory: result.harvestHistory,
          transactions: carried.transactions,
        });
      },
      fetchAdvisorNotes: async () => {
        set({ isAdvisorLoading: true, advisorError: null });
        try {
          const { categories, transactions, goals, currencyCode } = get();
          const response = await fetch("/api/advisor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categories, transactions, goals, currencyCode }),
          });
          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(
              errorBody?.error ?? "The Garden Advisor couldn't reach the greenhouse right now.",
            );
          }
          const data = await response.json();
          set({
            advisorNotes: data.notes ?? [],
            advisorSource: data.source ?? null,
            isAdvisorLoading: false,
          });
        } catch (error) {
          set({
            advisorError:
              error instanceof Error ? error.message : "Something went wrong. Please try again.",
            isAdvisorLoading: false,
          });
        }
      },
      askAdvisor: async (question) => {
        const trimmed = question.trim();
        if (!trimmed) return;
        set({ isAdvisorAsking: true, advisorAskError: null });
        try {
          const { categories, transactions, goals, currencyCode } = get();
          const response = await fetch("/api/advisor/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              categories,
              transactions,
              goals,
              currencyCode,
              question: trimmed,
            }),
          });
          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(
              errorBody?.error ?? "The Garden Advisor couldn't answer that right now.",
            );
          }
          const data = await response.json();
          set({
            askAnswer: data.answer ?? null,
            advisorAskSource: data.source ?? null,
            isAdvisorAsking: false,
          });
        } catch (error) {
          set({
            advisorAskError:
              error instanceof Error ? error.message : "Something went wrong. Please try again.",
            isAdvisorAsking: false,
          });
        }
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      loadGardenState: (state) =>
        set({
          categories: state.categories,
          transactions: state.transactions,
          goals: state.goals,
          debts: state.debts,
          activeSeason: state.activeSeason,
          harvestHistory: state.harvestHistory,
          currencyCode: state.currencyCode,
          unallocated: state.unallocated,
          allocationHistory: state.allocationHistory,
        }),
      setSyncStatus: (status, error = null) => set({ syncStatus: status, syncError: error }),
      completeWalkthrough: () => set({ hasSeenWalkthrough: true }),
    }),
    {
      name: "sprout-garden-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage,
      ),
      version: 1,
      partialize: (state) => ({
        categories: state.categories,
        transactions: state.transactions,
        goals: state.goals,
        debts: state.debts,
        activeSeason: state.activeSeason,
        harvestHistory: state.harvestHistory,
        currencyCode: state.currencyCode,
        unallocated: state.unallocated,
        allocationHistory: state.allocationHistory,
        hasSeenWalkthrough: state.hasSeenWalkthrough,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
export function selectGardenState(state: BudgetStore): GardenState {
  return {
    categories: state.categories,
    transactions: state.transactions,
    goals: state.goals,
    debts: state.debts,
    activeSeason: state.activeSeason,
    harvestHistory: state.harvestHistory,
    currencyCode: state.currencyCode,
    unallocated: state.unallocated,
    allocationHistory: state.allocationHistory,
  };
}