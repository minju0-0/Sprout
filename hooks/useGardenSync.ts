"use client";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useBudgetStore, selectGardenState } from "@/store/budgetStore";
import type { GardenState } from "@/types";
import { reportError } from "@/lib/errorReporting";
const SYNC_DEBOUNCE_MS = 1500;
let hasLoadedThisSession = false;
let pendingSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let savedResetTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVED_DISPLAY_MS = 2000;
function markSaved(setSyncStatus: (status: "saved", error?: null) => void) {
  setSyncStatus("saved");
  if (savedResetTimeout) clearTimeout(savedResetTimeout);
  savedResetTimeout = setTimeout(() => {
    useBudgetStore.getState().setSyncStatus("idle");
  }, SAVED_DISPLAY_MS);
}
async function fetchGardenState(): Promise<GardenState | null> {
  const response = await fetch("/api/garden");
  if (!response.ok) throw new Error("Failed to load garden state");
  const data = await response.json();
  return data.state ?? null;
}
async function saveGardenState(state: GardenState): Promise<void> {
  const response = await fetch("/api/garden", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error("Failed to save garden state");
}
export function useGardenSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const loadGardenState = useBudgetStore((state) => state.loadGardenState);
  const setSyncStatus = useBudgetStore((state) => state.setSyncStatus);
  const checkSeasonRollover = useBudgetStore((state) => state.checkSeasonRollover);
  useEffect(() => {
    if (!isSignedIn) hasLoadedThisSession = false;
  }, [isSignedIn]);
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !hasHydrated || hasLoadedThisSession) return;
    hasLoadedThisSession = true;
    (async () => {
      setSyncStatus("saving");
      try {
        const serverState = await fetchGardenState();
        if (serverState) {
          loadGardenState(serverState);
        } else {
          await saveGardenState(selectGardenState(useBudgetStore.getState()));
        }
        markSaved(setSyncStatus);
      } catch (error) {
        reportError("Garden sync (initial load) failed", error);
        hasLoadedThisSession = false;
        setSyncStatus(
          "error",
          "Couldn't reach the garden's saved data — working from your local copy.",
        );
      } finally {
        checkSeasonRollover();
      }
    })();
  }, [isLoaded, isSignedIn, hasHydrated, loadGardenState, setSyncStatus, checkSeasonRollover]);
  useEffect(() => {
    if (!isSignedIn) return;
    const unsubscribe = useBudgetStore.subscribe((state, prevState) => {
      if (!hasLoadedThisSession) return;
      const changed =
        state.categories !== prevState.categories ||
        state.transactions !== prevState.transactions ||
        state.goals !== prevState.goals ||
        state.debts !== prevState.debts ||
        state.activeSeason !== prevState.activeSeason ||
        state.harvestHistory !== prevState.harvestHistory ||
        state.currencyCode !== prevState.currencyCode ||
        state.unallocated !== prevState.unallocated ||
        state.allocationHistory !== prevState.allocationHistory;
      if (!changed) return;
      if (pendingSaveTimeout) clearTimeout(pendingSaveTimeout);
      pendingSaveTimeout = setTimeout(() => {
        setSyncStatus("saving");
        saveGardenState(selectGardenState(useBudgetStore.getState()))
          .then(() => markSaved(setSyncStatus))
          .catch((error) => {
            reportError("Garden sync (save) failed", error);
            setSyncStatus(
              "error",
              "Couldn't save your latest change — it's kept locally and will sync once the connection recovers.",
            );
          });
      }, SYNC_DEBOUNCE_MS);
    });
    return () => {
      unsubscribe();
    };
  }, [isSignedIn, setSyncStatus]);
}