"use client";
interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="font-display text-lg text-ink">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="mt-2 text-sm text-ink-soft">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={
              danger
                ? "rounded-lg bg-rust px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-rust/90 active:bg-rust-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust disabled:opacity-60"
                : "rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:opacity-60"
            }
          >
            {isConfirming ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
