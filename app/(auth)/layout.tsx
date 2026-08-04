"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence, type Variants } from "framer-motion";
import {
  Sprout as SproutIcon,
  Droplets,
  CalendarCheck,
  Users,
  Image as ImageIcon,
  CloudSun,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  authCardClass,
  authCardSheenClass,
  authNavLinkClass,
  authNavPillClass,
  authPhotoImgClass,
  authPhotoScrimClass,
  authPhotoBrandClass,
  authPhotoStatPillClass,
  authPhotoFeatureCardClass,
  authPhotoInfoBarClass,
  authMobileBannerClass,
} from "@/lib/authStyles";

// Single shared easing curve so every transition on this page feels like
// part of the same motion system instead of several competing curves.
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// The photo panel now carries mode-specific content instead of one static
// hero — a distinct photo, quote, stat, and feature set for each side of
// the flow, so switching sign-in <-> sign-up feels like moving between two
// deliberately designed moments rather than reusing one backdrop.
const PANEL_CONTENT = {
  signUp: {
    photo:
      "https://images.unsplash.com/photo-1623982203080-2881a8aeb1ec?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "Morning light falling across a windowsill crowded with young potted seedlings",
    avatar:
      "https://images.unsplash.com/photo-1610930815255-0c92968e87a2?auto=format&fit=crop&w=480&q=80",
    quote: "Day 1 — first seeds planted.",
    stat: { value: "12,400+", label: "gardens growing" },
    features: [
      { icon: Droplets, label: "Smart watering reminders" },
      { icon: CalendarCheck, label: "Season-by-season tracking" },
      { icon: Users, label: "A community to grow with" },
    ],
    glow: "bg-moss/25",
    mobileQuote: "Every category has room to grow.",
  },
  signIn: {
    photo:
      "https://images.unsplash.com/photo-1610930815255-0c92968e87a2?auto=format&fit=crop&w=1400&q=80",
    photoAlt: "A well-tended garden bed in the warm light of late afternoon",
    avatar:
      "https://images.unsplash.com/photo-1623982203080-2881a8aeb1ec?auto=format&fit=crop&w=480&q=80",
    quote: "Day 42 — first blooms on the balcony tomatoes.",
    stat: { value: "86%", label: "still thriving after 90 days" },
    features: [
      { icon: CalendarCheck, label: "Your personalized care calendar" },
      { icon: ImageIcon, label: "Photo journal & timeline" },
      { icon: CloudSun, label: "Weather-based watering alerts" },
    ],
    glow: "bg-marigold-200/30",
    mobileQuote: "Welcome back — your garden missed you.",
  },
} as const;

// NOTE on the "zoom" that used to appear only when navigating to sign-up:
// the photo panel previously picked up an unintended scale from a layout
// animation compounding with the inner card's own scale transition. The
// image itself never needs to scale here — only the panel's *position*
// changes (see swapTransition below) — so the <img> is never given a
// `layout` prop or a scale keyframe; it always renders at a fixed h-full
// w-full object-cover, and only the wrapping panel translates.
const swapTransition = { duration: 0.7, ease: EASE_OUT };

