import { cn } from "@/lib/cn";

/**
 * Primary call-to-action button used across the sign-in / sign-up flows.
 * A soft lift + shadow bloom on hover reinforces the "growth" motif
 * without relying on any color outside the existing moss/canvas palette.
 */
export const authButtonClass =
  "group relative flex w-full items-center justify-center gap-2 rounded-xl bg-moss px-4 py-2.5 text-sm font-semibold text-canvas shadow-md shadow-moss/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-moss-light hover:shadow-lg hover:shadow-moss/25 active:translate-y-0 active:scale-[0.98] active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none";

export const authGhostLinkClass =
  "text-xs font-semibold text-moss underline decoration-moss/30 decoration-2 underline-offset-4 transition-colors hover:text-moss-light hover:decoration-moss-light/50 disabled:pointer-events-none disabled:text-ink-soft/50 disabled:no-underline";

export const authLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft";

export const authErrorTextClass = "flex items-center gap-1 text-xs font-medium text-rust";

/**
 * The auth card itself — now genuinely glass: a translucent, blurred
 * surface that lets the page's ambient color blobs bleed through instead
 * of a flat opaque panel. `isolate` keeps the blur from bleeding onto
 * children with their own backdrop effects (e.g. the OAuth pills).
 * On lg+ it overlaps the seam of the photo panel by a negative margin
 * (applied in layout.tsx) so the two halves of the screen visually
 * interlock instead of sitting side by side as flat blocks.
 */
export const authCardClass =
  "relative isolate w-full overflow-hidden rounded-[2rem] border border-white/40 bg-white/25 px-6 py-7 shadow-[0_24px_60px_-20px_rgba(63,107,58,0.35)] ring-1 ring-black/[0.02] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/15 sm:px-8 sm:py-8";

/** Faint glass sheen across the top of the card — a single highlight, not a decoration pile-up. */
export const authCardSheenClass =
  "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent";

/** Small pill button used in the top nav (e.g. "Back to home"). */
export const authNavPillClass =
  "rounded-full border border-white/40 bg-white/30 px-4 py-2 text-xs font-semibold text-ink shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/45 hover:shadow-md active:translate-y-0 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss";

export const authNavLinkClass =
  "hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:inline";

/**
 * Text input used by AuthField. `variant="code"` widens letter-spacing and
 * centers the text for one-time verification codes. `withToggle` reserves
 * room on the right for the password show/hide control. `withIcon` reserves
 * room on the left for a leading field icon.
 */
export function authInputClass(
  hasError?: boolean,
  variant: "default" | "code" = "default",
  withToggle?: boolean,
  withIcon?: boolean,
) {
  return cn(
    "w-full rounded-xl border bg-white/40 px-3.5 py-2.5 text-sm text-ink outline-none backdrop-blur-md transition-all duration-150 placeholder:text-ink-soft/40",
    "focus:bg-white/60 focus:ring-[3px] focus:ring-moss/12",
    hasError
      ? "border-rust/50 focus:border-rust/60"
      : "border-white/50 hover:border-moss/30 focus:border-moss/45",
    variant === "code" && "text-center font-data text-lg tracking-[0.5em] placeholder:tracking-normal",
    withToggle && "pr-14",
    withIcon && "pl-10",
  );
}

/* ------------------------------------------------------------------ */
/* Split-screen photo panel (desktop) + mobile photo banner            */
/*                                                                      */
/* The panel now carries mode-specific content (photo, quote, stat,    */
/* feature list) and trades places with the form panel when the route  */
/* switches between sign-in and sign-up — see layout.tsx. Everything   */
/* layered on top of the photo is glass: a frosted feature card, a     */
/* frosted stat pill, and a frosted bottom info bar, so the panel      */
/* reads as one composed, professional moment rather than several      */
/* separate floating elements.                                         */
/* ------------------------------------------------------------------ */

/** Full-bleed cover photo, shared by the desktop panel and mobile banner. */
export const authPhotoImgClass = "absolute inset-0 h-full w-full object-cover";

/**
 * Single smooth bottom-weighted scrim. Strong enough near the bottom edge
 * to carry the info bar's text, but fully clear through the upper two
 * thirds of the frame so the photograph itself stays the focus.
 */
export const authPhotoScrimClass =
  "pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 via-45% to-transparent";

/** Quiet wordmark, top-left of the photo panel. Reads as a letterhead, not a badge. */
export const authPhotoBrandClass =
  "absolute left-7 top-7 z-20 flex items-center gap-2 text-canvas drop-shadow-[0_1px_6px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-canvas rounded";

/** Frosted-glass floating stat pill, top-right of the photo panel. */
export const authPhotoStatPillClass =
  "absolute right-7 top-7 z-10 flex flex-col items-end gap-0 rounded-2xl border border-canvas/20 bg-canvas/10 px-4 py-2.5 text-right shadow-[0_12px_30px_-14px_rgba(0,0,0,0.5)] backdrop-blur-xl";

/** Frosted feature list card, vertically centered on the left of the photo. */
export const authPhotoFeatureCardClass =
  "absolute left-7 top-1/2 z-10 flex w-52 -translate-y-1/2 flex-col gap-3.5 rounded-2xl border border-canvas/20 bg-canvas/10 p-4 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl";

/**
 * The single composed element at the base of the photo: a short quote on
 * the left and a headline stat on the right, separated by a hairline —
 * now frosted glass rather than a flat gradient scrim so it visually
 * matches the rest of the glass elements on the page.
 */
export const authPhotoInfoBarClass =
  "absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-6 rounded-2xl border border-canvas/15 bg-ink/25 px-6 py-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:inset-x-5";

/** Compact photo banner shown above the form on small screens. */
export const authMobileBannerClass =
  "relative h-36 shrink-0 overflow-hidden rounded-b-[1.75rem] shadow-md sm:h-44 lg:hidden";