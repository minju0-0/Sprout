"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PlantGrowthStage, PlantSpecies } from "@/types";

interface PlantIllustrationProps {
  species: PlantSpecies;
  stage: PlantGrowthStage;
  size?: number;
  showLabel?: boolean;
}

/* ─── shared palette per stage ─────────────────────────────────────────── */
const stageColors = {
  thriving: {
    stemStroke: "#3d7a38",
    leafFill: "#4a8a42",
    leafFill2: "#3a6e32",
    leafVein: "#2d5828",
    soilFill: "#7a6050",
    soilFill2: "#5b4636",
  },
  steady: {
    stemStroke: "#5a8a45",
    leafFill: "#6a9450",
    leafFill2: "#527540",
    leafVein: "#3d5e2d",
    soilFill: "#7a6050",
    soilFill2: "#5b4636",
  },
  wilting: {
    stemStroke: "#8a8a50",
    leafFill: "#a0a048",
    leafFill2: "#8a8030",
    leafVein: "#6b6820",
    soilFill: "#7a6050",
    soilFill2: "#5b4636",
  },
  overgrown: {
    stemStroke: "#2a5a25",
    leafFill: "#2e6628",
    leafFill2: "#204d1a",
    leafVein: "#183d12",
    soilFill: "#6a5040",
    soilFill2: "#4a3828",
  },
} as const;

function Soil({ sc }: { sc: (typeof stageColors)[keyof typeof stageColors] }) {
  return (
    <>
      <ellipse cx="60" cy="148" rx="50" ry="10" fill={sc.soilFill} opacity="0.55" />
      <ellipse cx="60" cy="152" rx="42" ry="7" fill={sc.soilFill2} opacity="0.45" />
    </>
  );
}

