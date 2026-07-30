import { Plus } from "lucide-react";
import type { Goal } from "@/types";
import { GoalTree } from "@/components/GoalTree";
interface GoalGroveProps {
  goals: Goal[];
  currencyCode: string | null;
  onContribute: (goalId: string, amount: number) => void;
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
}
export function GoalGrove({ goals, currencyCode, onContribute, onAddGoal, onEditGoal, onDeleteGoal }: GoalGroveProps) {
  return (
    <section className="rounded-3xl border border-moss/10 bg-card px-6 py-8 shadow-sm" aria-label="Goal trees">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Goal Trees</h2>
        <button
          type="button"
          onClick={onAddGoal}
          className="flex items-center gap-1.5 rounded-lg border border-moss/20 bg-canvas px-3 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add goal
        </button>
      </div>
      {goals.length === 0 ? (
        <p className="text-center text-sm text-ink-soft">No goals planted yet.</p>
      ) : (
        <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-8">
          {goals.map((goal) => (
            <GoalTree
              key={goal.id}
              goal={goal}
              currencyCode={currencyCode}
              onContribute={(amount) => onContribute(goal.id, amount)}
              onEdit={() => onEditGoal(goal)}
              onDelete={() => onDeleteGoal(goal)}
            />
          ))}
        </div>
      )}
    </section>
  );
}