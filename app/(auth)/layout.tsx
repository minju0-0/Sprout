import Link from "next/link";
import { Sprout as SproutIcon } from "lucide-react";
import { GoalTreePreview } from "@/components/GoalTreePreview";
import type { Goal } from "@/types";
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const previewGoal: Goal = {
    id: "auth-preview-goal",
    name: "Rainy Day Fund",
    targetAmount: 2000,
    currentAmount: 1450,
  };
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="mb-10 flex w-fit items-center gap-2 rounded text-ink transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss text-canvas">
            <SproutIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold">Sprout</span>
        </Link>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden bg-moss-700 px-10 py-12 lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full text-white/10"
          viewBox="0 0 400 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {Array.from({ length: 20 }, (_, i) => (
            <g key={i} transform={`translate(${i * 20 + 10},36)`}>
              <line x1="0" y1="0" x2="0" y2="-14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M0,-9 C-4,-11 -6,-15 -4,-18 C-1,-16 0,-12 0,-9Z" fill="currentColor" />
              <path d="M0,-6 C4,-8 6,-12 4,-15 C1,-13 0,-9 0,-6Z" fill="currentColor" />
            </g>
          ))}
        </svg>
        <p className="relative font-display text-2xl leading-snug text-white">
          Budgeting that shows its work — every category, growing or wilting
          in real time.
        </p>
        <div className="relative mt-10 flex flex-1 items-center justify-center">
          <div className="rounded-[2rem] bg-white/10 px-8 py-8 backdrop-blur-sm">
            <GoalTreePreview goal={previewGoal} />
            <p className="mt-2 text-center font-data text-xs text-moss-100/80">
              Rainy Day Fund — 72% grown
            </p>
          </div>
        </div>
        <p className="relative text-sm text-moss-100/80">
          Your numbers stay yours. Sprout never guesses — it only reflects
          exactly what you enter.
        </p>
      </div>
    </div>
  );
}