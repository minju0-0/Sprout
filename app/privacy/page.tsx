import Link from "next/link";
import { Sprout as SproutIcon } from "lucide-react";
export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16 sm:px-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 rounded text-moss transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <SproutIcon className="h-5 w-5" aria-hidden="true" />
          <span className="font-display text-lg text-ink">Sprout</span>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl text-ink">Privacy Policy</h1>
          <p className="text-xs text-ink-soft">Last updated: draft, pending legal review.</p>
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">What we collect</h2>
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">Account information.</strong> Sprout uses Clerk for
            authentication. Clerk collects and stores the basic account details it needs to sign
            you in — your email address and any profile information you give it. We don&apos;t
            build or run our own authentication system.
          </p>
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">Garden data.</strong> The budget categories, transactions,
            goals, current season, and harvest history you enter are stored on our server
            (Supabase), in one record per account, alongside a local copy in your browser so the
            app still works offline. This is the actual financial data you type in — we don&apos;t
            infer or collect it from anywhere else.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">The Garden Advisor and AI</h2>
          <p className="text-sm text-ink-soft">
            When you ask for advisor notes, we send Google&apos;s Gemini model a short digest:
            each category&apos;s name and how much of its budget is spent, and each goal&apos;s
            name and progress. <strong className="text-ink">
              We never send your individual transactions
            </strong>{" "}
            — no line-item descriptions, dates, or amounts — only these aggregated per-category and
            per-goal totals. If you ask the Advisor a specific question, the literal text of that
            question is also sent to Gemini so it can answer you. If Gemini is unavailable, the
            Advisor falls back to notes computed directly on our server from the same numbers, with
            nothing sent anywhere.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Analytics</h2>
          <p className="text-sm text-ink-soft">
            We use PostHog to understand which parts of Sprout get used and where people drop off
            during onboarding. This is limited to page views and a short, fixed list of product
            events — for example, that a category was added, a transaction was logged, a season
            was harvested, the first-run walkthrough was completed, or an Advisor question was
            asked. These events are tied to your account so we can see usage patterns per user,
            but they{" "}
            <strong className="text-ink">
              never include the category name, a dollar amount, a transaction description, or
              anything else you typed into a form
            </strong>{" "}
            — the same restraint we apply to what the Garden Advisor is allowed to see. We
            don&apos;t use analytics to run advertising, and we don&apos;t sell this data.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">What we don&apos;t do</h2>
          <p className="text-sm text-ink-soft">
            We don&apos;t sell your data. We don&apos;t run advertising. We don&apos;t share your
            garden data with anyone except Gemini, and only in the aggregated form described
            above.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">How long we keep it</h2>
          <p className="text-sm text-ink-soft">
            Your garden data is kept for as long as your account exists. You can permanently delete
            it at any time from Settings — this removes your saved garden from our server and your
            browser&apos;s local copy immediately. Deleting your Sprout data doesn&apos;t
            automatically close your sign-in account; Settings will open Clerk&apos;s own account
            page afterward if you&apos;d also like to do that.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Cookies</h2>
          <p className="text-sm text-ink-soft">
            Clerk sets its own session cookies to keep you signed in. PostHog stores a small
            identifier (via cookies or local storage) so it can group the analytics events
            described above by user. We don&apos;t set separate advertising cookies ourselves.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Changes to this policy</h2>
          <p className="text-sm text-ink-soft">
            If this policy changes in a way that matters to how your data is handled, we&apos;ll
            update this page and change the date above.
          </p>
        </section>
        <p className="mt-4 text-xs text-ink-soft">
          Questions about this policy? Reach out through your account&apos;s support channel.
        </p>
      </main>
    </div>
  );
}
