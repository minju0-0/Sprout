import type { PlantSpecies } from "@/types";
import { plantTypeMap } from "@/constants/gardenAssets";
interface CategoryChipProps {
  name: string;
  species: PlantSpecies;
}
export function CategoryChip({ name, species }: CategoryChipProps) {
  const accent = plantTypeMap[species]?.stages.thriving.accent ?? "#3f6b3a";
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: `${accent}26`, color: accent }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <span className="truncate">{name}</span>
    </span>
  );
}
