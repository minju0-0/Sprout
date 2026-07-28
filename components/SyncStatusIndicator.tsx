import { Check, CloudOff, Loader2 } from "lucide-react";
import type { SyncStatus } from "@/types";
import { cn } from "@/lib/cn";
interface SyncStatusIndicatorProps {
  status: SyncStatus;
  error: string | null;
}
export function SyncStatusIndicator({ status, error }: SyncStatusIndicatorProps) {
  if (status === "idle") return null;
  if (status === "error") {
    return (
      <p
        className="flex items-center gap-1.5 text-xs text-rust"
        role="status"
        title={error ?? undefined}
      >
        <CloudOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Working offline
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-xs text-ink-soft" role="status">
      {status === "saving" ? (
        <>
          <Loader2 className={cn("h-3.5 w-3.5 shrink-0 animate-spin")} aria-hidden="true" />
          Saving…
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5 shrink-0 text-moss" aria-hidden="true" />
          Saved
        </>
      )}
    </p>
  );
}
