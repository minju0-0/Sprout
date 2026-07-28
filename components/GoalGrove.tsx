import { Plus } from "lucide-react";
import type { Goal } from "@/types";
import { GoalTree } from "@/components/GoalTree";
interface GoalGroveProps {
  goals: Goal[];
  currencyCode: string | null;
  onContribute: (goalId: string, amount: number) => void;
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
}
export function GoalGrove({ goals, currencyCode, onContribute, onAddGoal, onEditGoal }: GoalGroveProps) {
  if (goals.length === 0) {
    return (
      <section className="rounded-3xl border border-moss/15 bg-card px-6 py-12 text-center">
        <p className="font-display text-lg text-ink">No goals planted yet.</p>
        <p className="mt-1 text-sm text-ink-soft">Add a savings goal to grow its tree.</p>
        <button
          type="button"
          onClick={onAddGoal}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add goal
        </button>
      </section>
    );
  }
  return (
    <section className="rounded-3xl border border-moss/15 bg-card px-6 py-10 shadow-sm" aria-label="Goal trees">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Goal Trees</h2>
        <button
          type="button"
          onClick={onAddGoal}
          className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-canvas px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add goal
        </button>
      </div>
      <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-8">
        {goals.map((goal) => (
          <GoalTree
            key={goal.id}
            goal={goal}
            currencyCode={currencyCode}
            onContribute={(amount) => onContribute(goal.id, amount)}
            onEdit={() => onEditGoal(goal)}
          />
        ))}
      </div>
    </section>
  );
}
