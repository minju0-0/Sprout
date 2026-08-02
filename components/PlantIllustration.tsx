"use client";
import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PlantGrowthStage, PlantSpecies } from "@/types";
type Stage = "Thriving" | "Steady" | "Wilting" | "Overgrown";
type Species = "Tomato" | "Sunflower" | "Succulent" | "Fern" | "Berry";
interface SC {
  lf: string;
  ld: string;
  ll: string;
  ls: string;
  st: string;
  fo: number;
  scale: number;
  droop: number;
  tilt: number;
  sp: boolean;
  wd: boolean;
}
const STAGE: Record<Stage, SC> = {
  Thriving: { lf: "#4f8a44", ld: "#356b2c", ll: "#8bcf78", ls: "#264a1c", st: "#3a6a30", fo: 1.0, scale: 1.0, droop: 0.0, tilt: 0, sp: true, wd: false },
  Steady: { lf: "#5c8b4e", ld: "#43663a", ll: "#7aab68", ls: "#33502a", st: "#4a6a3c", fo: 0.76, scale: 0.93, droop: 0.14, tilt: 2.5, sp: false, wd: false },
  Wilting: { lf: "#a09a52", ld: "#7d7638", ll: "#bcb56a", ls: "#5e5824", st: "#8a7c42", fo: 0.4, scale: 0.78, droop: 0.68, tilt: 9, sp: false, wd: false },
  Overgrown: { lf: "#2a5e26", ld: "#173c16", ll: "#3d7a30", ls: "#122e12", st: "#20401e", fo: 0.22, scale: 1.06, droop: 0.3, tilt: -6, sp: false, wd: true },
};
/**
 * Rounds a computed SVG coordinate to 3 decimal places.
 *
 * Several plant illustrations position elements using Math.cos/Math.sin/
 * Math.atan2. The ECMAScript spec doesn't require these to be bit-identical
 * across engines, so the exact same expression can legitimately return a
 * value like 12.606079867221862 when this component renders on the server
 * (Node) and 12.606079867221863 when React hydrates it in the browser — a
 * one-ulp difference with zero visual effect, but enough for React's
 * hydration check to flag the tree as mismatched. Rounding collapses both
 * values to 12.606, so the server and client markup always match exactly.
 */
