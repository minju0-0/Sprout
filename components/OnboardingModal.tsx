"use client";
import { useState } from "react";
import { Sprout as SproutIcon } from "lucide-react";
import { CurrencySelector } from "@/components/CurrencySelector";
import { detectCurrencyCode } from "@/lib/currency";
interface OnboardingModalProps {
  onConfirm: (currencyCode: string) => void;
}
export function OnboardingModal({ onConfirm }: OnboardingModalProps) {
  const [currencyCode, setCurrencyCode] = useState<string>(() => detectCurrencyCode());
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-2">
          <SproutIcon className="h-5 w-5 text-moss" aria-hidden="true" />
          <h2 id="onboarding-modal-title" className="font-display text-lg text-ink">
            Welcome to Sprout
          </h2>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          We guessed your currency from your browser. Confirm it, or pick a different
          one — you can always change it later from your profile menu.
        </p>
        <CurrencySelector value={currencyCode} onChange={setCurrencyCode} />
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => onConfirm(currencyCode)}
            className="rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Start growing
          </button>
        </div>
      </div>
    </div>
  );
}
