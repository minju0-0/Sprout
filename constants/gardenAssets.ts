import type { PlantGrowthStage, PlantSpecies } from "@/types";
interface StagePalette {
  stem: string;
  foliage: string;
  accent: string;
}
interface PlantVisual {
  label: string;
  stages: Record<PlantGrowthStage, StagePalette>;
}
export const plantTypeMap: Record<PlantSpecies, PlantVisual> = {
  tomato: {
    label: "Tomato",
    stages: {
      thriving: { stem: "#3f6b3a", foliage: "#4f8a44", accent: "#d9483a" },
      steady: { stem: "#4c7a47", foliage: "#5c9350", accent: "#c2543f" },
      wilting: { stem: "#8a7b4a", foliage: "#a99552", accent: "#a15a3f" },
      overgrown: { stem: "#6b5a3e", foliage: "#8b5e6b", accent: "#7a6152" },
    },
  },
  sunflower: {
    label: "Sunflower",
    stages: {
      thriving: { stem: "#3f6b3a", foliage: "#e8a33d", accent: "#f4c766" },
      steady: { stem: "#4b7f52", foliage: "#d9a23b", accent: "#e3b95c" },
      wilting: { stem: "#8a7b4a", foliage: "#b8924a", accent: "#c7a85e" },
      overgrown: { stem: "#6b5a3e", foliage: "#8b5e6b", accent: "#7a6152" },
    },
  },
  succulent: {
    label: "Succulent",
    stages: {
      thriving: { stem: "#3d6b52", foliage: "#5fa383", accent: "#8fcbb0" },
      steady: { stem: "#4a7860", foliage: "#6b9784", accent: "#9ab8a9" },
      wilting: { stem: "#8a8a4a", foliage: "#a3a06a", accent: "#b8b58a" },
      overgrown: { stem: "#6b5a3e", foliage: "#8b5e6b", accent: "#7a6152" },
    },
  },
  fern: {
    label: "Fern",
    stages: {
      thriving: { stem: "#2f5c33", foliage: "#4c8a4f", accent: "#7ab97d" },
      steady: { stem: "#3d6b42", foliage: "#5b9760", accent: "#8ab88d" },
      wilting: { stem: "#7c7a45", foliage: "#9a9a5c", accent: "#b0ac78" },
      overgrown: { stem: "#6b5a3e", foliage: "#8b5e6b", accent: "#7a6152" },
    },
  },
  "berry-bush": {
    label: "Berry Bush",
    stages: {
      thriving: { stem: "#3f6b3a", foliage: "#4f8a44", accent: "#6b4a8b" },
      steady: { stem: "#4c7a47", foliage: "#5c9350", accent: "#7a5c93" },
      wilting: { stem: "#8a7b4a", foliage: "#a99552", accent: "#93805c" },
      overgrown: { stem: "#6b5a3e", foliage: "#8b5e6b", accent: "#7a6152" },
    },
  },
};
export type FoliageShape = "cluster" | "petals" | "rosette" | "fronds" | "bushy";
export interface PlantIllustrationSpec {
  foliageShape: FoliageShape;
  detailCount: number;
}
export const plantIllustrations: Record<PlantSpecies, PlantIllustrationSpec> = {
  tomato: { foliageShape: "cluster", detailCount: 4 },
  sunflower: { foliageShape: "petals", detailCount: 10 },
  succulent: { foliageShape: "rosette", detailCount: 6 },
  fern: { foliageShape: "fronds", detailCount: 5 },
  "berry-bush": { foliageShape: "bushy", detailCount: 8 },
};
export const weedColor = "#7a6152";
export const soilColor = "#5b4636";