/* ─── TOMATO — vine-staked, compound leaves, round fruit ───────────────── */
function TomatoPlant({ stage }: { stage: PlantGrowthStage }) {
  const sc = stageColors[stage];
  const wilting = stage === "wilting";
  const thriving = stage === "thriving";
  const overgrown = stage === "overgrown";

  const stemPath = wilting
    ? "M60 147 C58 128 62 108 54 88 C48 70 52 52 46 34"
    : "M60 147 C58 128 64 106 58 86 C53 66 60 46 58 26";

  return (
    <g>
      <Soil sc={sc} />
      <path d={stemPath} stroke={sc.stemStroke} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {!wilting && (
        <path
          d={overgrown ? "M56 66 C70 58 80 52 86 42" : "M57 68 C70 62 78 56 82 46"}
          stroke={sc.stemStroke}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      )}
      <path
        d={wilting ? "M54 95 C42 94 34 90 28 90" : "M58 94 C46 88 36 82 30 72"}
        stroke={sc.stemStroke}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {!wilting && (
        <g transform={`translate(${overgrown ? 82 : 78},${overgrown ? 38 : 44})`}>
          <path d="M0 0 C-5 -5 -7 -13 -3 -19 C1 -24 7 -23 9 -18 C13 -10 8 -4 0 0Z" fill={sc.leafFill} />
          <line x1="0" y1="0" x2="3" y2="-18" stroke={sc.leafVein} strokeWidth="0.8" />
          <path d="M-4 -8 C-9 -9 -14 -7 -15 -3 C-16 1 -12 4 -8 2 C-4 0 -3 -4 -4 -8Z" fill={sc.leafFill2} />
          <path d="M6 -10 C11 -11 15 -8 15 -4 C15 0 11 2 8 1 C4 -1 5 -6 6 -10Z" fill={sc.leafFill2} />
        </g>
      )}
      <g transform={`translate(${wilting ? 26 : 28},${wilting ? 90 : 72})`}>
        <path d="M0 0 C-5 -6 -6 -14 -2 -19 C2 -24 8 -22 9 -17 C11 -9 7 -3 0 0Z" fill={sc.leafFill} />
        <line x1="0" y1="0" x2="4" y2="-17" stroke={sc.leafVein} strokeWidth="0.8" />
        <path d="M-3 -9 C-8 -10 -12 -8 -12 -4 C-12 0 -8 2 -5 1 C-2 -1 -2 -5 -3 -9Z" fill={sc.leafFill2} />
        <path d="M6 -11 C10 -12 14 -9 13 -5 C12 -1 9 1 6 0 C3 -2 4 -7 6 -11Z" fill={sc.leafFill2} />
      </g>
      <g transform="translate(60,118)">
        <path d="M0 0 C5 -4 10 -4 11 0 C12 4 8 7 4 6 C0 5 -2 2 0 0Z" fill={sc.leafFill2} opacity="0.8" />
        <path d="M0 0 C-5 -4 -10 -4 -11 0 C-12 4 -8 7 -4 6 C0 5 2 2 0 0Z" fill={sc.leafFill2} opacity="0.8" />
      </g>
      {thriving && (
        <>
          <circle cx="82" cy="55" r="11" fill="#c0392b" />
          <circle cx="82" cy="55" r="5.5" fill="#e74c3c" opacity="0.25" />
          <circle cx="79" cy="51" r="2" fill="#e87066" opacity="0.4" />
          <path
            d="M78 46 C80 43 82 42 84 43 L83 46 C85 43 87 43 88 45 L86 47"
            fill="none"
            stroke={sc.leafFill}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="30" cy="77" r="9" fill="#b8342e" />
          <circle cx="28" cy="74" r="1.8" fill="#e07070" opacity="0.35" />
          <path
            d="M27 69 C29 67 30 66 32 67 L31 69 C33 67 34 67 35 68 L34 70"
            fill="none"
            stroke={sc.leafFill}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      )}
      {stage === "steady" && <circle cx="80" cy="50" r="9" fill="#b8342e" opacity="0.85" />}
      {overgrown && (
        <>
          <circle cx="84" cy="44" r="11" fill="#c0392b" />
          <circle cx="72" cy="58" r="9" fill="#b8342e" />
          <circle cx="28" cy="76" r="8" fill="#b8342e" />
          <g className="weed-sway" style={{ transformOrigin: "50px 148px" }}>
            <path d="M50 148 C48 134 44 128 40 120" stroke="#4a6e40" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M40 120 C36 114 32 116 30 110" stroke="#4a6e40" strokeWidth="1.6" fill="none" />
            <ellipse cx="29" cy="108" rx="6" ry="4" fill="#3a5e30" transform="rotate(-20 29 108)" />
          </g>
          <g className="weed-sway" style={{ transformOrigin: "70px 148px", animationDelay: "0.8s" }}>
            <path d="M70 148 C72 136 76 130 80 122" stroke="#4a6e40" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="82" cy="119" rx="7" ry="4.5" fill="#3a5e30" transform="rotate(25 82 119)" />
          </g>
        </>
      )}
      {wilting && (
        <g opacity="0.8">
          <path d="M54 110 C50 108 44 112 42 116" stroke="#a0a048" strokeWidth="1.8" fill="none" />
          <path d="M50 82 C46 80 40 82 38 88" stroke="#a0a048" strokeWidth="1.8" fill="none" />
          <line x1="42" y1="147" x2="44" y2="143" stroke="#8a6040" strokeWidth="1" opacity="0.4" />
          <line x1="68" y1="147" x2="70" y2="143" stroke="#8a6040" strokeWidth="1" opacity="0.4" />
        </g>
      )}
      {thriving && (
        <g transform="translate(58,24)">
          <circle cx="0" cy="0" r="4.5" fill="#f5c930" />
          <circle cx="0" cy="0" r="2" fill="#c07820" />
          <circle cx="0" cy="-6" r="2.5" fill="#f5c930" />
          <circle cx="5.2" cy="-3" r="2.5" fill="#f5c930" />
          <circle cx="5.2" cy="3" r="2.5" fill="#f5c930" />
          <circle cx="0" cy="6" r="2.5" fill="#f5c930" />
          <circle cx="-5.2" cy="3" r="2.5" fill="#f5c930" />
          <circle cx="-5.2" cy="-3" r="2.5" fill="#f5c930" />
        </g>
      )}
    </g>
  );
}

