import type { PlantSpecies } from "@/types";
import { PlantIllustration } from "@/components/PlantIllustration";

interface PlantThumbnailProps {
  species: PlantSpecies;
  size?: number;
}

export function PlantThumbnail({ species, size = 56 }: PlantThumbnailProps) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl bg-moss/10"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <PlantIllustration species={species} stage="thriving" size={size * 0.8} />
    </span>
  );
}