"use client";
import { motion } from "framer-motion";
import type { PlantSpecies } from "@/types";
import { plantIllustrations } from "@/constants/gardenAssets";
interface StagePalette {
  stem: string;
  foliage: string;
  accent: string;
}
interface ShapeTransition {
  duration: number;
  ease?: "easeOut";
}
interface ShapeProps {
  palette: StagePalette;
  topY: number;
  groundY: number;
  height: number;
  transition: ShapeTransition;
}
interface PlantIllustrationProps extends ShapeProps {
  species: PlantSpecies;
}
export function PlantIllustration({ species, ...shapeProps }: PlantIllustrationProps) {
  const { foliageShape, detailCount } = plantIllustrations[species];
  switch (foliageShape) {
    case "petals":
      return <SunflowerShape {...shapeProps} petalCount={detailCount} />;
    case "rosette":
      return <SucculentShape {...shapeProps} leafCount={detailCount} />;
    case "fronds":
      return <FernShape {...shapeProps} frondCount={detailCount} />;
    case "bushy":
      return <BerryBushShape {...shapeProps} berryCount={detailCount} />;
    case "cluster":
    default:
      return <TomatoShape {...shapeProps} fruitCount={detailCount} />;
  }
}
function TomatoShape({ palette, topY, groundY, transition, fruitCount }: ShapeProps & { fruitCount: number }) {
  const fruit = Array.from({ length: fruitCount }, (_, i) => (i / fruitCount) * Math.PI * 2);
  return (
    <>
      <motion.line
        x1="50"
        y1={groundY}
        x2="50"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ y2: topY, stroke: palette.stem }}
        transition={transition}
      />
      <motion.circle cx="50" r="16" animate={{ cy: topY, fill: palette.foliage }} transition={transition} />
      <motion.circle
        cx="37"
        r="10"
        opacity="0.85"
        animate={{ cy: topY + 9, fill: palette.foliage }}
        transition={transition}
      />
      <motion.circle
        cx="63"
        r="10"
        opacity="0.85"
        animate={{ cy: topY + 9, fill: palette.foliage }}
        transition={transition}
      />
      {fruit.map((angle, i) => (
        <motion.circle
          key={i}
          r="4"
          animate={{
            cx: 50 + Math.cos(angle) * 14,
            cy: topY + 6 + Math.sin(angle) * 10,
            fill: palette.accent,
          }}
          transition={transition}
        />
      ))}
    </>
  );
}
function SunflowerShape({
  palette,
  topY,
  groundY,
  transition,
  petalCount,
}: ShapeProps & { petalCount: number }) {
  const petals = Array.from({ length: petalCount }, (_, i) => (i / petalCount) * 360);
  const leafY = (topY + groundY) / 2;
  return (
    <>
      <motion.line
        x1="50"
        y1={groundY}
        x2="50"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ y2: topY, stroke: palette.stem }}
        transition={transition}
      />
      <motion.ellipse
        cx="37"
        rx="11"
        ry="5"
        transform="rotate(-25 37 0)"
        animate={{ cy: leafY + 10, fill: palette.stem }}
        transition={transition}
      />
      <motion.ellipse
        cx="63"
        rx="11"
        ry="5"
        transform="rotate(25 63 0)"
        animate={{ cy: leafY - 10, fill: palette.stem }}
        transition={transition}
      />
      <motion.g animate={{ y: topY }} transition={transition}>
        {petals.map((deg, i) => (
          <motion.ellipse
            key={i}
            cx="50"
            cy="0"
            rx="6"
            ry="13"
            transform={`rotate(${deg} 50 0) translate(0 -13)`}
            animate={{ fill: palette.foliage }}
            transition={transition}
          />
        ))}
        <motion.circle cx="50" cy="0" r="10" animate={{ fill: palette.accent }} transition={transition} />
      </motion.g>
    </>
  );
}
function SucculentShape({ palette, groundY, height, transition, leafCount }: ShapeProps & { leafCount: number }) {
  const scale = 0.55 + (height / 132) * 0.65;
  const baseY = groundY - 6;
  const leaves = Array.from({ length: leafCount }, (_, i) => (i / leafCount) * 360);
  return (
    <motion.g animate={{ scale }} transition={transition} style={{ transformOrigin: `50px ${groundY}px` }}>
      {leaves.map((deg, i) => (
        <motion.ellipse
          key={i}
          cx="50"
          cy={baseY}
          rx="7"
          ry="16"
          transform={`rotate(${deg} 50 ${baseY}) translate(0 -10)`}
          animate={{ fill: palette.foliage }}
          transition={transition}
        />
      ))}
      <motion.circle cx="50" cy={baseY} r="6" animate={{ fill: palette.accent }} transition={transition} />
    </motion.g>
  );
}
function FernShape({ palette, groundY, height, transition, frondCount }: ShapeProps & { frondCount: number }) {
  const frondLength = height * 0.9;
  return (
    <>
      {Array.from({ length: frondCount }, (_, i) => {
        const angle = -90 + ((i - (frondCount - 1) / 2) / frondCount) * 70;
        const rad = (angle * Math.PI) / 180;
        const tipX = 50 + Math.sin(rad) * frondLength;
        const tipY = groundY - Math.cos(rad) * frondLength;
        const midX = 50 + Math.sin(rad) * frondLength * 0.55;
        const midY = groundY - Math.cos(rad) * frondLength * 0.55;
        const path = `M50 ${groundY} Q ${midX} ${midY} ${tipX} ${tipY}`;
        return (
          <g key={i}>
            <motion.path
              d={path}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ d: path, stroke: palette.stem }}
              transition={transition}
            />
            {[0.4, 0.7].map((fraction) => {
              const px = 50 + Math.sin(rad) * frondLength * fraction;
              const py = groundY - Math.cos(rad) * frondLength * fraction;
              return (
                <motion.line
                  key={fraction}
                  x1={px - 4}
                  x2={px + 4}
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ y1: py, y2: py, stroke: palette.foliage }}
                  transition={transition}
                />
              );
            })}
          </g>
        );
      })}
    </>
  );
}
function BerryBushShape({
  palette,
  topY,
  groundY,
  transition,
  berryCount,
}: ShapeProps & { berryCount: number }) {
  const clusters = [
    { dx: 0, dy: 0, r: 17, opacity: 1 },
    { dx: -20, dy: 6, r: 13, opacity: 0.85 },
    { dx: 20, dy: 6, r: 13, opacity: 0.85 },
    { dx: -10, dy: -8, r: 11, opacity: 0.85 },
    { dx: 10, dy: -8, r: 11, opacity: 0.85 },
  ];
  const berries = Array.from({ length: berryCount }, (_, i) => ({
    angle: (i / berryCount) * Math.PI * 2,
    radius: 18 + (i % 3) * 4,
  }));
  return (
    <>
      <motion.line
        x1="50"
        y1={groundY}
        x2="50"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ y2: topY + 14, stroke: palette.stem }}
        transition={transition}
      />
      {clusters.map((cluster, i) => (
        <motion.circle
          key={i}
          cx={50 + cluster.dx}
          r={cluster.r}
          opacity={cluster.opacity}
          animate={{ cy: topY + cluster.dy, fill: palette.foliage }}
          transition={transition}
        />
      ))}
      {berries.map((berry, i) => (
        <motion.circle
          key={i}
          r="3.5"
          animate={{
            cx: 50 + Math.cos(berry.angle) * berry.radius,
            cy: topY + Math.sin(berry.angle) * berry.radius * 0.6,
            fill: palette.accent,
          }}
          transition={transition}
        />
      ))}
    </>
  );
}
