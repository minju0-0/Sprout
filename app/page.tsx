import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  Sprout as SproutIcon,
  TreeDeciduous,
  Leaf,
  ArrowRight,
  ArrowRightLeft,
  Wallet,
  PiggyBank,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type {
  PlantGrowthStage,
  PlantSpecies,
  Goal,
  AdvisorNote as AdvisorNoteData,
} from "@/types";
import { plantTypeMap } from "@/constants/gardenAssets";
import { PlantIllustration } from "@/components/PlantIllustration";
import { StatCard } from "@/components/StatCard";
import { CategoryChip } from "@/components/CategoryChip";
import { GoalTreePreview } from "@/components/GoalTreePreview";
import { AdvisorNote } from "@/components/AdvisorNote";
import { WeatherBanner } from "@/components/WeatherBanner";

const steps = [
  {
    num: "01",
    title: "Plant a category",
    desc: "Give it a name and a monthly number — that's a seed in the ground.",
  },
  {
    num: "02",
    title: "Log what you spend",
    desc: "Every transaction waters or drains its plant, the instant you save it.",
  },
  {
    num: "03",
    title: "Watch the season grow",
    desc: "Come back anytime and see, at a glance, exactly which habits are working.",
  },
];

const stepIcons: LucideIcon[] = [SproutIcon, Leaf, TreeDeciduous];
const stepGradients = [
  "from-moss-300 to-moss-500",
  "from-moss-400 to-moss-600",
  "from-moss-600 to-moss-800",
];

const previewCategories: {
  name: string;
  species: PlantSpecies;
  stage: PlantGrowthStage;
  spent: number;
  budget: number;
}[] = [
  { name: "Groceries", species: "tomato", stage: "thriving", spent: 220, budget: 400 },
  { name: "Dining Out", species: "berry-bush", stage: "thriving", spent: 90, budget: 200 },
  { name: "Subscriptions", species: "succulent", stage: "thriving", spent: 30, budget: 80 },
  { name: "Shopping", species: "sunflower", stage: "thriving", spent: 120, budget: 200 },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/garden");
  }
  return (
    <div id="top" className="relative flex min-h-screen flex-col overflow-hidden bg-canvas font-body">
      <BackgroundDecoration />
      <div className="relative z-10 flex flex-1 flex-col">
        <SiteHeader />
        <Hero />
        <Pillars />
        <PreviewShowcase />
        <Steps />
        <ClosingCta />
        <SiteFooter />
      </div>
    </div>
  );
}

function BackgroundDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(63,107,58,0.14)_1px,transparent_0)] bg-[length:28px_28px] [mask-image:linear-gradient(to_bottom,black,black,transparent)]" />
      <div className="absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-moss-200/50 blur-[100px]" />
      <div className="absolute top-20 -right-24 h-[22rem] w-[22rem] rounded-full bg-marigold-200/45 blur-[100px]" />
      <div className="absolute top-[70rem] left-1/4 h-[24rem] w-[24rem] rounded-full bg-sky-200/40 blur-[110px]" />
      <div className="absolute bottom-0 right-0 h-[22rem] w-[22rem] rounded-full bg-clay-100/50 blur-[100px]" />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss text-canvas">
            <SproutIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold text-ink">Sprout</span>
        </div>
        <nav
          aria-label="Section"
          className="hidden items-center gap-6 text-sm font-medium text-ink-soft sm:flex"
        >
          <a href="#pillars" className="transition-colors hover:text-ink">
            Features
          </a>
          <a href="#preview" className="transition-colors hover:text-ink">
            Preview
          </a>
          <a href="#steps" className="transition-colors hover:text-ink">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="btn btn-ghost">
            Sign in
          </Link>
          <Link href="/sign-up" className="btn btn-primary">
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-10 pt-14 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:gap-10 lg:pt-20">
      <div className="max-w-lg">
        <h1 className="font-display text-[clamp(2.1rem,4vw,3.1rem)] leading-[1.1] font-bold tracking-tight text-ink">
          See your money{" "}
          <span className="text-moss-600 italic">the moment it starts to wilt.</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
          Every category in your budget grows as a living plant — full and
          thriving when you&apos;re on track, drooping the second you&apos;re
          not. Sprout turns a month of transactions into something you
          actually watch happen, instead of a table you avoid opening.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sign-up" className="btn btn-primary btn-lg">
            Start your garden
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/sign-in" className="btn btn-secondary btn-lg">
            Sign in
          </Link>
        </div>
        <p className="mt-6 text-xs font-medium tracking-wide text-ink-faint">
          Living plants &nbsp;·&nbsp; Goal trees &nbsp;·&nbsp; Weather forecast &nbsp;·&nbsp; AI garden advisor
        </p>
      </div>
      <div className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div
          className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-moss-100 via-marigold-50 to-sky-50 blur-2xl"
          aria-hidden="true"
        />
        <GardenPreview />
      </div>
    </section>
  );
}

