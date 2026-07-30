"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pencil, PartyPopper, Scissors, Trash2 } from "lucide-react";

import type { Debt } from "@/types";
import { getBoulderScale, getDebtProgress, isDebtPaidOff } from "@/lib/debtLogic";
import { formatCurrency } from "@/lib/currency";

interface DebtBoulderProps {
  debt: Debt;
  currencyCode: string | null;
  onPay: (amount: number) => void;
  onEdit: () => void;
  onDelete?: () => void;
}

const GROUND_Y = 148;

export function DebtBoulder({ debt, currencyCode, onPay, onEdit, onDelete }: DebtBoulderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [amount, setAmount] = useState("");

  const progress = getDebtProgress(debt);
  // Scale shrinks as debt is paid down
  const scale = getBoulderScale(progress);
  const paidOff = isDebtPaidOff(debt);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: "easeOut" as const };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onPay(parsed);
    setAmount("");
  }

  return (
    <div className="flex w-36 flex-col items-center gap-2">
      <div className="relative">
        {paidOff && (
          <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-marigold/20 blur-xl pointer-events-none" />
        )}

        <svg
          viewBox="0 0 100 160"
          className="h-44 w-32 overflow-visible"
          role="img"
          aria-label={`${debt.name}: ${formatCurrency(
            debt.currentAmount,
            currencyCode,
          )} left of ${formatCurrency(debt.startingAmount, currencyCode)} owed${
            paidOff ? ", paid off" : ""
          }`}
        >
          {/* Ground shadows */}
          <ellipse cx="50" cy={GROUND_Y + 2} rx="30" ry="8" fill="#433225" />
          <ellipse cx="50" cy={GROUND_Y} rx="26" ry="6" fill="#5b4636" />

          {!paidOff ? (
            <motion.g
              animate={{ scale }}
              transition={transition}
              style={{ transformOrigin: `50px ${GROUND_Y}px` }}
            >
              {/* Solid faceted rock */}
              <polygon points="15,144 45,90 85,144" fill="#4c343b" />
              <polygon points="15,144 30,85 55,65 50,110" fill="#bfa6ae" />
              <polygon points="55,65 75,95 65,125 50,110" fill="#8b5e6b" />
              <polygon points="15,144 50,110 45,148" fill="#6c4953" />
              <polygon points="45,148 50,110 65,125 75,95 85,144" fill="#4c343b" />

              {/* Stylized cracks representing debt */}
              <polyline points="55,65 50,110 65,125" stroke="#311f25" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              <polyline points="30,85 40,95 50,110" stroke="#311f25" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
              <line x1="45" y1="148" x2="50" y2="110" stroke="#311f25" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            </motion.g>
          ) : (
            <motion.g
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={transition}
              style={{ transformOrigin: `50px ${GROUND_Y}px` }}
            >
              {/* Shattered rock fragments on the ground */}
              <polygon points="10,148 20,135 32,148" fill="#6c4953" />
              <polygon points="12,148 22,140 28,148" fill="#bfa6ae" opacity="0.8" />
              <polygon points="68,148 80,132 92,148" fill="#4c343b" />
              <polygon points="75,148 82,138 88,148" fill="#8b5e6b" />
              <polygon points="35,148 45,142 55,148" fill="#311f25" opacity="0.8" />

              {/* Blooming flower emerging from the shattered debt */}
              <path d="M 50 146 Q 45 110 50 80" stroke="#3f6b3a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path d="M 50 120 Q 32 110 35 98 Q 45 102 48 112" fill="#4f8a44" />
              <path d="M 50 108 Q 68 100 62 88 Q 52 92 50 98" fill="#4f8a44" />

              {/* Glowing Marigold Bloom */}
              <circle cx="50" cy="78" r="14" fill="#e8a33d" />
              <circle cx="50" cy="78" r="7" fill="#f4c766" />
              <path d="M 50 64 L 54 71 L 61 74 L 54 77 L 57 85 L 50 81 L 43 85 L 46 77 L 39 74 L 46 71 Z" fill="#ffffff" opacity="0.6" />

              <g className="animate-sparkle">
                <circle cx="50" cy="54" r="3" fill="#fbeedc" />
                <circle cx="32" cy="85" r="2.5" fill="#ffffff" />
                <circle cx="68" cy="72" r="2.5" fill="#f4c766" />
                <circle cx="40" cy="62" r="1.5" fill="#ffffff" />
                <circle cx="60" cy="92" r="2" fill="#ffffff" />
              </g>
            </motion.g>
          )}
        </svg>
      </div>

      <div className="text-center">
        <p className="flex items-center justify-center gap-1 text-sm font-semibold text-ink">
          {debt.name}
          {paidOff ? (
            <PartyPopper className="h-3.5 w-3.5 text-marigold" aria-hidden="true" />
          ) : (
            <Scissors className="h-3.5 w-3.5 text-rust" aria-hidden="true" />
          )}
        </p>
        <p className="font-data text-xs text-ink-soft mt-0.5">
          {formatCurrency(debt.currentAmount, currencyCode)} left of{" "}
          {formatCurrency(debt.startingAmount, currencyCode)}
        </p>

        {/* Action buttons (Edit & Delete) */}
        <div className="mt-1 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${debt.name}`}
            className="inline-flex items-center gap-1 rounded text-[11px] font-medium text-ink-soft transition-colors hover:text-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Edit
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${debt.name}`}
              className="inline-flex items-center gap-1 rounded text-[11px] font-medium text-ink-soft transition-colors hover:text-rust focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      </div>

      {!paidOff && (
        <form onSubmit={handleSubmit} className="flex w-full gap-1 mt-1">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Pay $"
            aria-label={`Log a payment toward ${debt.name}`}
            className="w-full min-w-0 rounded-lg border border-moss/20 bg-canvas px-2 py-1 font-data text-xs text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-moss px-2.5 py-1 text-xs font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Pay
          </button>
        </form>
      )}
    </div>
  );
}