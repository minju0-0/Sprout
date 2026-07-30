import type { PlantGrowthStage } from "@/types";
import { cn } from "@/lib/cn";
const STAGE_LABEL: Record<PlantGrowthStage, string> = {
  thriving: "thriving",
  steady: "steady",
  wilting: "wilting",
  overgrown: "overgrown",
};
const STAGE_TONE: Record<PlantGrowthStage, string> = {
  thriving: "bg-moss/15 text-moss-700",
  steady: "bg-marigold/15 text-marigold-700",
  wilting: "bg-marigold/25 text-marigold-900",
  overgrown: "bg-rust/15 text-rust-700",
};
export function StatusPill({ stage }: { stage: PlantGrowthStage }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STAGE_TONE[stage])}>
      {STAGE_LABEL[stage]}
    </span>
  );
}