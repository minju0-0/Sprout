"use client";
import { useEffect } from "react";
import Link from "next/link";
import { CloudRain } from "lucide-react";
import { reportError } from "@/lib/errorReporting";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError("Sprout route error", error);
  }, [error]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-canvas px-6 py-12 text-center">
      <CloudRain className="h-8 w-8 text-storm" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl text-ink">Something wilted.</h1>
        <p className="text-sm text-ink-soft">Give it another try, or head back to the garden.</p>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-moss/20 bg-card px-4 py-1.5 text-sm font-semibold text-moss transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          Back to the garden
        </Link>
      </div>
    </div>
  );
}
