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
const toneIconWrapClass: Record<StatCardTone, string> = {
  default: "bg-moss/10 text-moss",
  positive: "bg-moss/10 text-moss",
  warning: "bg-marigold/15 text-marigold-700",
  danger: "bg-rust/15 text-rust",
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
export function StatCard({ label, value, trend, tone = "default", icon: Icon }: StatCardProps) {
  const TrendIcon = trend ? trendIcon[trend.direction] : null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-moss/15 bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{label}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              toneIconWrapClass[tone],
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className={cn("font-data text-2xl font-semibold tabular-nums", toneValueClass[tone])}>
        {value}
      </p>
      {trend && TrendIcon && (
        <p className={cn("flex items-center gap-1 text-xs font-medium", trendColorClass[tone])}>
          <TrendIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {trend.label}
        </p>
      )}
    </div>
  );
}
