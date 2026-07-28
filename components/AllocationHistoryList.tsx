import { ArrowRight, PiggyBank } from "lucide-react";
import type { AllocationEvent, BudgetCategory } from "@/types";
import { formatCurrency } from "@/lib/currency";
interface AllocationHistoryListProps {
  events: AllocationEvent[];
  categories: BudgetCategory[];
  currencyCode: string | null;
  limit?: number;
}
function pocketLabel(pocket: string | null, categories: BudgetCategory[]): string {
  if (pocket === null) return "";
  if (pocket === "unallocated") return "Unallocated";
  return categories.find((category) => category.id === pocket)?.name ?? "a deleted category";
}
export function AllocationHistoryList({
  events,
  categories,
  currencyCode,
  limit = 5,
}: AllocationHistoryListProps) {
  const recent = events.slice(0, limit);
  if (recent.length === 0) return null;
  return (
    <div className="rounded-3xl border border-moss/15 bg-card p-5 shadow-sm">
      <h2 className="font-display text-base text-ink">Recent allocations</h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {recent.map((event) => (
          <li key={event.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-ink-soft">
              <PiggyBank className="h-3.5 w-3.5 shrink-0 text-moss" aria-hidden="true" />
              {event.type === "income" ? (
                <span className="truncate">
                  Income added{event.note ? ` — ${event.note}` : ""}
                </span>
              ) : (
                <span className="flex min-w-0 items-center gap-1 truncate">
                  {pocketLabel(event.from, categories)}
                  <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {pocketLabel(event.to, categories)}
                </span>
              )}
            </span>
            <span className="shrink-0 font-data text-ink">
              {formatCurrency(event.amount, currencyCode)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
