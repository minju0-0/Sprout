"use client";
import { useState } from "react";
import { Sprout as SproutIcon, ListChecks, Sparkles, X } from "lucide-react";
interface WalkthroughStep {
  icon: typeof SproutIcon;
  title: string;
  body: string;
}
const STEPS: WalkthroughStep[] = [
  {
    icon: SproutIcon,
    title: "This is your garden",
    body: "Every budget category grows here as a plant — the more you stay under budget, the more it thrives.",
  },
  {
    icon: ListChecks,
    title: "This is your ledger",
    body: "Log a transaction here and watch the matching plant react right away. The numbers and the garden never drift apart.",
  },
  {
    icon: Sparkles,
    title: "Ask your Advisor anything",
    body: "Type a question about your spending below the garden — a few short, honest notes, never a wall of text.",
  },
];
interface WalkthroughProps {
  onComplete: () => void;
}
export function Walkthrough({ onComplete }: WalkthroughProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const Icon = step.icon;
  const isLastStep = stepIndex === STEPS.length - 1;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="walkthrough-title"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-sm flex-col gap-3 rounded-3xl border border-moss/15 bg-card p-5 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-moss" aria-hidden="true" />
          <h2 id="walkthrough-title" className="font-display text-base text-ink">
            {step.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onComplete}
          aria-label="Skip walkthrough"
          className="rounded text-ink-soft transition-colors hover:text-ink active:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="text-sm text-ink-soft">{step.body}</p>
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((walkthroughStep, index) => (
            <span
              key={walkthroughStep.title}
              className={`h-1.5 w-1.5 rounded-full ${
                index === stepIndex ? "bg-moss" : "bg-moss/20"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onComplete}
            className="rounded text-sm text-ink-soft transition-colors hover:text-ink active:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => (isLastStep ? onComplete() : setStepIndex((index) => index + 1))}
            className="rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            {isLastStep ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
