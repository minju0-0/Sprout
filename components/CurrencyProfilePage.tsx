"use client";
import { useBudgetStore } from "@/store/budgetStore";
import { CurrencySelector } from "@/components/CurrencySelector";
export function CurrencyProfilePage() {
  const currencyCode = useBudgetStore((state) => state.currencyCode);
  const setCurrencyCode = useBudgetStore((state) => state.setCurrencyCode);
  return (
    <div className="flex flex-col gap-4 p-1">
      <div>
        <h2 className="font-display text-lg text-ink">Currency</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Every amount in Sprout — plants, the ledger, goal trees, and Advisor notes —
          formats using this currency.
        </p>
      </div>
      <CurrencySelector value={currencyCode ?? "USD"} onChange={setCurrencyCode} />
    </div>
  );
}