/* ─── SUNFLOWER — tall, single head, big oval petals ────────────────────── */
function SunflowerPlant({ stage }: { stage: PlantGrowthStage }) {
  const sc = stageColors[stage];
  const wilting = stage === "wilting";
  const thriving = stage === "thriving";
  const overgrown = stage === "overgrown";
  const headY = wilting ? 40 : 26;
  const stemPath = wilting
    ? `M60 147 C60 120 58 95 52 70 C48 55 45 ${headY + 14} 42 ${headY}`
    : `M60 147 C60 118 60 90 60 65 C60 50 60 ${headY + 12} 60 ${headY}`;

  const LeafLeft = ({ y, angle }: { y: number; angle: number }) => (
    <g transform={`translate(${wilting ? 52 : 58},${y}) rotate(${angle})`}>
      <path
        d="M0 0 C-8 -4 -16 -3 -20 2 C-24 7 -22 15 -16 18 C-10 21 -4 17 -2 12 C0 8 2 4 0 0Z"
        fill={sc.leafFill}
      />
      <path d="M0 0 C-6 4 -10 10 -14 15" stroke={sc.leafVein} strokeWidth="0.9" fill="none" strokeLinecap="round" />
    </g>
  );
  const LeafRight = ({ y, angle }: { y: number; angle: number }) => (
    <g transform={`translate(${wilting ? 66 : 62},${y}) rotate(${angle})`}>
      <path
        d="M0 0 C8 -4 16 -3 20 2 C24 7 22 15 16 18 C10 21 4 17 2 12 C0 8 -2 4 0 0Z"
        fill={sc.leafFill}
      />
      <path d="M0 0 C6 4 10 10 14 15" stroke={sc.leafVein} strokeWidth="0.9" fill="none" strokeLinecap="round" />
    </g>
  );

  const petalColor = thriving ? "#f0b429" : stage === "steady" ? "#e8a33d" : wilting ? "#c89030" : "#d4a030";
  const centerColor = thriving ? "#3a2010" : "#4a3018";
  const headX = wilting ? 42 : 60;
  const petals = Array.from({ length: 14 }, (_, i) => {
    const angle = (i * 360) / 14;
    const rad = (angle * Math.PI) / 180;
    return { angle, px: headX + Math.cos(rad) * 14, py: headY + Math.sin(rad) * 14 };
  });

  return (
    <g>
      <Soil sc={sc} />
      <path d={stemPath} stroke={sc.stemStroke} strokeWidth="4" fill="none" strokeLinecap="round" />
      <LeafLeft y={90} angle={-30} />
      <LeafRight y={100} angle={20} />
      <LeafLeft y={118} angle={-15} />
      <LeafRight y={128} angle={10} />
      {petals.map(({ angle, px, py }, i) => (
        <ellipse
          key={i}
          cx={px}
          cy={py}
          rx="5.5"
          ry="9"
          fill={petalColor}
          transform={`rotate(${angle + 90} ${px} ${py})`}
          opacity={wilting ? 0.7 : 1}
        />
      ))}
      <circle cx={headX} cy={headY} r="12" fill={centerColor} />
      {Array.from({ length: 20 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const r = Math.sqrt(i) * 2.5;
        return <circle key={i} cx={headX + Math.cos(a) * r} cy={headY + Math.sin(a) * r} r="1.2" fill="#5a3820" opacity="0.7" />;
      })}
      {wilting && <path d="M42 40 C38 44 36 48 38 52" stroke="#9a8040" strokeWidth="1.5" fill="none" opacity="0.5" />}
      {overgrown && (
        <>
          <path d="M60 90 C70 82 78 76 82 68" stroke={sc.stemStroke} strokeWidth="2.5" fill="none" />
          <circle cx="84" cy="64" r="8" fill={centerColor} />
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i * 36 * Math.PI) / 180;
            return (
              <ellipse
                key={i}
                cx={84 + Math.cos(a) * 10}
                cy={64 + Math.sin(a) * 10}
                rx="4"
                ry="7"
                fill={petalColor}
                opacity="0.85"
                transform={`rotate(${i * 36 + 90} ${84 + Math.cos(a) * 10} ${64 + Math.sin(a) * 10})`}
              />
            );
          })}
          <g className="weed-sway">
            <path d="M46 148 C44 136 40 128 36 120" stroke="#3a6030" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="34" cy="117" rx="7" ry="4.5" fill="#2e5028" transform="rotate(-15 34 117)" />
          </g>
        </>
      )}
    </g>
  );
}

