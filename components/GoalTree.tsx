"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pencil, Sparkles, Trash2 } from "lucide-react";

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
  onDelete?: () => void;
}

const GROUND_Y = 148;
const BRANCH_OFFSETS = [
  { dy: 26, dx: 18, side: -1 },
  { dy: 26, dx: 18, side: 1 },
  { dy: 44, dx: 14, side: -1 },
] as const;

export function GoalTree({ goal, currencyCode, onContribute, onEdit, onDelete }: GoalTreeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [amount, setAmount] = useState("");

  const progress = getGoalProgress(goal);
  const trunkHeight = getTrunkHeight(progress);
  const canopyRadius = getCanopyRadius(progress);
  const branchCount = getBranchCount(progress);
  const complete = isGoalComplete(goal);

  const topY = GROUND_Y - trunkHeight;
  const canopyColor = complete ? "#e8a33d" : progress > 0.5 ? "#3f6b3a" : "#5a9a52";

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
        className="h-40 w-28 overflow-visible"
        role="img"
        aria-label={`${goal.name}: ${formatCurrency(goal.currentAmount, currencyCode)} of ${formatCurrency(
          goal.targetAmount,
          currencyCode,
        )} saved${complete ? ", goal complete" : ""}`}
      >
        {/* Soft ground shadows */}
        <ellipse cx="50" cy={GROUND_Y} rx="30" ry="7" fill="#7a6050" opacity="0.5" />
        <ellipse cx="50" cy={GROUND_Y + 3} rx="24" ry="4.5" fill="#5b4636" opacity="0.4" />

        {/* Organic curved tree trunk */}
        <motion.path
          d={`M50 ${GROUND_Y} C48 ${GROUND_Y - trunkHeight * 0.4} 52 ${GROUND_Y - trunkHeight * 0.7} 50 ${GROUND_Y - trunkHeight}`}
          stroke="#7a5020"
          fill="none"
          strokeLinecap="round"
          animate={{ strokeWidth: progress < 0.2 ? 3 : progress < 0.5 ? 4.5 : 6 }}
          transition={transition}
        />

        {/* Dynamic branches */}
        {BRANCH_OFFSETS.map((branch, index) => (
          <motion.line
            key={index}
            x1="50"
            y1={GROUND_Y - trunkHeight * 0.4}
            x2={50 + branch.side * branch.dx}
            y2={GROUND_Y - trunkHeight * 0.4 - branch.dy}
            stroke="#7a5020"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ opacity: index < branchCount ? 1 : 0 }}
            transition={transition}
          />
        ))}

        {/* Layered canopy foliage */}
        {progress > 0 && (
          <motion.g animate={{ y: topY - GROUND_Y + trunkHeight }} transition={transition}>
            <motion.circle
              cx="50"
              animate={{ cy: topY + canopyRadius * 0.3, r: canopyRadius * 0.85, fill: canopyColor }}
              transition={transition}
              opacity="0.6"
            />
            <motion.circle
              cx="50"
              animate={{ cy: topY, r: canopyRadius, fill: canopyColor }}
              transition={transition}
              opacity="0.85"
            />
            <motion.circle
              animate={{
                cx: 50 - canopyRadius * 0.35,
                cy: topY + canopyRadius * 0.1,
                r: canopyRadius * 0.72,
                fill: canopyColor,
              }}
              transition={transition}
              opacity="0.55"
            />
            <motion.circle
              animate={{
                cx: 50 + canopyRadius * 0.35,
                cy: topY + canopyRadius * 0.15,
                r: canopyRadius * 0.68,
                fill: canopyColor,
              }}
              transition={transition}
              opacity="0.55"
            />
            {/* Soft highlight reflection */}
            <motion.circle
              animate={{ cx: 50 - canopyRadius * 0.2, cy: topY - canopyRadius * 0.3, r: canopyRadius * 0.28 }}
              transition={transition}
              fill="rgba(255,255,255,0.25)"
            />
          </motion.g>
        )}

        {/* Completion celebration sparkles */}
        {complete && (
          <motion.g
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transition}
            style={{ transformOrigin: `50px ${topY}px` }}
          >
            {[
              [50, topY - canopyRadius - 6],
              [50 + canopyRadius + 4, topY - 2],
              [50 - canopyRadius - 4, topY + 2],
            ].map(([sx, sy], i) => (
              <g key={i} transform={`translate(${sx},${sy})`}>
                <circle cx="0" cy="0" r="2.5" fill="#f5c930" />
                <line x1="0" y1="-5" x2="0" y2="-8" stroke="#f5c930" strokeWidth="1.5" />
                <line x1="5" y1="0" x2="8" y2="0" stroke="#f5c930" strokeWidth="1.5" />
                <line x1="0" y1="5" x2="0" y2="8" stroke="#f5c930" strokeWidth="1.5" />
                <line x1="-5" y1="0" x2="-8" y2="0" stroke="#f5c930" strokeWidth="1.5" />
              </g>
            ))}
          </motion.g>
        )}

        {/* Small sprout for brand new goals ($0 progress) */}
        {progress === 0 && (
          <g transform={`translate(50,${GROUND_Y - 12})`}>
            <line x1="0" y1="0" x2="0" y2="-12" stroke="#5a7a40" strokeWidth="2" />
            <ellipse cx="0" cy="-14" rx="5" ry="4" fill="#5a7a40" />
          </g>
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

        {/* Action buttons (Edit & optional Delete) */}
        <div className="mt-1 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${goal.name}`}
            className="inline-flex items-center gap-1 rounded text-[11px] font-medium text-ink-soft transition-colors hover:text-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Edit
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${goal.name}`}
              className="inline-flex items-center gap-1 rounded text-[11px] font-medium text-ink-soft transition-colors hover:text-rust focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full gap-1 mt-1">
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Add $"
          aria-label={`Add a contribution to ${goal.name}`}
          className="w-full min-w-0 rounded-lg border border-moss/20 bg-canvas px-2 py-1 font-data text-xs text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-moss px-2.5 py-1 text-xs font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          Add
        </button>
      </form>
    </div>
  );
}