function rc(value: number): number {
  return Math.round(value * 1000) / 1000;
}
function Soil() {
  return (
    <>
      <ellipse cx="60" cy="152" rx="54" ry="11" fill="#43301f" />
      <ellipse cx="60" cy="146" rx="48" ry="9" fill="#5b4636" />
      <ellipse cx="60" cy="141" rx="40" ry="6" fill="#7a6050" />
      <g opacity="0.35" fill="#3a2a1c">
        <ellipse cx="38" cy="145" rx="2.2" ry="1.3" />
        <ellipse cx="52" cy="148" rx="1.8" ry="1" />
        <ellipse cx="70" cy="146" rx="2" ry="1.2" />
        <ellipse cx="84" cy="144" rx="1.6" ry="1" />
      </g>
    </>
  );
}
function Sparkles({ cx = 88, cy = 30 }: { cx?: number; cy?: number }) {
  const pts: [number, number][] = [
    [cx, cy],
    [cx - 16, cy - 8],
    [cx + 10, cy + 16],
    [cx + 18, cy - 4],
    [cx - 8, cy + 22],
  ];
  return (
    <>
      {pts.map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <line x1={-3} y1={0} x2={3} y2={0} stroke="#f4c766" strokeWidth={i === 0 ? 2 : 1.5} strokeLinecap="round" />
          <line x1={0} y1={-3} x2={0} y2={3} stroke="#f4c766" strokeWidth={i === 0 ? 2 : 1.5} strokeLinecap="round" />
          {i === 0 && (
            <>
              <line x1={-2.1} y1={-2.1} x2={2.1} y2={2.1} stroke="#f4c766" strokeWidth="1.2" strokeLinecap="round" />
              <line x1={2.1} y1={-2.1} x2={-2.1} y2={2.1} stroke="#f4c766" strokeWidth="1.2" strokeLinecap="round" />
            </>
          )}
        </g>
      ))}
    </>
  );
}
function WeedSprigs() {
  return (
    <>
      <path d="M34,140 C32,126 27,118 22,112" stroke="#7a6152" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M28,122 C23,118 19,116 18,120" stroke="#7a6152" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <ellipse cx="17" cy="119" rx="6" ry="3.5" fill="#5a4840" opacity="0.75" transform="rotate(-28 17 119)" />
      <path d="M24,114 C20,108 16,106 15,110" stroke="#7a6152" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="14" cy="109" rx="5" ry="3" fill="#4a3c30" opacity="0.65" transform="rotate(-40 14 109)" />
      <path d="M86,140 C88,126 93,118 98,112" stroke="#7a6152" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M92,122 C97,118 101,116 102,120" stroke="#7a6152" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <ellipse cx="103" cy="119" rx="6" ry="3.5" fill="#5a4840" opacity="0.75" transform="rotate(28 103 119)" />
    </>
  );
}
function CompoundLeaf({ sc, s = 1 }: { sc: SC; s?: number }) {
  const { lf, ld, ll, ls, st } = sc;
  const wilt = sc.droop > 0.4;
  const sag = sc.droop * 6;
  return (
    <>
      <path
        d={`M0,0 C${1 * s},${-14 * s} ${-1 * s + sag * 0.2},${-26 * s} 0,${-34 * s}`}
        stroke={st}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M0,${-34 * s} C${-6 * s},${-40 * s + sag * 0.3} ${-6 * s},${-51 * s + sag} 0,${-54 * s + sag} C${6 * s},${-51 * s + sag} ${6 * s},${-40 * s + sag * 0.3} 0,${-34 * s}Z`}
        fill={lf}
        stroke={ls}
        strokeWidth="1"
      />
      <path d={`M0,${-35 * s} Q${2 * s},${-44 * s} 0,${-53 * s + sag}`} stroke={ld} strokeWidth="0.7" fill="none" opacity="0.55" />
      <path
        d={`M${-2 * s},${-27 * s} C${-10 * s},${-26 * s} ${-15 * s},${-19 * s + sag * 0.3} ${-12 * s},${-13 * s + sag} C${-9 * s},${-8 * s + sag} ${-2 * s},${-10 * s} ${-2 * s},${-18 * s}Z`}
        fill={lf}
        stroke={ls}
        strokeWidth="1"
      />
      <path
        d={`M${2 * s},${-27 * s} C${10 * s},${-26 * s} ${15 * s},${-19 * s + sag * 0.3} ${12 * s},${-13 * s + sag} C${9 * s},${-8 * s + sag} ${2 * s},${-10 * s} ${2 * s},${-18 * s}Z`}
        fill={lf}
        stroke={ls}
        strokeWidth="1"
      />
      <path
        d={`M${-2 * s},${-15 * s} C${-8 * s},${-14 * s} ${-13 * s},${-9 * s + sag * 0.2} ${-10 * s},${-4 * s + sag * 0.6} C${-8 * s},${sag * 0.6} ${-2 * s},${-2 * s} ${-2 * s},${-7 * s}Z`}
        fill={lf}
        stroke={ls}
        strokeWidth="1"
      />
      <path
        d={`M${2 * s},${-15 * s} C${8 * s},${-14 * s} ${13 * s},${-9 * s + sag * 0.2} ${10 * s},${-4 * s + sag * 0.6} C${8 * s},${sag * 0.6} ${2 * s},${-2 * s} ${2 * s},${-7 * s}Z`}
        fill={lf}
        stroke={ls}
        strokeWidth="1"
      />
      <path
        d={`M${-1.4 * s},${-39 * s} C${-1.8 * s},${-46 * s} 0,${-52 * s + sag} 0,${-52 * s + sag} C0,${-52 * s + sag} ${0.6 * s},${-46 * s} ${-0.4 * s},${-39 * s}Z`}
        fill={ll}
        opacity="0.4"
      />
      {wilt && (
        <path
          d={`M${-11 * s},${-12 * s + sag} C${-15 * s},${-9 * s + sag} ${-17 * s},${-5 * s + sag} ${-13 * s},${-5 * s + sag}`}
          stroke="#8a6030"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}
    </>
  );
}
function TomatoFruit({
  id,
  x,
  y,
  fromX,
  fromY,
  sc,
  r = 11,
}: {
  id: string;
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  sc: SC;
  r?: number;
}) {
  const fc = sc.fo > 0.7 ? "#c8372a" : sc.fo > 0.45 ? "#b8502a" : "#a86030";
  const fl = sc.fo > 0.7 ? "#ec5540" : "#cc6040";
  return (
    <g opacity={sc.fo}>
      <defs>
        <radialGradient id={id} cx="34%" cy="28%" r="70%">
          <stop offset="0%" stopColor={fl} />
          <stop offset="55%" stopColor={fc} />
          <stop offset="100%" stopColor="#791a1a" />
        </radialGradient>
      </defs>
      <path
        d={`M${fromX},${fromY} Q${(fromX + x) / 2},${fromY + (y - fromY) * 0.4} ${x},${y - r + 2}`}
        stroke={sc.st}
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} stroke="#7d1c1c" strokeWidth="1" />
      <ellipse cx={x - r * 0.32} cy={y - r * 0.38} rx={r * 0.32} ry={r * 0.2} fill="rgba(255,255,255,0.32)" />
      <path d={`M${x - 2},${y - r + 2} C${x - 4},${y - r - 5} ${x - 6},${y - r - 8} ${x - 1},${y - r - 3}Z`} fill={sc.lf} stroke={sc.ls} strokeWidth="0.7" />
      <path d={`M${x + 2},${y - r + 2} C${x + 4},${y - r - 5} ${x + 6},${y - r - 8} ${x + 1},${y - r - 3}Z`} fill={sc.lf} stroke={sc.ls} strokeWidth="0.7" />
      <path d={`M${x},${y - r + 1} C${x + 1},${y - r - 6} ${x},${y - r - 9} ${x - 1},${y - r - 4}Z`} fill={sc.lf} stroke={sc.ls} strokeWidth="0.7" />
    </g>
  );
}
function TomatoPlant({ stage, uid }: { stage: Stage; uid: string }) {
  const sc = STAGE[stage];
  const stemPath =
    stage === "Wilting"
      ? "M60,138 C55,118 45,94 40,70 C36,50 39,30 34,23"
      : stage === "Overgrown"
        ? "M60,138 C57,112 65,88 57,64 C50,42 61,22 55,17"
        : "M60,138 C58,115 62,92 60,68 C58,46 62,26 60,20";
  type LeafPos = { x: number; y: number; angle: number; s: number };
  const leaves: LeafPos[] =
    stage === "Wilting"
      ? [
          { x: 41, y: 66, angle: 62, s: 0.8 },
          { x: 37, y: 38, angle: 76, s: 0.68 },
        ]
      : stage === "Overgrown"
        ? [
            { x: 58, y: 22, angle: -12, s: 1.12 },
            { x: 56, y: 66, angle: 30, s: 1.02 },
            { x: 54, y: 98, angle: -24, s: 0.92 },
            { x: 76, y: 56, angle: -58, s: 0.88 },
            { x: 40, y: 84, angle: 55, s: 0.7 },
          ]
        : [
            { x: 60, y: 22, angle: -10, s: 1.0 },
            { x: 60, y: 68, angle: 28, s: 0.95 },
            { x: 60, y: 100, angle: -22, s: 0.88 },
          ];
  return (
    <>
      <Soil />
      <g transform={`translate(60 140) rotate(${sc.tilt}) scale(1 ${sc.scale}) translate(-60 -140)`}>
        <line x1="67" y1="138" x2="67" y2="18" stroke="#9a7040" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        <path d={stemPath} stroke={sc.st} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={stemPath} stroke={sc.ld} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4" />
        {leaves.map((l, i) => (
          <g key={i} transform={`translate(${l.x},${l.y}) rotate(${l.angle})`}>
            <CompoundLeaf sc={sc} s={l.s} />
          </g>
        ))}
        {stage === "Thriving" && (
          <>
            <TomatoFruit id={`${uid}-fruit-a`} x={40} y={50} fromX={57} fromY={66} sc={sc} r={12} />
            <TomatoFruit id={`${uid}-fruit-b`} x={82} y={80} fromX={63} fromY={94} sc={sc} r={11} />
            <TomatoFruit id={`${uid}-fruit-c`} x={70} y={32} fromX={62} fromY={40} sc={sc} r={7} />
          </>
        )}
        {stage === "Steady" && (
          <>
            <TomatoFruit id={`${uid}-fruit-a`} x={42} y={52} fromX={57} fromY={66} sc={sc} r={11} />
            <TomatoFruit id={`${uid}-fruit-b`} x={80} y={82} fromX={63} fromY={94} sc={sc} r={10} />
          </>
        )}
        {stage === "Wilting" && <TomatoFruit id={`${uid}-fruit-a`} x={50} y={70} fromX={50} fromY={80} sc={sc} r={9} />}
        {stage === "Overgrown" && (
          <>
            <TomatoFruit id={`${uid}-fruit-a`} x={78} y={64} fromX={66} fromY={76} sc={sc} r={8} />
            <TomatoFruit id={`${uid}-fruit-b`} x={34} y={90} fromX={44} fromY={94} sc={sc} r={7} />
          </>
        )}
        {sc.wd && <WeedSprigs />}
        {sc.sp && <Sparkles cx={86} cy={18} />}
      </g>
    </>
  );
}
function SunflowerPlant({ stage, uid }: { stage: Stage; uid: string }) {
  const sc = STAGE[stage];
  const petalFill = stage === "Thriving" ? "#e8a33d" : stage === "Steady" ? "#d09030" : stage === "Wilting" ? "#b87820" : "#9a6418";
  const petalLight = stage === "Thriving" ? "#f4c766" : "#dea840";
  const ctrFill = "#3a2010";
  const stemW = stage === "Overgrown" ? 5.5 : 5;
  const hx = stage === "Wilting" ? 40 : 60;
  const hy = stage === "Wilting" ? 36 : 26;
  const hr = stage === "Thriving" ? 22 : stage === "Steady" ? 19 : stage === "Wilting" ? 16 : 15;
  const pc = stage === "Thriving" ? 16 : 14;
  function StemLeaf({ ix, iy, flip }: { ix: number; iy: number; flip: boolean }) {
    const sx = flip ? -1 : 1;
    const ex = ix + sx * 28;
    const ey = iy + 10;
    const mx = ix + sx * 18;
    const my = iy - 4;
    return (
      <>
        <path d={`M${ix},${iy} C${mx},${my} ${ex - 4},${ey - 8} ${ex},${ey}`} fill="none" stroke={sc.st} strokeWidth="1.2" />
        <path
          d={`M${ix},${iy} C${mx},${my} ${ex - 4},${ey - 8} ${ex},${ey} C${ex - 4},${ey + 6} ${mx - 2},${my + 12} ${ix},${iy}Z`}
          fill={sc.lf}
          stroke={sc.ls}
          strokeWidth="1"
        />
        <path d={`M${ix},${iy} L${(ix + ex) / 2 + sx * 4},${(iy + ey) / 2 - 4}`} stroke={sc.ld} strokeWidth="0.8" opacity="0.5" />
      </>
    );
  }
  return (
    <>
      <Soil />
      <g transform={`translate(60 140) scale(1 ${sc.scale}) translate(-60 -140)`}>
        {stage !== "Wilting" && (
          <>
            <StemLeaf ix={60} iy={94} flip={false} />
            <StemLeaf ix={60} iy={112} flip={true} />
          </>
        )}
        {stage === "Wilting" && <StemLeaf ix={52} iy={100} flip={true} />}
        {stage === "Wilting" ? (
          <path d="M60,138 C59,116 56,92 53,72 C50,54 44,42 40,36" stroke={sc.st} strokeWidth={stemW} fill="none" strokeLinecap="round" />
        ) : stage === "Overgrown" ? (
          <>
            <path d="M57,138 C55,114 57,90 56,66 C55,46 57,32 58,26" stroke={sc.st} strokeWidth={stemW} fill="none" strokeLinecap="round" />
            <path d="M66,138 C68,114 66,90 70,66 C74,46 76,34 78,28" stroke={sc.st} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <path d="M60,138 C60,116 60,92 60,68 C60,48 60,34 60,26" stroke={sc.st} strokeWidth={stemW} fill="none" strokeLinecap="round" />
        )}
        {stage !== "Overgrown" && (
          <>
            <defs>
              <radialGradient id={`${uid}-petal`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={petalLight} />
                <stop offset="100%" stopColor={petalFill} />
              </radialGradient>
            </defs>
            {Array.from({ length: pc }, (_, i) => {
              const ang = ((i * 360) / pc) * (Math.PI / 180);
              const pr = hr + 13;
              const px = rc(hx + Math.cos(ang) * pr);
              const py = rc(hy + Math.sin(ang) * pr);
              return (
                <ellipse
                  key={i}
                  cx={px}
                  cy={py}
                  rx="5.5"
                  ry="12"
                  fill={i % 2 === 0 ? `url(#${uid}-petal)` : petalFill}
                  stroke={stage === "Thriving" ? "#c07820" : "#9a5a10"}
                  strokeWidth="0.8"
                  transform={`rotate(${(i * 360) / pc + 90} ${px} ${py})`}
                  opacity={stage === "Wilting" ? 0.62 : 1}
                />
              );
            })}
            <circle cx={hx} cy={hy} r={hr} fill={ctrFill} stroke="#1a0c06" strokeWidth="1.3" />
            {Array.from({ length: 30 }, (_, i) => {
              const fib = i * 137.508 * (Math.PI / 180);
              const sr = Math.sqrt(i) * 3.0;
              if (sr > hr * 0.87) return null;
              return (
                <circle
                  key={i}
                  cx={rc(hx + Math.cos(fib) * sr)}
                  cy={rc(hy + Math.sin(fib) * sr)}
                  r="1.3"
                  fill="#6a3c1a"
                  opacity="0.85"
                />
              );
            })}
          </>
        )}
        {stage === "Overgrown" && (
          <>
            {Array.from({ length: 12 }, (_, i) => {
              const ang = i * 30 * (Math.PI / 180);
              const pr = 28;
              const px = rc(58 + Math.cos(ang) * pr);
              const py = rc(26 + Math.sin(ang) * pr);
              return (
                <ellipse
                  key={i}
                  cx={px}
                  cy={py}
                  rx="5"
                  ry="10"
                  fill="#9a6418"
                  stroke="#7a4e10"
                  strokeWidth="0.8"
                  transform={`rotate(${i * 30 + 90} ${px} ${py})`}
                />
              );
            })}
            <circle cx="58" cy="26" r="15" fill="#2a1808" stroke="#1a0c06" strokeWidth="1.2" />
            <circle cx="78" cy="28" r="9" fill={sc.ld} stroke={sc.ls} strokeWidth="1" />
            <WeedSprigs />
          </>
        )}
        {sc.sp && <Sparkles cx={86} cy={14} />}
      </g>
    </>
  );
}
function SucculentPlant({ stage, uid }: { stage: Stage; uid: string }) {
  const sc = STAGE[stage];
  const lf = stage === "Thriving" ? "#4a9078" : stage === "Steady" ? "#4d8168" : stage === "Wilting" ? "#8a8a52" : "#276050";
  const ld = stage === "Thriving" ? "#2f6e58" : stage === "Steady" ? "#33604e" : stage === "Wilting" ? "#68682e" : "#164636";
  const ll = stage === "Thriving" ? "#7fd4b6" : "#6cbca4";
  const tip = stage === "Thriving" ? "#d66a6a" : stage === "Steady" ? "#c05c58" : stage === "Wilting" ? "#a8843c" : "#7a3838";
  const ls = sc.ls;
  const cy = 126;
  const cx = 60;
  function Leaf({
    gradKey,
    angle,
    w,
    h,
    fillC,
    tip: showTip = true,
    hl = true,
  }: {
    gradKey: string;
    angle: number;
    w: number;
    h: number;
    fillC: string;
    tip?: boolean;
    hl?: boolean;
  }) {
    const gid = `${uid}-${gradKey}`;
    const sag = sc.droop * (h * 0.12);
    return (
      <g transform={`translate(${cx},${cy}) rotate(${angle + sc.droop * 6})`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ld} />
            <stop offset="42%" stopColor={fillC} />
            <stop offset="100%" stopColor={ld} />
          </linearGradient>
        </defs>
        <path
          d={`M0,0 C${-w * 0.56},${-h * 0.3} ${-w * 0.46},${-h * 0.72 + sag} 0,${-h + sag} C${w * 0.46},${-h * 0.72 + sag} ${w * 0.56},${-h * 0.3} 0,0Z`}
          fill={`url(#${gid})`}
          stroke={ls}
          strokeWidth="0.9"
        />
        {hl && (
          <path
            d={`M0,0 C${-w * 0.18},${-h * 0.28} ${-w * 0.14},${-h * 0.68} 0,${-h * 0.78 + sag} C${w * 0.14},${-h * 0.68} ${w * 0.18},${-h * 0.28} 0,0Z`}
            fill={ll}
            opacity="0.32"
          />
        )}
        {showTip && <circle cx="0" cy={-h + sag} r={w * 0.26} fill={tip} stroke="none" opacity={0.9} />}
        <line x1="0" y1="0" x2="0" y2={-h * 0.86 + sag} stroke={ld} strokeWidth="0.7" opacity="0.4" />
      </g>
    );
  }
  const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const midAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
  const innerAngles = [0, 60, 120, 180, 240, 300];
  const outerH = stage === "Wilting" ? 34 : stage === "Overgrown" ? 44 : 42;
  const midH = stage === "Wilting" ? 26 : 32;
  const innerH = 20;
  return (
    <>
      <Soil />
      <g transform={`translate(60 140) rotate(${sc.tilt * 0.4}) scale(1 ${sc.scale}) translate(-60 -140)`}>
        {outerAngles.map((a, i) => (
          <Leaf key={`o${i}`} gradKey={`o${i}`} angle={a} w={10} h={outerH} fillC={stage === "Wilting" && i % 3 === 0 ? "#a89840" : lf} />
        ))}
        {midAngles.map((a, i) => (
          <Leaf key={`m${i}`} gradKey={`m${i}`} angle={a} w={8} h={midH} fillC={lf} />
        ))}
        {innerAngles.map((a, i) => (
          <Leaf key={`i${i}`} gradKey={`i${i}`} angle={a} w={6} h={innerH} fillC={stage === "Thriving" ? "#63b898" : lf} />
        ))}
        <circle cx={cx} cy={cy - 4} r="5.5" fill={ll} stroke={ls} strokeWidth="0.8" opacity="0.9" />
        <circle cx={cx} cy={cy - 5} r="2.5" fill={tip} opacity="0.75" />
        {stage === "Thriving" && (
          <>
            <line x1={cx} y1={cy - 9} x2={cx} y2={cy - 46} stroke="#7a6040" strokeWidth="1.5" strokeLinecap="round" />
            {[cy - 46, cy - 40, cy - 34].map((fy, i) => (
              <ellipse
                key={i}
                cx={cx + (i % 2 === 0 ? 0 : 4)}
                cy={fy}
                rx="5"
                ry="8"
                fill={i === 0 ? "#e8a33d" : "#f4c766"}
                stroke="#c07820"
                strokeWidth="0.8"
                opacity="0.9"
              />
            ))}
          </>
        )}
        {stage === "Overgrown" && (
          <>
            {[
              [-32, 134],
              [32, 136],
            ].map(([dx, ocy], gi) => (
              <g key={gi} transform={`translate(${cx + dx},${ocy})`}>
                {[0, 90, 180, 270].map((a, i) => (
                  <g key={i} transform={`rotate(${a})`}>
                    <path d="M0,0 C-5,-12 -4,-22 0,-26 C4,-22 5,-12 0,0Z" fill={ld} stroke={ls} strokeWidth="0.8" />
                  </g>
                ))}
                <circle cx={0} cy={-4} r="4" fill={ll} stroke={ls} strokeWidth="0.7" opacity="0.7" />
              </g>
            ))}
            <WeedSprigs />
          </>
        )}
        {sc.sp && <Sparkles cx={94} cy={cy - 40} />}
      </g>
    </>
  );
}
function FernPlant({ stage }: { stage: Stage }) {
  const sc = STAGE[stage];
  function Frond({
    sx,
    sy,
    cx1,
    cy1,
    ex,
    ey,
    flip = false,
    opacity = 1,
  }: {
    sx: number;
    sy: number;
    cx1: number;
    cy1: number;
    ex: number;
    ey: number;
    flip?: boolean;
    opacity?: number;
  }) {
    const pinnaeCount = stage === "Wilting" ? 6 : stage === "Overgrown" ? 11 : 9;
    const dir = flip ? -1 : 1;
    const sag = sc.droop * 22;
    const cy1d = cy1 + sag * 0.5;
    const eyd = ey + sag;
    return (
      <g opacity={opacity}>
        <path
          d={`M${sx},${sy} Q${cx1},${cy1d} ${ex},${eyd}`}
          stroke={sc.st}
          strokeWidth="1.9"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${sx},${sy} Q${cx1},${cy1d} ${ex},${eyd}`}
          stroke={sc.ld}
          strokeWidth="0.7"
          fill="none"
          opacity="0.4"
        />
        {Array.from({ length: pinnaeCount }, (_, i) => {
          const t = (i + 1) / (pinnaeCount + 1);
          const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx1 + t * t * ex;
          const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy1d + t * t * eyd;
          const tx2 = 2 * (1 - t) * (cx1 - sx) + 2 * t * (ex - cx1);
          const ty2 = 2 * (1 - t) * (cy1d - sy) + 2 * t * (eyd - cy1);
          const len = Math.sqrt(tx2 * tx2 + ty2 * ty2) || 1;
          const nx = (-ty2 / len) * dir;
          const ny = (tx2 / len) * dir;
          const taper = 1 - t * 0.45;
          const pLen = (9 - i * 0.35) * (stage === "Wilting" ? 0.68 : 1) * taper;
          const flipPinna = i % 2 === 1;
          const px2 = px + nx * pLen * (flipPinna ? -1 : 1) * 0.5;
          const py2 = py + ny * pLen * (flipPinna ? -1 : 1) * 0.5;
          const pinnaAngle = rc((Math.atan2(ny, nx) * 180) / Math.PI + (flipPinna ? -30 : -150));
          return (
            <ellipse
              key={i}
              cx={px2}
              cy={py2}
              rx={pLen * 0.52}
              ry={pLen * 0.24}
              fill={i % 2 === 0 ? sc.lf : sc.ld}
              stroke={sc.ls}
              strokeWidth="0.7"
              transform={`rotate(${pinnaAngle} ${px2} ${py2})`}
              opacity={stage === "Wilting" ? 0.72 : 1}
            />
          );
        })}
      </g>
    );
  }
  type FrondDef = { sx: number; sy: number; cx1: number; cy1: number; ex: number; ey: number; flip: boolean; op: number };
  const fronds: FrondDef[] =
    stage === "Wilting"
      ? [
          { sx: 60, sy: 140, cx1: 76, cy1: 122, ex: 96, ey: 124, flip: false, op: 0.85 },
          { sx: 60, sy: 140, cx1: 44, cy1: 122, ex: 24, ey: 124, flip: true, op: 0.85 },
          { sx: 60, sy: 140, cx1: 80, cy1: 104, ex: 92, ey: 114, flip: false, op: 0.7 },
          { sx: 60, sy: 140, cx1: 40, cy1: 104, ex: 28, ey: 114, flip: true, op: 0.7 },
          { sx: 60, sy: 140, cx1: 62, cy1: 118, ex: 60, ey: 128, flip: false, op: 0.6 },
        ]
      : stage === "Overgrown"
        ? [
            { sx: 60, sy: 140, cx1: 94, cy1: 106, ex: 118, ey: 76, flip: false, op: 1 },
            { sx: 60, sy: 140, cx1: 26, cy1: 106, ex: 2, ey: 76, flip: true, op: 1 },
            { sx: 60, sy: 140, cx1: 90, cy1: 80, ex: 104, ey: 44, flip: false, op: 0.92 },
            { sx: 60, sy: 140, cx1: 30, cy1: 80, ex: 16, ey: 44, flip: true, op: 0.92 },
            { sx: 60, sy: 140, cx1: 63, cy1: 76, ex: 63, ey: 32, flip: false, op: 1 },
            { sx: 60, sy: 140, cx1: 78, cy1: 60, ex: 92, ey: 24, flip: false, op: 0.8 },
            { sx: 60, sy: 140, cx1: 42, cy1: 60, ex: 28, ey: 24, flip: true, op: 0.8 },
          ]
        : [
            { sx: 60, sy: 140, cx1: 90, cy1: 106, ex: 112, ey: 68, flip: false, op: 1 },
            { sx: 60, sy: 140, cx1: 30, cy1: 106, ex: 8, ey: 68, flip: true, op: 1 },
            { sx: 60, sy: 140, cx1: 87, cy1: 78, ex: 98, ey: 36, flip: false, op: 0.92 },
            { sx: 60, sy: 140, cx1: 33, cy1: 78, ex: 22, ey: 36, flip: true, op: 0.92 },
            { sx: 60, sy: 140, cx1: 60, cy1: 72, ex: 60, ey: 24, flip: false, op: 1 },
          ];
  return (
    <>
      <Soil />
      <g transform={`translate(60 140) rotate(${sc.tilt}) scale(1 ${sc.scale}) translate(-60 -140)`}>
        {fronds.map((f, i) => (
          <Frond key={i} {...f} />
        ))}
        <ellipse cx="60" cy="140" rx="8" ry="5" fill={sc.ld} opacity="0.75" />
        <ellipse cx="60" cy="138" rx="4.5" ry="2.6" fill={sc.ll} opacity="0.4" />
        {sc.wd && <WeedSprigs />}
        {sc.sp && <Sparkles cx={108} cy={50} />}
      </g>
    </>
  );
}
function BerryPlant({ stage, uid }: { stage: Stage; uid: string }) {
  const sc = STAGE[stage];
  const bc = stage === "Thriving" ? "#8b3f6b" : stage === "Steady" ? "#7a3d60" : stage === "Wilting" ? "#8a7448" : "#4a3040";
  const bh = stage === "Thriving" ? "#c878a8" : "#a06878";
  const bkw = stage === "Thriving" ? 1 : stage === "Steady" ? 0.9 : 0.75;
  function BushMass() {
    if (stage === "Wilting")
      return (
        <>
          <ellipse cx="60" cy="112" rx="34" ry="24" fill={sc.ld} stroke={sc.ls} strokeWidth="1.1" opacity="0.9" />
          <ellipse cx="44" cy="104" rx="22" ry="19" fill={sc.lf} stroke={sc.ls} strokeWidth="1" />
          <ellipse cx="76" cy="108" rx="20" ry="17" fill={sc.lf} stroke={sc.ls} strokeWidth="1" opacity="0.85" />
          <ellipse cx="60" cy="94" rx="18" ry="13" fill={sc.ll} stroke={sc.ls} strokeWidth="0.9" opacity="0.5" />
        </>
      );
    if (stage === "Overgrown")
      return (
        <>
          <ellipse cx="60" cy="112" rx="50" ry="38" fill={sc.ld} stroke={sc.ls} strokeWidth="1.2" />
          <ellipse cx="38" cy="98" rx="33" ry="29" fill={sc.lf} stroke={sc.ls} strokeWidth="1.1" />
          <ellipse cx="82" cy="96" rx="31" ry="27" fill={sc.lf} stroke={sc.ls} strokeWidth="1.1" />
          <ellipse cx="60" cy="80" rx="29" ry="23" fill={sc.lf} stroke={sc.ls} strokeWidth="1" />
          <ellipse cx="60" cy="65" rx="19" ry="15" fill={sc.lf} stroke={sc.ls} strokeWidth="0.9" />
          <path d="M60,80 C60,63 64,50 62,40" stroke={sc.st} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <ellipse cx="62" cy="36" rx="14" ry="12" fill={sc.ld} stroke={sc.ls} strokeWidth="0.9" />
          <ellipse cx="60" cy="98" rx="14" ry="10" fill={sc.ll} opacity="0.28" />
        </>
      );
    return (
      <>
        <ellipse cx="60" cy="112" rx="43" ry="35" fill={sc.ld} stroke={sc.ls} strokeWidth="1.1" />
        <ellipse cx="40" cy="98" rx="29" ry="26" fill={sc.lf} stroke={sc.ls} strokeWidth="1" />
        <ellipse cx="80" cy="98" rx="29" ry="26" fill={sc.lf} stroke={sc.ls} strokeWidth="1" />
        <ellipse cx="60" cy="82" rx="27" ry="22" fill={sc.lf} stroke={sc.ls} strokeWidth="1" />
        <ellipse cx="60" cy="94" rx="20" ry="17" fill={sc.ll} stroke={sc.ls} strokeWidth="0.8" opacity="0.42" />
        <ellipse cx="46" cy="86" rx="9" ry="7" fill={sc.ll} opacity="0.28" />
      </>
    );
  }
  const berries: [number, number][] =
    stage === "Thriving"
      ? [
          [42, 102], [52, 108], [38, 110], [56, 98], [64, 104], [72, 100], [68, 112], [80, 108], [58, 88], [66, 84],
          [46, 92], [74, 92], [60, 116], [38, 94], [82, 100],
        ]
      : stage === "Steady"
        ? [
            [44, 104], [54, 110], [40, 112], [58, 100], [66, 106], [70, 102], [66, 114], [78, 110], [60, 90], [68, 86],
          ]
        : stage === "Wilting"
          ? [
              [52, 106], [62, 112], [72, 106], [58, 98], [68, 110],
            ]
          : [
              [50, 108], [70, 108], [42, 100], [78, 100], [36, 94], [84, 94], [60, 82], [60, 116], [44, 114], [76, 116],
            ];
  return (
    <>
      <Soil />
      <g transform={`translate(60 140) rotate(${sc.tilt}) scale(1 ${sc.scale}) translate(-60 -140)`}>
        <path d="M60,140 C58,132 60,124 60,118" stroke={sc.st} strokeWidth="5" fill="none" strokeLinecap="round" />
        <BushMass />
        {berries.map(([bx, by], i) => {
          const gid = `${uid}-berry-${i}`;
          return (
            <g key={i}>
              <defs>
                <radialGradient id={gid} cx="34%" cy="28%" r="72%">
                  <stop offset="0%" stopColor={bh} />
                  <stop offset="100%" stopColor={bc} />
                </radialGradient>
              </defs>
              <circle cx={bx} cy={by} r={5 * bkw} fill={`url(#${gid})`} stroke="#4a1a38" strokeWidth="0.7" />
              <circle cx={bx - 1.2} cy={by - 1.2} r={1.4 * bkw} fill="rgba(255,255,255,0.5)" />
              <line x1={bx} y1={by - 5 * bkw} x2={bx} y2={by - 5 * bkw - 3} stroke={sc.st} strokeWidth="0.8" />
              <path
                d={`M${bx - 1.6 * bkw},${by - 4.6 * bkw} L${bx},${by - 6 * bkw} L${bx + 1.6 * bkw},${by - 4.6 * bkw}`}
                stroke={sc.ld}
                strokeWidth="0.6"
                fill="none"
                opacity="0.6"
              />
            </g>
          );
        })}
        <path d="M46,90 C48,84 54,82 56,86" stroke={sc.ld} strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M74,90 C76,84 80,83 80,87" stroke={sc.ld} strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M58,78 C60,72 64,71 64,76" stroke={sc.ld} strokeWidth="0.8" fill="none" opacity="0.4" />
        {sc.wd && <WeedSprigs />}
        {sc.sp && <Sparkles cx={88} cy={72} />}
      </g>
    </>
  );
}
const SPECIES_MAP: Record<PlantSpecies, Species> = {
  tomato: "Tomato",
  sunflower: "Sunflower",
  succulent: "Succulent",
  fern: "Fern",
  "berry-bush": "Berry",
};
const STAGE_MAP: Record<PlantGrowthStage, Stage> = {
  thriving: "Thriving",
  steady: "Steady",
  wilting: "Wilting",
  overgrown: "Overgrown",
};
const stageLabel: Record<PlantGrowthStage, string> = {
  thriving: "Thriving",
  steady: "Steady",
  wilting: "Wilting",
  overgrown: "Overgrown",
};
const stageLabelColor: Record<PlantGrowthStage, string> = {
  thriving: "#32562f",
  steady: "#4a6e8f",
  wilting: "#7a6020",
  overgrown: "#2a5025",
};
function Plant({ species, stage, uid }: { species: Species; stage: Stage; uid: string }) {
  switch (species) {
    case "Tomato":
      return <TomatoPlant stage={stage} uid={uid} />;
    case "Sunflower":
      return <SunflowerPlant stage={stage} uid={uid} />;
    case "Succulent":
      return <SucculentPlant stage={stage} uid={uid} />;
    case "Fern":
      return <FernPlant stage={stage} />;
    case "Berry":
      return <BerryPlant stage={stage} uid={uid} />;
  }
}
interface PlantIllustrationProps {
  species: PlantSpecies;
  stage: PlantGrowthStage;
  size?: number;
  showLabel?: boolean;
}
export function PlantIllustration({ species, stage, size = 96, showLabel = false }: PlantIllustrationProps) {
  const prefersReducedMotion = useReducedMotion();
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = size * (160 / 120);
  const mappedSpecies = SPECIES_MAP[species];
  const mappedStage = STAGE_MAP[stage];
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: h }}>
        <AnimatePresence initial={false}>
          <motion.svg
            key={stage}
            viewBox="0 0 120 160"
            width={size}
            height={h}
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
            role="img"
            aria-label={`${species.replace("-", " ")} plant — ${stageLabel[stage]}`}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Plant species={mappedSpecies} stage={mappedStage} uid={`p${rawId}-${stage}`} />
          </motion.svg>
        </AnimatePresence>
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            color: stageLabelColor[stage],
            textTransform: "capitalize",
            letterSpacing: "0.03em",
          }}
        >
          {stageLabel[stage]}
        </span>
      )}
    </div>
  );
}