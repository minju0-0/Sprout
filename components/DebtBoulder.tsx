"use client";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pencil, PartyPopper } from "lucide-react";
import type { Debt } from "@/types";
import { getBoulderScale, getDebtProgress, isDebtPaidOff } from "@/lib/debtLogic";
import { formatCurrency } from "@/lib/currency";
interface DebtBoulderProps {
  debt: Debt;
  currencyCode: string | null;
  onPay: (amount: number) => void;
  onEdit: () => void;
}
const GROUND_Y = 148;
const BOULDER_PATH =
  "M-24 4 L-18 -20 L-2 -30 L16 -26 L26 -8 L22 12 L4 22 L-14 20 Z";
export function DebtBoulder({ debt, currencyCode, onPay, onEdit }: DebtBoulderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [amount, setAmount] = useState("");
  const progress = getDebtProgress(debt);
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
      <svg
        viewBox="0 0 100 160"
        className="h-40 w-28"
        role="img"
        aria-label={`${debt.name}: ${formatCurrency(
          debt.currentAmount,
          currencyCode,
        )} left of ${formatCurrency(debt.startingAmount, currencyCode)} owed${
          paidOff ? ", paid off" : ""
        }`}
      >
        <ellipse cx="50" cy={GROUND_Y} rx="26" ry="7" fill="#5b4636" />
        <motion.g
          animate={{ scale }}
          transition={transition}
          style={{ transformOrigin: `50px ${GROUND_Y}px` }}
        >
          <motion.path
            d={BOULDER_PATH}
            transform={`translate(50 ${GROUND_Y - 22})`}
            animate={{ fill: paidOff ? "#95ae93" : "#8b5e6b" }}
            transition={transition}
            stroke="#6c4953"
            strokeWidth="1.5"
          />
          <path
            d="M-10 -10 L2 -16 L12 -6"
            transform={`translate(50 ${GROUND_Y - 22})`}
            stroke="#bfa6ae"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </motion.g>
        {paidOff && (
          <motion.g
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transition}
            style={{ transformOrigin: `50px ${GROUND_Y - 30}px` }}
          >
            <circle cx="50" cy={GROUND_Y - 30} r="4" fill="#e8a33d" />
          </motion.g>
        )}
      </svg>
      <div className="text-center">
        <p className="flex items-center justify-center gap-1 text-sm font-semibold text-ink">
          {debt.name}
          {paidOff && <PartyPopper className="h-3.5 w-3.5 text-marigold" aria-hidden="true" />}
        </p>
        <p className="font-data text-xs text-ink-soft">
          {formatCurrency(debt.currentAmount, currencyCode)} left of{" "}
          {formatCurrency(debt.startingAmount, currencyCode)}
        </p>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${debt.name}`}
          className="mt-1 inline-flex items-center gap-1 rounded text-[11px] text-ink-soft transition-colors hover:text-moss active:text-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Edit
        </button>
      </div>
      {!paidOff && (
        <form onSubmit={handleSubmit} className="flex w-full gap-1">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Pay $"
            aria-label={`Log a payment toward ${debt.name}`}
            className="w-full min-w-0 rounded-lg border border-moss/20 bg-canvas px-2 py-1 font-data text-xs text-ink"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-moss px-2 py-1 text-xs font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Pay
          </button>
        </form>
      )}
    </div>
  );
}