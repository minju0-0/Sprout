import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  Sprout as SproutIcon,
  TreeDeciduous,
  Sparkles,
  CloudSun,
  type LucideIcon,
} from "lucide-react";
import { plantTypeMap, soilColor } from "@/constants/gardenAssets";
const pillars: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: SproutIcon,
    title: "Living Garden Canvas",
    description:
      "Every category is a plant sized and colored by real numbers — how much you've budgeted and spent, never decoration.",
  },
  {
    icon: TreeDeciduous,
    title: "Goal Trees",
    description:
      "Savings goals grow as separate trees, reaching full height the moment you hit the target.",
  },
  {
    icon: Sparkles,
    title: "Garden Advisor",
    description:
      "Aggregated, anonymized numbers go to an AI advisor for a few concise, useful insights — never a raw transaction feed.",
  },
  {
    icon: CloudSun,
    title: "Weather Banner",
    description:
      "One glance tells you the forecast: sunny under budget, cloudy close to the line, stormy over it.",
  },
];
export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/garden");
  }
  return (
    <div id="top" className="flex flex-1 flex-col bg-canvas">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-16 px-6 py-16 sm:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss/10 text-moss">
            <SproutIcon className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="text-xs font-semibold tracking-[0.2em] text-moss uppercase">
            Budgeting that grows with you
          </p>
          <h1 className="max-w-2xl font-display text-4xl text-ink sm:text-5xl">
            See your budget as a garden, not a spreadsheet.
          </h1>
          <p className="max-w-lg text-base text-ink-soft">
            Every budget category is a plant. Every dollar you save waters it, every dollar you
            overspend lets it wilt. Sprout turns your monthly budget into a garden you can
            actually see grow.
          </p>
        </div>
        <LandingIllustration />
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="rounded-lg bg-moss px-5 py-2.5 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-moss/90 active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-moss/20 bg-card px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10 hover:text-moss active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Sign in
          </Link>
        </div>
        <ol className="grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <ExplainerStep
            step={1}
            title="Plant a category"
            description="Set a monthly budget for each category — that's a seed in your garden bed."
          />
          <ExplainerStep
            step={2}
            title="Log what you spend"
            description="Every transaction waters or overdraws its plant. Spend within budget and it thrives."
          />
          <ExplainerStep
            step={3}
            title="Watch the season grow"
            description="Check in any time to see which plants are thriving and which need attention."
          />
        </ol>
        <section className="flex w-full flex-col items-center gap-8" aria-labelledby="pillars-heading">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 id="pillars-heading" className="font-display text-2xl text-ink sm:text-3xl">
              Four ways Sprout keeps you honest
            </h2>
            <p className="max-w-md text-sm text-ink-soft">
              The garden metaphor is a visual layer over real math — never the other way around.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="flex flex-col items-start gap-3 rounded-2xl border border-moss/15 bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss/10 text-moss">
                  <pillar.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <p className="font-display text-base text-ink">{pillar.title}</p>
                <p className="text-sm text-ink-soft">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-moss/15 px-6 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <SproutIcon className="h-4 w-4 text-moss" aria-hidden="true" />
            Sprout
          </div>
          <nav className="flex items-center gap-4 text-xs text-ink-soft" aria-label="Footer">
            <Link href="/privacy" className="hover:text-moss">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-moss">
              Terms
            </Link>
            <a href="#top" className="hover:text-moss">
              Back to top
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
function ExplainerStep({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-moss/15 bg-card p-4">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/10 text-xs font-semibold text-moss">
        {step}
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-soft">{description}</p>
    </li>
  );
}
function LandingIllustration() {
  const species = [
    plantTypeMap.sunflower.stages.thriving,
    plantTypeMap.tomato.stages.thriving,
    plantTypeMap.fern.stages.thriving,
  ];
  return (
    <svg
      viewBox="0 0 300 140"
      className="h-32 w-full max-w-xs text-moss"
      role="img"
      aria-label="Three thriving plants in a garden bed"
    >
      <rect x="0" y="118" width="300" height="22" rx="4" fill={soilColor} />
      {species.map((palette, i) => {
        const cx = 60 + i * 90;
        return (
          <g key={cx}>
            <line x1={cx} y1="118" x2={cx} y2="70" stroke={palette.stem} strokeWidth="4" strokeLinecap="round" />
            <circle cx={cx} cy="60" r="26" fill={palette.foliage} />
            <circle cx={cx} cy="60" r="10" fill={palette.accent} />
          </g>
        );
      })}
    </svg>
  );
}
