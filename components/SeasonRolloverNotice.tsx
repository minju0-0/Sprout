"use client";
import Link from "next/link";
import { Sprout as SproutIcon } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
export function SeasonRolloverNotice() {
  const notice = useBudgetStore((state) => state.seasonRolloverNotice);
  const dismiss = useBudgetStore((state) => state.dismissSeasonRolloverNotice);
  if (!notice) return null;
  const { harvestedSeasons, newSeason } = notice;
  const isMultiple = harvestedSeasons.length > 1;
  // harvestedSeasons is newest-first (see checkSeasonRollover), so the
  // oldest skipped month reads first in a "June through August" range.
  const harvestedLabel = isMultiple
    ? `${harvestedSeasons[harvestedSeasons.length - 1]} through ${harvestedSeasons[0]}`
    : harvestedSeasons[0];
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="season-rollover-title"
      aria-describedby="season-rollover-description"
      onClick={dismiss}
    >
      <div className="modal-panel elevation-modal" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss/10 text-moss">
            <SproutIcon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <h2 id="season-rollover-title" className="font-display text-lg text-ink">
            {newSeason} has begun
          </h2>
        </div>
        <p id="season-rollover-description" className="text-sm text-ink-soft">
          {isMultiple
            ? `${harvestedLabel} were automatically harvested`
            : `${harvestedLabel} was automatically harvested`}{" "}
          while you were away, and your garden has reset fresh for {newSeason}. Any recurring
          transactions were carried forward automatically.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={dismiss} className="btn btn-ghost">
            Got it
          </button>
          <Link href="/reports" onClick={dismiss} className="btn btn-primary">
            View harvest summary
          </Link>
        </div>
      </div>
    </div>
  );
}