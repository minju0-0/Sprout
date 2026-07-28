"use client";
import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Download, Trash2 } from "lucide-react";
import { useBudgetStore, selectGardenState } from "@/store/budgetStore";
import { getCurrentSeasonLabel } from "@/lib/seasonLogic";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { ConfirmDialog } from "@/components/ConfirmDialog";
export default function SettingsPage() {
  const loadGardenState = useBudgetStore((state) => state.loadGardenState);
  const syncStatus = useBudgetStore((state) => state.syncStatus);
  const syncError = useBudgetStore((state) => state.syncError);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const clerk = useClerk();
  function handleExport() {
    const state = useBudgetStore.getState();
    const payload = selectGardenState(state);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sprout-garden-${payload.activeSeason.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
  async function handleDeleteAccountData() {
    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error ?? "Couldn't delete your saved garden data right now.",
        );
      }
      await useBudgetStore.persist.clearStorage();
      loadGardenState({
        categories: [],
        transactions: [],
        goals: [],
        debts: [],
        activeSeason: getCurrentSeasonLabel(),
        harvestHistory: [],
        currencyCode: null,
        unallocated: 0,
        allocationHistory: [],
      });
      setConfirmDeleteAccount(false);
      clerk.openUserProfile();
    } catch (error) {
      setDeleteAccountError(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl text-ink">Settings</h1>
            <p className="text-sm text-ink-soft">
              Manage your data and account. Categories and budgets live on the{" "}
              <Link href="/budget" className="font-semibold text-moss hover:underline">
                Budget page
              </Link>
              ; currency lives in your account menu.
            </p>
            <SyncStatusIndicator status={syncStatus} error={syncError} />
          </div>
        </header>
        <section
          className="rounded-3xl border border-moss/15 bg-card p-6 shadow-sm"
          aria-label="Data export"
        >
          <h2 className="font-display text-lg text-ink">Your data</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Download everything Sprout has stored for you — categories, transactions, goals,
            debts, and harvest history — as a single JSON file.
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="mt-4 flex items-center gap-1.5 rounded-lg border border-moss/20 bg-canvas px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export data as JSON
          </button>
        </section>
        <section
          className="rounded-3xl border border-moss/15 bg-card p-6 shadow-sm"
          aria-label="Account"
        >
          <h2 className="font-display text-lg text-ink">Account</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Deleting your account data removes your saved garden from Sprout&apos;s server
            entirely — categories, transactions, goals, debts, and harvest history. Your sign-in
            account itself is managed separately by Clerk; after your data is deleted, we&apos;ll
            open your account settings so you can close that too, if you want to.
          </p>
          {deleteAccountError && (
            <p className="mt-3 rounded-lg bg-rust/10 px-3 py-2 text-sm text-rust">
              {deleteAccountError}
            </p>
          )}
          <button
            type="button"
            onClick={() => setConfirmDeleteAccount(true)}
            className="mt-4 flex items-center gap-1.5 rounded-lg border border-rust/20 bg-canvas px-3 py-1.5 text-sm font-semibold text-rust transition-colors hover:bg-rust/10 active:bg-rust/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete account data
          </button>
        </section>
      </main>
      {confirmDeleteAccount && (
        <ConfirmDialog
          title="Delete account data?"
          description="This can't be undone. Your saved garden — categories, transactions, goals, debts, and harvest history — will be deleted from Sprout's server."
          confirmLabel={isDeletingAccount ? "Deleting…" : "Yes, delete it"}
          isConfirming={isDeletingAccount}
          onConfirm={handleDeleteAccountData}
          onClose={() => setConfirmDeleteAccount(false)}
        />
      )}
    </div>
  );
}