import Link from "next/link";
import { Sprout as SproutIcon } from "lucide-react";
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-canvas px-6 py-12 text-center">
      <SproutIcon className="h-8 w-8 text-moss" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl text-ink">This plot hasn&apos;t been planted yet.</h1>
        <p className="text-sm text-ink-soft">
          There&apos;s nothing growing at this address.
        </p>
      </div>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
      >
        Back to the garden
      </Link>
    </div>
  );
}
