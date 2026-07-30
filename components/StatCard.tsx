import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
export type StatCardTone = "default" | "positive" | "warning" | "danger";
export interface StatCardTrend {
  direction: "up" | "down" | "flat";
  label: string;
}
interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: StatCardTrend;
  tone?: StatCardTone;
  icon?: LucideIcon;
}
const toneValueClass: Record<StatCardTone, string> = {
  default: "text-ink",
  positive: "text-moss-700",
  warning: "text-marigold-700",
  danger: "text-rust-700",
};
const trendIcon: Record<StatCardTrend["direction"], LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};
const trendColorClass: Record<StatCardTone, string> = {
  default: "text-ink-soft",
  positive: "text-moss",
  warning: "text-marigold-700",
  danger: "text-rust",
};
export function StatCard({ label, value, subtitle, trend, tone = "default", icon: Icon }: StatCardProps) {
  const TrendIcon = trend ? trendIcon[trend.direction] : null;
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-moss/10 bg-card px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-ink-soft/70" aria-hidden="true" />}
      </div>
      <p className={cn("font-data text-2xl font-semibold tabular-nums", toneValueClass[tone])}>
        {value}
      </p>
      {trend && TrendIcon ? (
        <p className={cn("flex items-center gap-1 text-xs font-medium", trendColorClass[tone])}>
          <TrendIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {trend.label}
        </p>
      ) : subtitle ? (
        <p className="text-xs text-ink-soft">{subtitle}</p>
      ) : null}
    </div>
  );
}