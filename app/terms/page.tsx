import Link from "next/link";
import { Sprout as SproutIcon } from "lucide-react";
export default function TermsOfServicePage() {
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
          <h1 className="font-display text-3xl text-ink">Terms of Service</h1>
          <p className="text-xs text-ink-soft">Last updated: draft, pending legal review.</p>
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Using Sprout</h2>
          <p className="text-sm text-ink-soft">
            Sprout is a personal budgeting tool that visualizes your spending and savings as a
            garden. By creating an account, you agree to these terms. You&apos;re responsible for
            the accuracy of the categories, transactions, and goals you enter — Sprout only ever
            reflects the numbers you give it.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Not financial advice</h2>
          <p className="text-sm text-ink-soft">
            The Garden Advisor generates short observations from your own budget numbers, and may
            use an AI model to phrase them. These notes are informational only and are{" "}
            <strong className="text-ink">not financial, tax, investment, or legal advice</strong>.
            AI-generated notes can be imprecise or occasionally wrong even when the underlying
            numbers they&apos;re based on are correct — don&apos;t rely on them as your only basis
            for a financial decision. Consult a qualified professional for advice specific to your
            situation.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Your account</h2>
          <p className="text-sm text-ink-soft">
            Sign-in is handled by Clerk. You&apos;re responsible for keeping your account secure.
            You can delete your saved garden data at any time from Settings; deleting your sign-in
            account itself is handled through Clerk&apos;s own account management, which Settings
            will open for you after your data is deleted.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Service availability</h2>
          <p className="text-sm text-ink-soft">
            Sprout is provided &ldquo;as is,&rdquo; without warranty of any kind. We don&apos;t
            guarantee the Garden Advisor, Supabase sync, or any other feature will be available
            without interruption, and the app is designed to keep working from your browser&apos;s
            local copy if a sync or the Advisor is temporarily unreachable.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Limitation of liability</h2>
          <p className="text-sm text-ink-soft">
            To the fullest extent permitted by law, Sprout and its operators aren&apos;t liable
            for financial decisions made based on the app&apos;s output, or for data loss, to the
            extent not caused by our own negligence.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg text-ink">Changes to these terms</h2>
          <p className="text-sm text-ink-soft">
            If these terms change in a way that matters to how you use Sprout, we&apos;ll update
            this page and change the date above.
          </p>
        </section>
        <p className="mt-4 text-xs text-ink-soft">
          See also our{" "}
          <Link
            href="/privacy"
            className="rounded font-semibold text-moss hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
