"use client";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pencil, Sparkles } from "lucide-react";
import type { Goal } from "@/types";
import {
  getBranchCount,
  getCanopyRadius,
  getGoalProgress,
  getTrunkHeight,
  isGoalComplete,
} from "@/lib/goalLogic";
import { formatCurrency } from "@/lib/currency";
interface GoalTreeProps {
  goal: Goal;
  currencyCode: string | null;
  onContribute: (amount: number) => void;
  onEdit: () => void;
}
const GROUND_Y = 148;
const BRANCH_OFFSETS = [
  { dy: 26, dx: 18, side: -1 },
  { dy: 26, dx: 18, side: 1 },
  { dy: 44, dx: 14, side: -1 },
] as const;
export function GoalTree({ goal, currencyCode, onContribute, onEdit }: GoalTreeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [amount, setAmount] = useState("");
  const progress = getGoalProgress(goal);
  const trunkHeight = getTrunkHeight(progress);
  const canopyRadius = getCanopyRadius(progress);
  const branchCount = getBranchCount(progress);
  const complete = isGoalComplete(goal);
  const topY = GROUND_Y - trunkHeight;
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: "easeOut" as const };
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onContribute(parsed);
    setAmount("");
  }
  return (
    <div className="flex w-36 flex-col items-center gap-2">
      <svg
        viewBox="0 0 100 160"
        className="h-40 w-28"
        role="img"
        aria-label={`${goal.name}: ${formatCurrency(
          goal.currentAmount,
          currencyCode,
        )} of ${formatCurrency(goal.targetAmount, currencyCode)} saved${
          complete ? ", goal complete" : ""
        }`}
      >
        <ellipse cx="50" cy={GROUND_Y} rx="26" ry="7" fill="#5b4636" />
        <motion.line
          x1="50" y1={GROUND_Y} x2="50"
          strokeWidth="5" strokeLinecap="round" stroke="#6b4a35"
          animate={{ y2: topY }} transition={transition}
        />
        {BRANCH_OFFSETS.map((branch, index) => (
          <motion.line
            key={index}
            x1="50" y1={GROUND_Y - trunkHeight * 0.4}
            x2={50 + branch.side * branch.dx}
            y2={GROUND_Y - trunkHeight * 0.4 - branch.dy}
            stroke="#6b4a35" strokeWidth="3" strokeLinecap="round"
            animate={{ opacity: index < branchCount ? 1 : 0 }}
            transition={transition}
          />
        ))}
        <motion.circle
          cx="50" fill={complete ? "#e8a33d" : "#4b7f52"}
          animate={{ cy: topY, r: canopyRadius }} transition={transition}
        />
        {complete && (
          <motion.g
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }} transition={transition}
            style={{ transformOrigin: `50px ${topY}px` }}
          >
            <circle cx="50" cy={topY} r="4" fill="#f4c766" />
          </motion.g>
        )}
      </svg>
      <div className="text-center">
        <p className="flex items-center justify-center gap-1 text-sm font-semibold text-ink">
          {goal.name}
          {complete && <Sparkles className="h-3.5 w-3.5 text-marigold" aria-hidden="true" />}
        </p>
        <p className="font-data text-xs text-ink-soft">
          {formatCurrency(goal.currentAmount, currencyCode)} /{" "}
          {formatCurrency(goal.targetAmount, currencyCode)}
        </p>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${goal.name}`}
          className="mt-1 inline-flex items-center gap-1 rounded text-[11px] text-ink-soft transition-colors hover:text-moss active:text-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Edit
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full gap-1">
        <input
          type="number" min="0" step="0.01" value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Add $" aria-label={`Add a contribution to ${goal.name}`}
          className="w-full min-w-0 rounded-lg border border-moss/20 bg-canvas px-2 py-1 font-data text-xs text-ink"
        />
        <button type="submit" className="shrink-0 rounded-lg bg-moss px-2 py-1 text-xs font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss">
          Add
        </button>
      </form>
    </div>
  );
}
