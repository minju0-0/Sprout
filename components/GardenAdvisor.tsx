"use client";
import { useState, type FormEvent } from "react";
import { Leaf, RefreshCw, Send } from "lucide-react";
import type { AdvisorAnswer, AdvisorNote as AdvisorNoteData } from "@/types";
import { AdvisorNote } from "@/components/AdvisorNote";
import { cn } from "@/lib/cn";
interface GardenAdvisorProps {
  notes: AdvisorNoteData[];
  isLoading: boolean;
  error: string | null;
  source: "live" | "fallback" | null;
  onRefresh: () => void;
  askAnswer: AdvisorAnswer | null;
  isAsking: boolean;
  askError: string | null;
  askSource: "live" | "fallback" | null;
  onAsk: (question: string) => void;
}
const SUGGESTED_QUESTIONS = [
  "Which category is closest to its limit?",
  "How is this season trending overall?",
  "Which goal needs the most attention?",
];
export function GardenAdvisor({
  notes,
  isLoading,
  error,
  source,
  onRefresh,
  askAnswer,
  isAsking,
  askError,
  askSource,
  onAsk,
}: GardenAdvisorProps) {
  const [question, setQuestion] = useState("");
  function handleAsk(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isAsking) return;
    onAsk(trimmed);
  }
  function handleSuggestedQuestion(suggested: string) {
    if (isAsking) return;
    setQuestion(suggested);
    onAsk(suggested);
  }
  return (
    <section
      className="rounded-3xl border border-moss/15 bg-card px-6 py-8 shadow-sm"
      aria-label="Garden advisor"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-moss" aria-hidden="true" />
          <h2 className="font-display text-lg text-ink">Garden Advisor</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-canvas px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
            aria-hidden="true"
          />
          {isLoading ? "Reading the garden…" : "Ask the Advisor"}
        </button>
      </div>
      {error && (
        <p className="mb-4 rounded-xl bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>
      )}
      {!error && notes.length > 0 && source === "fallback" && (
        <p className="mb-4 text-xs text-ink-soft">
          Showing observations computed directly from this season&apos;s numbers — the live Advisor
          is temporarily unavailable.
        </p>
      )}
      {notes.length === 0 && !isLoading && !error ? (
        <p className="text-sm text-ink-soft">
          Ask the Advisor for a few short notes on how this season is growing.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {notes.map((note) => (
            <AdvisorNote key={note.id} note={note} />
          ))}
        </ul>
      )}
      <div className="mt-6 border-t border-moss/10 pt-5">
        {question.trim().length === 0 && !isAsking && (
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
            {SUGGESTED_QUESTIONS.map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => handleSuggestedQuestion(suggested)}
                className="rounded-full border border-moss/20 bg-canvas px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-moss/40 hover:text-moss active:bg-moss/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
              >
                {suggested}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleAsk} className="flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something specific, e.g. “Is Groceries on track?”"
            maxLength={300}
            disabled={isAsking}
            className="flex-1 rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-moss/40 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isAsking || question.trim().length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className={cn("h-3.5 w-3.5", isAsking && "animate-pulse")} aria-hidden="true" />
            {isAsking ? "Asking…" : "Ask"}
          </button>
        </form>
        {askError && (
          <p className="mt-3 rounded-xl bg-rust/10 px-3 py-2 text-sm text-rust">{askError}</p>
        )}
        {!askError && askAnswer && (
          <div className="mt-3">
            {askSource === "fallback" && (
              <p className="mb-2 text-xs text-ink-soft">
                Showing an answer computed directly from this season&apos;s numbers — the live Advisor
                is temporarily unavailable.
              </p>
            )}
            <ul>
              <AdvisorNote note={{ id: "ask-answer", ...askAnswer }} />
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
