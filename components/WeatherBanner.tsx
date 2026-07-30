import { Sprout, Sun, CloudDrizzle, CloudLightning, Plus, type LucideIcon } from "lucide-react";
import type { GardenHealthStatus } from "@/types";
import { cn } from "@/lib/cn";
interface WeatherBannerProps {
  status: GardenHealthStatus;
  onAddCategory?: () => void;
  percentSpent?: number;
}
const copy: Record<GardenHealthStatus, { label: string; detail: string }> = {
  unplanted: {
    label: "No forecast yet",
    detail: "Add a budget category to start tracking your garden's weather.",
  },
  sunny: { label: "Sunny — Garden is healthy", detail: "You're on track. Keep it up." },
  cloudy: {
    label: "Cloudy — Getting close",
    detail: "A category is close to its limit — worth a look.",
  },
  storm: {
    label: "Storm — Over budget",
    detail: "At least one category is over budget.",
  },
};
const icon: Record<GardenHealthStatus, LucideIcon> = {
  unplanted: Sprout,
  sunny: Sun,
  cloudy: CloudDrizzle,
  storm: CloudLightning,
};
const tone: Record<GardenHealthStatus, string> = {
  unplanted: "bg-moss/10",
  sunny: "bg-marigold/15",
  cloudy: "bg-sky-soft/50",
  storm: "bg-rust/15",
};
const barColor: Record<GardenHealthStatus, string> = {
  unplanted: "#3f6b3a",
  sunny: "#d98a1f",
  cloudy: "#5b84a6",
  storm: "#b0402a",
};
export function WeatherBanner({ status, onAddCategory, percentSpent }: WeatherBannerProps) {
  const Icon = icon[status];
  const text = copy[status];
  const showBar = status !== "unplanted" && typeof percentSpent === "number";
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4", tone[status])}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-ink">{text.label}</p>
          <p className="text-xs text-ink-soft">{text.detail}</p>
        </div>
      </div>
      {showBar ? (
        <div className="flex items-center gap-3">
          <span className="font-data text-sm font-semibold text-ink">
            {Math.round((percentSpent as number) * 100)}% spent
          </span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(percentSpent as number, 1) * 100}%`,
                backgroundColor: barColor[status],
              }}
            />
          </div>
        </div>
      ) : (
        status === "unplanted" &&
        onAddCategory && (
          <button
            type="button"
            onClick={onAddCategory}
            className="flex items-center gap-1.5 rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Plant your first category
          </button>
        )
      )}
    </div>
  );
}