// Cross-fade + gentle rise for the content *inside* the photo panel
// (photo, quote, stat, features) when the mode changes — independent of
// the panel's left/right position swap.
const contentVariants: Variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// The inner sign-in/sign-up card content slides in from whichever side
// the form panel is arriving from, so its motion direction always agrees
// with the panel swap instead of a fixed left/right assumption.
const slideVariants: Variants = {
  enter: (isSignUp: boolean) => ({ x: isSignUp ? 18 : -18, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (isSignUp: boolean) => ({ x: isSignUp ? -18 : 18, opacity: 0 }),
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const isSignUp = pathname.includes("sign-up");
  const content = isSignUp ? PANEL_CONTENT.signUp : PANEL_CONTENT.signIn;
  const mode = isSignUp ? "sign-up" : "sign-in";

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-canvas lg:h-dvh lg:flex-row">
      {/* ---------------------------------------------------------- */}
      {/* Desktop photo panel — trades sides with the form panel      */}
      {/* whenever the route flips between sign-in and sign-up. Only  */}
      {/* the panel's flex order changes (animated via `layout`); the */}
      {/* photo itself is never resized or scaled, so it never zooms. */}
      {/* ---------------------------------------------------------- */}
      <motion.div
        layout
        transition={swapTransition}
        className={cn(
          "relative hidden shrink-0 overflow-hidden lg:block lg:w-[42%] xl:w-[40%]",
          isSignUp ? "order-2" : "order-1",
        )}
      >
        {/* Ambient glow, mode-tinted (moss for sign-up, marigold for
            sign-in) — a quiet second layer of color behind the glass
            elements so the panel doesn't read as one flat photo. */}
        <motion.div
          key={`${mode}-glow`}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className={cn(
            "pointer-events-none absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full blur-[90px]",
            content.glow,
          )}
          aria-hidden="true"
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            variants={contentVariants}
            initial={prefersReducedMotion ? "center" : "enter"}
            animate="center"
            exit={prefersReducedMotion ? "center" : "exit"}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="absolute inset-0"
          >
            <img src={content.photo} alt={content.photoAlt} className={authPhotoImgClass} />
            <div className={authPhotoScrimClass} aria-hidden="true" />

            {/* Frosted stat pill, top-right */}
            <div className={authPhotoStatPillClass}>
              <span className="font-display text-lg font-semibold leading-none text-canvas">
                {content.stat.value}
              </span>
              <span className="text-[11px] text-canvas/70">{content.stat.label}</span>
            </div>

            {/* Frosted feature list, mid-panel */}
            <div className={authPhotoFeatureCardClass}>
              {content.features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas/15 ring-1 ring-canvas/25">
                    <feature.icon className="h-4 w-4 text-canvas" aria-hidden="true" />
                  </span>
                  <span className="text-[13px] font-medium leading-tight text-canvas/90">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Frosted composed info bar: a short field note on the left,
                the headline stat's photo-credit avatar beside it. */}
            <div className={authPhotoInfoBarClass}>
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={content.avatar}
                  alt=""
                  aria-hidden="true"
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-canvas/30"
                />
                <p className="min-w-0 truncate font-display text-[15px] italic leading-snug text-canvas">
                  &ldquo;{content.quote}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Brand mark, top-left — stays put across mode switches; it
            doubles as the wordmark on screens where the header's own
            logo is hidden (lg but below xl). */}
        <Link href="/" className={authPhotoBrandClass}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas/15 ring-1 ring-canvas/25 backdrop-blur-sm">
            <SproutIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">Sprout</span>
        </Link>
      </motion.div>

      {/* ---------------------------------------------------------- */}
      {/* Mobile photo banner — compact, shown below lg only          */}
      {/* ---------------------------------------------------------- */}
      <div className={authMobileBannerClass}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="absolute inset-0"
          >
            <img src={content.photo} alt={content.photoAlt} className={authPhotoImgClass} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <p className="absolute bottom-3 left-5 font-display text-sm italic text-canvas">
              {content.mobileQuote}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Form panel — trades sides with the photo panel; carries its */}
      {/* own background texture and glow so both travel together.    */}
      {/* ---------------------------------------------------------- */}
      <motion.div
        layout
        transition={swapTransition}
        className={cn("relative flex flex-1 flex-col lg:min-h-0", isSignUp ? "order-1" : "order-2")}
      >
        {/* Background texture — quiet enough that the photo carries the mood */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(63,107,58,0.08)_1px,transparent_0)] bg-[length:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
          <motion.div
            className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-marigold-200/30 blur-[110px]"
            animate={prefersReducedMotion ? undefined : { x: [0, -20, 0], y: [0, 15, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-moss/20 blur-[100px]"
            animate={prefersReducedMotion ? undefined : { x: [0, 16, 0], y: [0, -12, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Top nav */}
        <header className="relative z-20 flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 rounded text-ink transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss lg:hidden xl:flex"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss text-canvas">
              <SproutIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold">Sprout</span>
          </Link>
          <div className="ml-auto flex items-center gap-5">
            <Link href={isSignUp ? "/sign-in" : "/sign-up"} className={authNavLinkClass}>
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
            <Link href="/" className={authNavPillClass}>
              Back to home
            </Link>
          </div>
        </header>

        {/* Center stage — min-h-0 + overflow-y-auto is a safety valve for
            very short viewports; on ordinary screens the tightened card
            and form spacing mean this never needs to scroll. */}
        <main className="relative z-10 flex flex-1 min-h-0 items-center justify-center overflow-y-auto px-6 py-6 sm:py-8">
          <div
            className={cn(
              "relative z-10 w-full max-w-sm",
              isSignUp ? "lg:-mr-10 xl:-mr-14" : "lg:-ml-10 xl:-ml-14",
            )}
          >
            <AnimatePresence mode="wait" custom={isSignUp}>
              <motion.div
                key={isSignUp ? "sign-up" : "sign-in"}
                custom={isSignUp}
                variants={slideVariants}
                initial={prefersReducedMotion ? "center" : "enter"}
                animate="center"
                exit={prefersReducedMotion ? "center" : "exit"}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                style={{ transformOrigin: "center" }}
                className={authCardClass}
              >
                <div className={authCardSheenClass} aria-hidden="true" />
                <div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <div className="relative">{children}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 shrink-0 px-6 pb-5 text-center">
          <p className="font-data text-[11px] text-ink-soft/60">
            © {new Date().getFullYear()} Sprout ·{" "}
            <Link href="/privacy" className="transition-colors hover:text-ink-soft">
              Privacy Policy
            </Link>
          </p>
        </footer>
      </motion.div>
    </div>
  );
}