/* ─── SUCCULENT — low rosette of plump leaves ───────────────────────────── */
function SucculentPlant({ stage }: { stage: PlantGrowthStage }) {
  const sc = stageColors[stage];
  const wilting = stage === "wilting";
  const overgrown = stage === "overgrown";
  const rosetteCy = 128;
  const baseGreen =
    stage === "thriving" ? "#5a9e7a" : stage === "steady" ? "#6aaa82" : wilting ? "#8a9a60" : "#3e7058";
  const midGreen =
    stage === "thriving" ? "#4a8468" : stage === "steady" ? "#5a8e72" : wilting ? "#7a8a50" : "#2e5a44";
  const tipColor = stage === "thriving" ? "#f08050" : stage === "steady" ? "#d07040" : "#9a7040";
  const highlight = "rgba(255,255,255,0.35)";
  const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const innerAngles = [22, 67, 112, 157, 202, 247, 292, 337];

  const Leaf = ({
    cx,
    cy,
    angle,
    rx,
    ry,
    fill,
  }: {
    cx: number;
    cy: number;
    angle: number;
    rx: number;
    ry: number;
    fill: string;
  }) => (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy - ry * 0.5} rx={rx} ry={ry} fill={fill} />
      <ellipse cx={cx} cy={cy - ry * 0.5 - ry * 0.15} rx={rx * 0.35} ry={ry * 0.3} fill={highlight} />
      <circle cx={cx} cy={cy - ry} r="2" fill={tipColor} />
    </g>
  );

  return (
    <g>
      <Soil sc={sc} />
      {outerAngles.map((angle, i) => (
        <Leaf
          key={i}
          cx={60 + Math.cos(((angle - 90) * Math.PI) / 180) * 22}
          cy={rosetteCy + Math.sin(((angle - 90) * Math.PI) / 180) * 10}
          angle={angle}
          rx={wilting ? 6 : 7}
          ry={wilting ? 12 : 15}
          fill={sc.leafFill}
        />
      ))}
      {innerAngles.map((angle, i) => (
        <Leaf
          key={i}
          cx={60 + Math.cos(((angle - 90) * Math.PI) / 180) * 12}
          cy={rosetteCy + Math.sin(((angle - 90) * Math.PI) / 180) * 6}
          angle={angle}
          rx={wilting ? 5 : 6}
          ry={wilting ? 10 : 12}
          fill={midGreen}
        />
      ))}
      <circle cx="60" cy={rosetteCy - 2} r={wilting ? 4 : 5} fill={baseGreen} />
      <circle cx="60" cy={rosetteCy - 3} r="2" fill={highlight} />
      {stage === "thriving" && (
        <g transform={`translate(60,${rosetteCy - 22})`}>
          <line x1="0" y1="0" x2="0" y2="-20" stroke="#7a9a60" strokeWidth="1.5" />
          <circle cx="0" cy="-22" r="4" fill="#f0c030" />
          <circle cx="0" cy="-22" r="2" fill="#c08020" />
          <circle cx="0" cy="-28" r="3" fill="#f0c030" />
          <circle cx="5.2" cy="-25" r="3" fill="#f0c030" />
          <circle cx="-5.2" cy="-25" r="3" fill="#f0c030" />
        </g>
      )}
      {overgrown && (
        <>
          <g transform="translate(82,132)">
            {[0, 60, 120, 180, 240, 300].map((a, i) => (
              <Leaf
                key={i}
                cx={Math.cos(((a - 90) * Math.PI) / 180) * 10}
                cy={Math.sin(((a - 90) * Math.PI) / 180) * 5}
                angle={a}
                rx={5}
                ry={10}
                fill={sc.leafFill2}
              />
            ))}
          </g>
          <g transform="translate(36,136)">
            {[0, 72, 144, 216, 288].map((a, i) => (
              <Leaf
                key={i}
                cx={Math.cos(((a - 90) * Math.PI) / 180) * 9}
                cy={Math.sin(((a - 90) * Math.PI) / 180) * 4}
                angle={a}
                rx={4.5}
                ry={9}
                fill={sc.leafFill2}
              />
            ))}
          </g>
        </>
      )}
      {wilting &&
        [45, 225].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 60 ${rosetteCy}) translate(0,4)`}>
            <ellipse
              cx={60 + Math.cos(((angle - 90) * Math.PI) / 180) * 22}
              cy={rosetteCy + Math.sin(((angle - 90) * Math.PI) / 180) * 10}
              rx="5"
              ry="11"
              fill="#b8a840"
              opacity="0.7"
              transform={`rotate(${angle} ${60 + Math.cos(((angle - 90) * Math.PI) / 180) * 22} ${
                rosetteCy + Math.sin(((angle - 90) * Math.PI) / 180) * 10
              })`}
            />
          </g>
        ))}
    </g>
  );
}

/* ─── FERN — arching pinnate fronds ──────────────────────────────────────── */
function FernPlant({ stage }: { stage: PlantGrowthStage }) {
  const sc = stageColors[stage];
  const wilting = stage === "wilting";
  const overgrown = stage === "overgrown";

  const Frond = ({
    startX,
    startY,
    controlX,
    endX,
    endY,
    flip,
    opacity = 1,
  }: {
    startX: number;
    startY: number;
    controlX: number;
    endX: number;
    endY: number;
    flip?: boolean;
    opacity?: number;
  }) => {
    const pinnaeCount = wilting ? 6 : 9;
    const scale = flip ? -1 : 1;
    return (
      <g opacity={opacity}>
        <path
          d={`M${startX} ${startY} Q${controlX} ${(startY + endY) / 2} ${endX} ${endY}`}
          stroke={sc.stemStroke}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        {Array.from({ length: pinnaeCount }, (_, i) => {
          const t = (i + 1) / (pinnaeCount + 1);
          const px = startX + (endX - startX) * t + (controlX - startX) * t * (1 - t) * 2;
          const py = startY + (endY - startY) * t + ((startY + endY) / 2 - startY) * t * (1 - t) * 2;
          const leafAngle = (-40 + t * 30) * scale;
          return (
            <g key={i} transform={`translate(${px},${py}) rotate(${leafAngle})`}>
              <ellipse cx={scale * 8} cy="0" rx="9" ry="4" fill={i % 2 === 0 ? sc.leafFill : sc.leafFill2} opacity="0.95" />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <g>
      <Soil sc={sc} />
      <ellipse cx="60" cy="142" rx="8" ry="6" fill={sc.leafFill2} />
      <Frond startX={60} startY={140} controlX={90} endX={105} endY={80} />
      <Frond startX={60} startY={140} controlX={30} endX={15} endY={80} flip />
      <Frond startX={60} startY={140} controlX={85} endX={88} endY={50} opacity={wilting ? 0.6 : 0.9} />
      <Frond startX={60} startY={140} controlX={35} endX={32} endY={50} flip opacity={wilting ? 0.6 : 0.9} />
      <Frond startX={60} startY={140} controlX={62} endX={60} endY={30} opacity={wilting ? 0.5 : 1} />
      {overgrown && (
        <>
          <Frond startX={60} startY={140} controlX={108} endX={116} endY={100} />
          <Frond startX={60} startY={140} controlX={12} endX={4} endY={100} flip />
          <g className="weed-sway">
            <path d="M70 148 C72 134 78 126 84 118" stroke="#2d5820" strokeWidth="2" fill="none" />
            <ellipse cx="86" cy="115" rx="6" ry="4" fill="#224818" transform="rotate(20 86 115)" />
          </g>
        </>
      )}
      {wilting && <path d="M60 140 Q62 128 68 116" stroke="#9a9040" strokeWidth="1.5" fill="none" opacity="0.6" />}
    </g>
  );
}

/* ─── BERRY BUSH — rounded, layered lobes, berry clusters ───────────────── */
function BerryBushPlant({ stage }: { stage: PlantGrowthStage }) {
  const sc = stageColors[stage];
  const wilting = stage === "wilting";
  const overgrown = stage === "overgrown";
  const thriving = stage === "thriving";
  const berryColor = thriving ? "#7a3a8a" : stage === "steady" ? "#8b4a7a" : "#4a2850";
  const berryHighlight = thriving ? "#c070d0" : "#9060a0";
  const bushColor = sc.leafFill;
  const bushColor2 = sc.leafFill2;

  return (
    <g>
      <Soil sc={sc} />
      <path d="M60 148 C58 138 60 130 60 122" stroke={sc.stemStroke} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="108" rx={overgrown ? 44 : 36} ry={overgrown ? 36 : 30} fill={bushColor2} />
      <ellipse cx="44" cy="96" rx="26" ry="22" fill={bushColor} />
      <ellipse cx="76" cy="96" rx="26" ry="22" fill={bushColor} />
      <ellipse cx="60" cy="82" rx="24" ry="20" fill={bushColor} />
      <ellipse cx="60" cy="94" rx="20" ry="18" fill={bushColor} opacity="0.8" />
      <path d="M36 100 C38 94 44 92 46 96" stroke={sc.leafVein} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M74 100 C76 94 80 93 80 97" stroke={sc.leafVein} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M52 80 C54 74 60 73 62 78" stroke={sc.leafVein} strokeWidth="1" fill="none" opacity="0.5" />
      {(thriving || stage === "steady") &&
        [
          [42, 102], [50, 108], [38, 110], [56, 98], [64, 104],
          [72, 100], [68, 112], [80, 108], [58, 88], [66, 84],
        ].map(([bx, by], i) => (
          <g key={i}>
            <circle cx={bx} cy={by} r="4.5" fill={berryColor} />
            <circle cx={bx - 1} cy={by - 1} r="1.5" fill={berryHighlight} opacity="0.5" />
            <circle cx={bx} cy={by - 4.5} r="1" fill={sc.leafFill} />
          </g>
        ))}
      {overgrown && (
        <>
          {[
            [28, 104], [92, 104], [36, 88], [84, 88], [60, 68],
            [42, 102], [78, 102], [50, 118], [70, 116],
          ].map(([bx, by], i) => (
            <g key={i}>
              <circle cx={bx} cy={by} r="4.5" fill="#5a2068" />
              <circle cx={bx - 1} cy={by - 1} r="1.5" fill="#9050b0" opacity="0.5" />
            </g>
          ))}
          <path d="M60 122 C80 118 95 108 100 96" stroke={sc.stemStroke} strokeWidth="2.5" fill="none" />
          <ellipse cx="104" cy="90" rx="18" ry="16" fill={bushColor2} />
        </>
      )}
      {wilting && (
        <>
          <ellipse cx="60" cy="108" rx="36" ry="30" fill="#8a8a50" opacity="0.35" />
          <path d="M44 88 C40 96 36 104 36 110" stroke="#9a9040" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M76 88 C80 96 84 104 84 110" stroke="#9a9040" strokeWidth="1.5" fill="none" opacity="0.5" />
        </>
      )}
    </g>
  );
}

/* ─── stage label ─────────────────────────────────────────────────────────*/
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

function Plant({ species, stage }: { species: PlantSpecies; stage: PlantGrowthStage }) {
  switch (species) {
    case "tomato":
      return <TomatoPlant stage={stage} />;
    case "sunflower":
      return <SunflowerPlant stage={stage} />;
    case "succulent":
      return <SucculentPlant stage={stage} />;
    case "fern":
      return <FernPlant stage={stage} />;
    case "berry-bush":
      return <BerryBushPlant stage={stage} />;
  }
}

/* ─── main component ──────────────────────────────────────────────────────
   Self-contained illustrated plant: its own <svg>, its own soil, one of 4
   discrete growth-stage illustrations per species. Crossfades between
   stages on change (e.g. thriving -> wilting after an overspend), gated
   behind prefers-reduced-motion like every other animation in the app. */
export function PlantIllustration({ species, stage, size = 96, showLabel = false }: PlantIllustrationProps) {
  const prefersReducedMotion = useReducedMotion();
  const h = size * (160 / 120);

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
            <Plant species={species} stage={stage} />
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