function PreviewShowcase() {
  return (
    <section id="preview" className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Now see it for real.
        </h2>
        <p className="mt-3 text-sm text-ink-soft sm:text-base">
          Three actual screens from the app — your dashboard, your envelopes, and your reports.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <PreviewTile label="Garden" description="Your categories as plants, at a glance.">
          <GardenPreview compact />
        </PreviewTile>
        <PreviewTile label="Budget" description="Envelope-style budgeting with move-money.">
          <BudgetPreview />
        </PreviewTile>
        <PreviewTile label="Reports" description="Where your money actually goes.">
          <ReportsPreview />
        </PreviewTile>
      </div>
    </section>
  );
}

function PreviewTile({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-display text-base font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink-soft sm:text-sm">{description}</p>
      </div>
      {children}
    </div>
  );
}

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl border border-moss/10 bg-card/95 p-4 shadow-lg backdrop-blur-sm sm:rounded-3xl sm:p-5">
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rust/40" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-marigold/50" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-moss/40" aria-hidden="true" />
        <span className="ml-3 truncate text-xs font-medium text-ink-faint">{url}</span>
      </div>
      {children}
    </div>
  );
}

function GardenPreview({ compact = false }: { compact?: boolean }) {
  return (
    <BrowserFrame url="sprout.app/garden">
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-marigold-100/70 px-4 py-3">
        <Sun className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-ink">Sunny — Garden is healthy</p>
          {!compact && <p className="text-xs text-ink-soft">You&apos;re on track. Keep it up.</p>}
        </div>
      </div>
      {!compact && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <StatCard label="Budgeted" value="$2,400" subtitle="This month" icon={Wallet} />
          <StatCard label="Remaining" value="$680" tone="positive" subtitle="28% left" icon={PiggyBank} />
        </div>
      )}
      <div className="rounded-2xl bg-[#e3e7d3] px-3 py-5 sm:py-6">
        <div className="flex items-end justify-center gap-2.5 sm:gap-3">
          {previewCategories.map((category) => (
            <div key={category.name} className="flex flex-col items-center gap-1">
              <PlantIllustration
                species={category.species}
                stage={category.stage}
                size={compact ? 46 : 58}
              />
              <span className="text-[9px] font-semibold text-ink-soft sm:text-[10px]">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function BudgetPreview() {
  return (
    <BrowserFrame url="sprout.app/budget">
      <StatCard label="Unallocated" value="$310" tone="positive" subtitle="Ready to move" icon={PiggyBank} />
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-soft">Envelopes</p>
        <span className="flex items-center gap-1 text-xs font-semibold text-moss">
          <ArrowRightLeft className="h-3 w-3" aria-hidden="true" />
          Move money
        </span>
      </div>
      <div className="mt-2 flex flex-col gap-2.5">
        {previewCategories.map((category) => {
          const percent = Math.min(category.spent / category.budget, 1) * 100;
          const over = category.spent > category.budget;
          return (
            <div key={category.name} className="rounded-xl border border-moss/10 bg-canvas px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <CategoryChip name={category.name} species={category.species} />
                <span className={`font-data text-[11px] ${over ? "text-rust" : "text-ink-soft"}`}>
                  ${category.spent} / ${category.budget}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-moss/10">
                <div
                  className={`h-full rounded-full ${over ? "bg-rust" : "bg-moss"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </BrowserFrame>
  );
}

function ReportsPreview() {
  const segments = previewCategories.map((category) => ({
    name: category.name,
    value: category.spent,
    color: plantTypeMap[category.species].stages.thriving.accent,
  }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let cumulative = 0;
  return (
    <BrowserFrame url="sprout.app/reports">
      <div className="flex items-center gap-6 py-2">
        <svg
          viewBox="0 0 42 42"
          className="h-28 w-28 shrink-0 -rotate-90 sm:h-32 sm:w-32"
          role="img"
          aria-label="Spending by category"
        >
          <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#e2e6d5" strokeWidth="6" />
          {segments.map((segment) => {
            const percent = total > 0 ? (segment.value / total) * 100 : 0;
            const dashOffset = 100 - cumulative;
            cumulative += percent;
            return (
              <circle
                key={segment.name}
                cx="21"
                cy="21"
                r="15.9155"
                fill="transparent"
                stroke={segment.color}
                strokeWidth="6"
                strokeDasharray={`${percent} ${100 - percent}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <ul className="flex flex-col gap-2 text-xs">
          {segments.map((segment) => (
            <li key={segment.name} className="flex items-center gap-2 text-ink-soft">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              />
              {segment.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 border-t border-moss/10 pt-3">
        <svg
          viewBox="0 0 200 60"
          className="h-14 w-full"
          role="img"
          aria-label="Spending trend across recent seasons"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,45 40,38 80,42 120,25 160,30 200,15"
            fill="none"
            stroke="#3f6b3a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </BrowserFrame>
  );
}

function Pillars() {
  const previewGoal: Goal = {
    id: "preview-goal",
    name: "Japan Trip",
    targetAmount: 2500,
    currentAmount: 2500,
  };
  const previewNote: AdvisorNoteData = {
    id: "preview-note",
    message: "Your Groceries plant grew fast this week — want to move $20 into Savings?",
  };
  const allSpecies: PlantSpecies[] = ["tomato", "sunflower", "succulent", "fern", "berry-bush"];
  return (
    <section id="pillars" className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Four ways your garden never lets you lie to yourself.
        </h2>
        <p className="mt-3 text-sm text-ink-soft sm:text-base">
          Not icons and promises — this is what those four pieces actually look like inside the app.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
        {}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-moss/15 bg-gradient-to-br from-moss-50 via-moss-50 to-canvas p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:row-span-2">
          <div
            className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-moss-200/40 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <h3 className="font-display text-[17px] font-semibold text-ink">
              Living Garden Canvas
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
              Every category is a plant, sized and colored by exactly how much
              you&apos;ve budgeted and spent. Nothing here is decorative —
              move the number, and the plant moves with it.
            </p>
          </div>
          <div className="relative mt-4 flex flex-1 flex-col justify-center">
            <div className="flex flex-1 flex-col justify-evenly rounded-2xl bg-[#e3e7d3] px-3 py-4 shadow-inner min-h-[240px]">
              {}
              <div className="grid grid-cols-3 place-items-center gap-1">
                {allSpecies.slice(0, 3).map((species) => (
                  <PlantIllustration key={species} species={species} stage="thriving" size={72} />
                ))}
              </div>
              {}
              <div className="flex items-center justify-around px-6">
                {allSpecies.slice(3).map((species) => (
                  <PlantIllustration key={species} species={species} stage="thriving" size={72} />
                ))}
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky/15 bg-gradient-to-br from-sky-50 to-canvas p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div
            className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-200/40 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <h3 className="font-display text-[17px] font-semibold text-ink">
              Goal Trees
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
              Savings goals grow as their own trees — trunk, branches, and
              leaves climbing toward the target, with a gold sparkle the
              moment you hit it.
            </p>
          </div>
          <div className="relative mt-4">
            <GoalTreePreview goal={previewGoal} />
          </div>
        </div>
        {}
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-marigold/15 bg-gradient-to-br from-marigold-50 to-canvas p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div
            className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-marigold-200/40 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <h3 className="font-display text-[17px] font-semibold text-ink">
              Garden Advisor
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
              An aggregated digest of your numbers — never your raw
              transactions — feeds a handful of sharp, specific notes. Advice,
              not a chat wall.
            </p>
          </div>
          <div className="relative flex flex-1 items-center justify-center py-3">
            <ul className="w-full">
              <AdvisorNote note={previewNote} />
            </ul>
          </div>
        </div>
        {}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-clay/15 bg-gradient-to-br from-clay-50 to-canvas p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:col-span-2 lg:col-span-2">
          <div
            className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-clay-100/50 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col justify-between gap-4 h-full">
            <div>
              <h3 className="font-display text-[17px] font-semibold text-ink">
                Weather Banner
              </h3>
              <p className="mt-2.5 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">
                Sunny when you&apos;re under budget. Cloudy when you&apos;re
                close. Stormy the second you&apos;re over. The whole forecast,
                in one glance, no math required.
              </p>
            </div>
            <WeatherBanner status="sunny" percentSpent={0.35} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section id="steps" className="border-y border-ink/5 bg-card/70 py-16 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-2xl px-6 sm:px-8">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            From zero to garden in under five minutes.
          </h2>
        </div>
        <ol className="relative flex flex-col">
          <span
            className="absolute left-6 top-3 bottom-3 border-l-2 border-dashed border-moss/25"
            aria-hidden="true"
          />
          {steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <li key={step.num} className="relative flex items-start gap-5 py-5 sm:gap-6">
                <span
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-card bg-gradient-to-br text-white shadow-md ${stepGradients[index]}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] font-bold text-moss-700 shadow ring-1 ring-moss/15">
                    {index + 1}
                  </span>
                </span>
                <div className="pt-1.5">
                  <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
                    {step.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-moss-600 px-6 py-14 text-center sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] bg-[length:24px_24px]"
        aria-hidden="true"
      />
      <div className="relative">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Your next paycheck deserves better than a spreadsheet.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-moss-100/90 sm:text-base">
          Free to start. No credit card. Just a budget that finally shows
          its work.
        </p>
        <Link
          href="/sign-up"
          className="btn btn-lg mt-7 inline-flex bg-white text-moss-700 hover:bg-canvas"
        >
          Plant your first garden
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink/8 px-6 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SproutIcon className="h-4 w-4 text-moss" aria-hidden="true" />
          Sprout
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-5 text-xs text-ink-soft"
        >
          <a href="#pillars" className="hover:text-ink">
            Features
          </a>
          <a href="#preview" className="hover:text-ink">
            Preview
          </a>
          <a href="#steps" className="hover:text-ink">
            How it works
          </a>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <a href="#top" className="hover:text-ink">
            Back to top
          </a>
        </nav>
      </div>
    </footer>
  );
}