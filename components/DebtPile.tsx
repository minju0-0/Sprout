import { Plus } from "lucide-react";
import type { Debt } from "@/types";
import { DebtBoulder } from "@/components/DebtBoulder";
interface DebtPileProps {
  debts: Debt[];
  currencyCode: string | null;
  onPay: (debtId: string, amount: number) => void;
  onAddDebt: () => void;
  onEditDebt: (debt: Debt) => void;
}
export function DebtPile({ debts, currencyCode, onPay, onAddDebt, onEditDebt }: DebtPileProps) {
  if (debts.length === 0) {
    return (
      <section className="rounded-3xl border border-moss/15 bg-card px-6 py-12 text-center">
        <p className="font-display text-lg text-ink">No debts tracked yet.</p>
        <p className="mt-1 text-sm text-ink-soft">
          Track a debt to watch it shrink toward zero as you pay it down.
        </p>
        <button
          type="button"
          onClick={onAddDebt}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Track a debt
        </button>
      </section>
    );
  }
  return (
    <section className="rounded-3xl border border-moss/15 bg-card px-6 py-10 shadow-sm" aria-label="Debts">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Debts</h2>
        <button
          type="button"
          onClick={onAddDebt}
          className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-canvas px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Track a debt
        </button>
      </div>
      <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-8">
        {debts.map((debt) => (
          <DebtBoulder
            key={debt.id}
            debt={debt}
            currencyCode={currencyCode}
            onPay={(amount) => onPay(debt.id, amount)}
            onEdit={() => onEditDebt(debt)}
          />
        ))}
      </div>
    </section>
  );
}