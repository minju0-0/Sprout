// Purely decorative illustrated backdrop for the garden bed — sky, sun,
// hills, grass texture, and small scattered details. Sits absolutely
// positioned behind the plant rows (z-0) so it never competes with the
// real budget-driven plant art on top (z-10). Built from the same palette
// tokens already used elsewhere (moss/marigold/sky/clay/soil) — no new
// colors invented, per the Image/Styling rules. Entirely aria-hidden since
// it carries no information of its own.
export function GardenBedBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 800 400"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="gardenSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf2fb" />
          <stop offset="65%" stopColor="#e4ecda" />
          <stop offset="100%" stopColor="#d9e2c4" />
        </linearGradient>
        <linearGradient id="gardenGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d7e0bd" />
          <stop offset="100%" stopColor="#cbd6ac" />
        </linearGradient>
        <pattern
          id="grassBlades"
          width="40"
          height="22"
          patternUnits="userSpaceOnUse"
          patternTransform="translate(0,0)"
        >
          <path d="M4,22 C3,15 6,10 5,4" stroke="#8fae7c" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M14,22 C15,14 12,11 14,5" stroke="#7a9a68" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M24,22 C23,16 26,12 25,6" stroke="#8fae7c" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.45" />
          <path d="M33,22 C34,15 31,10 33,4" stroke="#7a9a68" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5" />
        </pattern>
        <radialGradient id="gardenSunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4c766" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f4c766" stopOpacity="0" />
        </radialGradient>
      </defs>
      {}
      <rect x="0" y="0" width="800" height="150" fill="url(#gardenSky)" />
      {}
      <circle cx="706" cy="46" r="60" fill="url(#gardenSunGlow)" />
      <circle cx="706" cy="46" r="22" fill="#e8a33d" />
      {}
      <g opacity="0.55" fill="#ffffff">
        <ellipse cx="150" cy="42" rx="30" ry="11" />
        <ellipse cx="176" cy="36" rx="22" ry="9" />
        <ellipse cx="126" cy="38" rx="20" ry="8" />
        <ellipse cx="330" cy="60" rx="24" ry="8" />
        <ellipse cx="352" cy="55" rx="17" ry="7" />
      </g>
      {}
      <g className="weed-sway" style={{ transformOrigin: "60px 90px" }}>
        <g transform="translate(60,88)">
          <ellipse cx="-4" cy="-2" rx="5" ry="3.5" fill="#8b5e6b" opacity="0.75" transform="rotate(-20 -4 -2)" />
          <ellipse cx="4" cy="-2" rx="5" ry="3.5" fill="#8b5e6b" opacity="0.75" transform="rotate(20 4 -2)" />
          <line x1="0" y1="-4" x2="0" y2="2" stroke="#4a3628" strokeWidth="1" />
        </g>
      </g>
      <g className="weed-sway" style={{ transformOrigin: "740px 70px" }}>
        <g transform="translate(740,68) scale(0.8)">
          <ellipse cx="-4" cy="-2" rx="5" ry="3.5" fill="#e8a33d" opacity="0.7" transform="rotate(-20 -4 -2)" />
          <ellipse cx="4" cy="-2" rx="5" ry="3.5" fill="#e8a33d" opacity="0.7" transform="rotate(20 4 -2)" />
          <line x1="0" y1="-4" x2="0" y2="2" stroke="#4a3628" strokeWidth="1" />
        </g>
      </g>
      {}
      <path
        d="M0,140 C120,110 220,132 340,116 C460,100 560,128 680,108 C740,98 780,110 800,104 L800,170 L0,170 Z"
        fill="#b7cf9e"
        opacity="0.65"
      />
      <path
        d="M0,152 C100,132 200,150 320,136 C440,122 540,148 660,132 C720,124 770,134 800,128 L800,180 L0,180 Z"
        fill="#a0c084"
        opacity="0.75"
      />
      {}
      <rect x="0" y="115" width="800" height="285" fill="url(#gardenGround)" />
      <rect x="0" y="115" width="800" height="285" fill="url(#grassBlades)" />
      {}
      <g opacity="0.9">
        {[
          { x: 46, y: 210, c: "#5b84a6" },
          { x: 78, y: 250, c: "#e8a33d" },
          { x: 34, y: 300, c: "#8b5e6b" },
          { x: 92, y: 340, c: "#5b84a6" },
        ].map((flower, i) => (
          <g key={`fl-l-${i}`} transform={`translate(${flower.x},${flower.y})`}>
            <circle cx="-3" cy="0" r="2.6" fill={flower.c} opacity="0.8" />
            <circle cx="3" cy="0" r="2.6" fill={flower.c} opacity="0.8" />
            <circle cx="0" cy="-3" r="2.6" fill={flower.c} opacity="0.8" />
            <circle cx="0" cy="3" r="2.6" fill={flower.c} opacity="0.8" />
            <circle cx="0" cy="0" r="2.2" fill="#f4e4b8" />
          </g>
        ))}
        {[
          { x: 726, y: 220, c: "#8b5e6b" },
          { x: 754, y: 262, c: "#5b84a6" },
          { x: 704, y: 312, c: "#e8a33d" },
          { x: 762, y: 352, c: "#8b5e6b" },
        ].map((flower, i) => (
          <g key={`fl-r-${i}`} transform={`translate(${flower.x},${flower.y})`}>
            <circle cx="-3" cy="0" r="2.6" fill={flower.c} opacity="0.8" />
            <circle cx="3" cy="0" r="2.6" fill={flower.c} opacity="0.8" />
            <circle cx="0" cy="-3" r="2.6" fill={flower.c} opacity="0.8" />
            <circle cx="0" cy="3" r="2.6" fill={flower.c} opacity="0.8" />
            <circle cx="0" cy="0" r="2.2" fill="#f4e4b8" />
          </g>
        ))}
      </g>
      {}
      <g fill="#6b5a48" opacity="0.4">
        <ellipse cx="58" cy="372" rx="10" ry="5" />
        <ellipse cx="112" cy="388" rx="7" ry="3.5" />
        <ellipse cx="742" cy="380" rx="9" ry="4.5" />
        <ellipse cx="690" cy="392" rx="6" ry="3" />
      </g>
      {}
      <g stroke="#7a6050" strokeWidth="3" opacity="0.35" strokeLinecap="round">
        <line x1="18" y1="150" x2="18" y2="185" />
        <line x1="34" y1="150" x2="34" y2="185" />
        <line x1="50" y1="150" x2="50" y2="185" />
        <line x1="12" y1="162" x2="56" y2="162" />
        <line x1="750" y1="148" x2="750" y2="183" />
        <line x1="766" y1="148" x2="766" y2="183" />
        <line x1="782" y1="148" x2="782" y2="183" />
        <line x1="744" y1="160" x2="788" y2="160" />
      </g>
    </svg>
  );
}