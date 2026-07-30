import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  Sprout as SproutIcon,
  TreeDeciduous,
  Sparkles,
  CloudSun,
  ArrowRight,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { plantTypeMap, soilColor } from "@/constants/gardenAssets";

interface Pillar {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
}

const pillars: Pillar[] = [
  {
    icon: SproutIcon,
    title: "Living Garden Canvas",
    description:
      "Every category is a plant sized and colored by real numbers — how much you've budgeted and spent, never decoration.",
    color: "#3f6b3a",
    bg: "var(--color-moss-50, #f0f6ee)",
  },
  {
    icon: TreeDeciduous,
    title: "Goal Trees",
    description:
      "Savings goals grow as separate trees, reaching full height the moment you hit the target.",
    color: "#5b84a6",
    bg: "var(--color-sky-50, #eef5fa)",
  },
  {
    icon: Sparkles,
    title: "Garden Advisor",
    description:
      "Aggregated, anonymized numbers go to an AI advisor for a few concise, useful insights — never a raw transaction feed.",
    color: "#e8a33d",
    bg: "var(--color-marigold-50, #fdf6ea)",
  },
  {
    icon: CloudSun,
    title: "Weather Banner",
    description:
      "One glance tells you the forecast: sunny under budget, cloudy close to the line, stormy over it.",
    color: "#8b5e6b",
    bg: "var(--color-clay-50, #f7efef)",
  },
];

