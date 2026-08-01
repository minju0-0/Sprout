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
export function markAccountDataDeleted() {
  hasLoadedThisSession = false;
  if (pendingSaveTimeout) {
    clearTimeout(pendingSaveTimeout);
    pendingSaveTimeout = null;
  }
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
/** Best-effort flush of any pending debounced save. BUG FIX: without this,
 * a delete or edit made inside the SYNC_DEBOUNCE_MS window, immediately
 * followed by closing the tab, switching apps, or navigating away, was
 * silently lost — it looked "done" on screen and in localStorage, but the
 * PUT that would have written it to Supabase never got a chance to fire.
 * `keepalive: true` lets the request continue after the page starts
 * unloading (works for small payloads, which this is). */
function flushPendingSave() {
  if (!pendingSaveTimeout) return;
  clearTimeout(pendingSaveTimeout);
  pendingSaveTimeout = null;
  const state = selectGardenState(useBudgetStore.getState());
  fetch("/api/garden", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
    keepalive: true,
  }).catch(() => {
    // Best-effort only — nothing more we can do once the page is unloading.
  });
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
  // BUG FIX: this rollover check used to only run after the async Supabase
  // fetch below resolved. But the dashboard is already fully interactive as
  // soon as `hasHydrated` flips true (that's just local storage, no
  // network wait) — so there was a real window where `activeSeason` could
  // still be last month's label while the "Add transaction" button was
  // already clickable. Any transaction logged in that window compared its
  // date against the stale season, silently failed the "is this in the
  // current season" check in the store, and never got applied to that
  // category's `spent` — even though it showed up fine in the ledger.
  // Running the rollover check immediately here, independent of the
  // network round-trip, closes that window.
  useEffect(() => {
    if (!hasHydrated) return;
    checkSeasonRollover();
  }, [hasHydrated, checkSeasonRollover]);
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
        // Runs again here in case the state that just loaded (server copy,
        // or the local fallback saved above) was itself even more stale
        // than what the hydration-time check above already caught.
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
        pendingSaveTimeout = null;
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
  // BUG FIX: flush any pending debounced save when the tab is closed,
  // refreshed, or backgrounded. `beforeunload` covers closing/navigating;
  // `visibilitychange` also covers switching apps on mobile, where
  // `beforeunload` doesn't reliably fire at all.
  useEffect(() => {
    if (!isSignedIn) return;
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") flushPendingSave();
    }
    window.addEventListener("beforeunload", flushPendingSave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", flushPendingSave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSignedIn]);
}