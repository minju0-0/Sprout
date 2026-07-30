import { Plus } from "lucide-react";
import type { Debt } from "@/types";
import { DebtBoulder } from "@/components/DebtBoulder";
interface DebtPileProps {
  debts: Debt[];
  currencyCode: string | null;
  onPay: (debtId: string, amount: number) => void;
  onAddDebt: () => void;
  onEditDebt: (debt: Debt) => void;
  onDeleteDebt: (debt: Debt) => void;
}
export function DebtPile({ debts, currencyCode, onPay, onAddDebt, onEditDebt, onDeleteDebt }: DebtPileProps) {
  return (
    <section className="rounded-3xl border border-moss/10 bg-card px-6 py-8 shadow-sm" aria-label="Debts">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Debts</h2>
        <button
          type="button"
          onClick={onAddDebt}
          className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-canvas px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Track a debt
        </button>
      </div>
      {debts.length === 0 ? (
        <p className="text-center text-sm text-ink-soft">No debts tracked yet.</p>
      ) : (
        <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-8">
          {debts.map((debt) => (
            <DebtBoulder
              key={debt.id}
              debt={debt}
              currencyCode={currencyCode}
              onPay={(amount) => onPay(debt.id, amount)}
              onEdit={() => onEditDebt(debt)}
              onDelete={() => onDeleteDebt(debt)}
            />
          ))}
        </div>
      )}
    </section>
  );
}