const steps = [
  {
    num: "01",
    title: "Plant a category",
    desc: "Set a monthly budget for each category — that's a seed in your garden bed.",
  },
  {
    num: "02",
    title: "Log what you spend",
    desc: "Every transaction waters or overdraws its plant. Spend within budget and it thrives.",
  },
  {
    num: "03",
    title: "Watch the season grow",
    desc: "Check in any time to see which plants are thriving and which need attention.",
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/garden");
  }

  return (
    <div
      id="top"
      style={{
        fontFamily: "var(--font-body, sans-serif)",
        background: "var(--color-canvas, #eef1e4)",
        minHeight: "100vh",
      }}
    >
      {/* Sticky Navigation Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(238,241,228,0.88)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(38,42,31,0.07)",
          padding: "14px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "var(--color-moss-500, #3f6b3a)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <SproutIcon className="h-4 w-4" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-ink, #262a1f)",
            }}
          >
            Sprout
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/sign-in" className="btn btn-ghost" style={{ fontSize: 13 }}>
            Sign in
          </Link>
          <Link href="/sign-up" className="btn btn-primary" style={{ fontSize: 13 }}>
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "72px 48px 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--color-moss-100, #dce4dc)",
              color: "var(--color-moss-700, #274324)",
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 100,
              marginBottom: 24,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--color-moss-500, #3f6b3a)",
                display: "inline-block",
              }}
            />
            Budgeting that grows with you
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: "clamp(40px, 5vw, 60px)",
              fontWeight: 700,
              lineHeight: 1.08,
              color: "var(--color-ink, #262a1f)",
              margin: "0 0 20px",
              letterSpacing: "-0.02em",
            }}
          >
            See your budget as a garden,{" "}
            <em style={{ color: "var(--color-moss-600, #32562f)", fontStyle: "italic" }}>
              not a spreadsheet.
            </em>
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.65,
              color: "var(--color-ink-soft, #515745)",
              margin: "0 0 36px",
              maxWidth: 440,
            }}
          >
            Every budget category is a plant. Every dollar you save waters it, every dollar you
            overspend lets it wilt. Sprout turns your monthly budget into a garden you can
            actually see grow.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/sign-up" className="btn btn-primary btn-lg">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sign-in" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 16,
              paddingTop: 32,
              borderTop: "1px solid rgba(38,42,31,0.08)",
            }}
          >
            {[
              { n: "12k+", label: "Active gardens" },
              { n: "$48M", label: "Budgeted this month" },
              { n: "4.9★", label: "App store rating" },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-data, monospace)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--color-moss-600, #32562f)",
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-ink-faint, #8a917e)",
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Illustration Box */}
        <div
          style={{
            background: "linear-gradient(180deg, #e8f0e0 0%, #d8e5c8 60%, #c8d8b0 100%)",
            borderRadius: 24,
            overflow: "hidden",
            padding: "40px 32px 0",
            boxShadow:
              "0 4px 32px rgba(38,42,31,0.10), inset 0 0 0 1px rgba(38,42,31,0.06)",
            minHeight: 380,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              marginBottom: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(8px)",
              borderRadius: 100,
              padding: "6px 14px",
              width: "fit-content",
              fontSize: 12,
              fontWeight: 500,
              color: "#b07a10",
            }}
          >
            <Sun className="h-3.5 w-3.5" />
            Sunny — Garden is healthy
          </div>

          <LandingIllustration />
        </div>
      </section>

      {/* Feature / Pillars Section */}
      <section
        aria-labelledby="pillars-heading"
        style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 48px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            id="pillars-heading"
            style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 700,
              color: "var(--color-ink, #262a1f)",
              margin: "0 0 14px",
              letterSpacing: "-0.015em",
            }}
          >
            Four ways Sprout keeps you honest
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--color-ink-soft, #515745)",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            The garden metaphor is a visual layer over real math — never the other way around.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {pillars.map((pillar) => (
            <div key={pillar.title} className="feature-card">
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: pillar.bg,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: pillar.color,
                  marginBottom: 18,
                }}
              >
                <pillar.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display, serif)",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "var(--color-ink, #262a1f)",
                  margin: "0 0 10px",
                }}
              >
                {pillar.title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--color-ink-soft, #515745)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps / How It Works */}
      <section
        style={{
          background: "var(--color-card, #f8faf5)",
          borderTop: "1px solid rgba(38,42,31,0.06)",
          borderBottom: "1px solid rgba(38,42,31,0.06)",
          padding: "72px 48px",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: "var(--font-display, serif)",
                fontSize: "clamp(26px, 3vw, 38px)",
                fontWeight: 700,
                color: "var(--color-ink, #262a1f)",
                margin: "0 0 12px",
                letterSpacing: "-0.015em",
              }}
            >
              Plant your first garden in minutes
            </h2>
          </div>

          <ol
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 32,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {steps.map((step) => (
              <li key={step.num} style={{ position: "relative" }}>
                <div
                  style={{
                    fontFamily: "var(--font-data, monospace)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-moss-500, #3f6b3a)",
                    marginBottom: 12,
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display, serif)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--color-ink, #262a1f)",
                    margin: "0 0 10px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--color-ink-soft, #515745)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: "var(--color-moss-600, #32562f)",
          padding: "64px 48px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display, serif)",
            fontSize: "clamp(28px, 3vw, 40px)",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 16px",
          }}
        >
          Ready to plant your first garden?
        </h2>
        <Link
          href="/sign-up"
          className="btn btn-lg"
          style={{
            background: "#fff",
            color: "var(--color-moss-700, #274324)",
            fontWeight: 600,
          }}
        >
          Start growing — it's free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(38,42,31,0.08)", padding: "32px 48px" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-ink, #262a1f)",
            }}
          >
            <SproutIcon className="h-4 w-4 style={{ color: 'var(--color-moss-500, #3f6b3a)' }}" />
            Sprout
          </div>
          <nav style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--color-ink-soft, #515745)" }}>
            <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
              Terms
            </Link>
            <a href="#top" style={{ color: "inherit", textDecoration: "none" }}>
              Back to top
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function LandingIllustration() {
  const species = [
    plantTypeMap.sunflower.stages.thriving,
    plantTypeMap.tomato.stages.thriving,
    plantTypeMap.fern.stages.thriving,
  ];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "20px 0 0",
      }}
    >
      <svg
        viewBox="0 0 300 140"
        style={{ width: "100%", maxHeight: 180 }}
        role="img"
        aria-label="Three thriving plants in a garden bed"
      >
        <rect x="0" y="118" width="300" height="22" rx="4" fill={soilColor} />
        {species.map((palette, i) => {
          const cx = 60 + i * 90;
          return (
            <g key={cx}>
              <line
                x1={cx}
                y1="118"
                x2={cx}
                y2="70"
                stroke={palette.stem}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx={cx} cy="60" r="26" fill={palette.foliage} />
              <circle cx={cx} cy="60" r="10" fill={palette.accent} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}