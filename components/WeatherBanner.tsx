import { Sprout, Sun, CloudDrizzle, CloudLightning, Plus, type LucideIcon } from "lucide-react";
import type { GardenHealthStatus } from "@/types";
import { cn } from "@/lib/cn";
interface WeatherBannerProps {
  status: GardenHealthStatus;
  onAddCategory?: () => void;
}
const copy: Record<GardenHealthStatus, { label: string; detail: string }> = {
  unplanted: {
    label: "No forecast yet",
    detail: "Add a budget category to start tracking your garden's weather.",
  },
  sunny: { label: "Sunny", detail: "Every category is tracking under budget." },
  cloudy: {
    label: "Cloudy",
    detail: "A category is close to its limit — worth a look.",
  },
  storm: {
    label: "Storm",
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
  unplanted: "bg-moss/10 text-ink",
  sunny: "bg-marigold/15 text-ink",
  cloudy: "bg-sky-soft/60 text-ink",
  storm: "bg-rust/15 text-ink",
};
export function WeatherBanner({ status, onAddCategory }: WeatherBannerProps) {
  const Icon = icon[status];
  const text = copy[status];
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3",
        tone[status],
      )}
      role="status"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{text.label}</p>
          <p className="text-xs text-ink-soft">{text.detail}</p>
        </div>
      </div>
      {status === "unplanted" && onAddCategory && (
        <button
          type="button"
          onClick={onAddCategory}
          className="flex items-center gap-1.5 rounded-lg bg-moss px-3 py-1.5 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Plant your first category
        </button>
      )}
    </div>
  );
}
