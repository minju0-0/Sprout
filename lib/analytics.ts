"use client";
import posthog from "posthog-js";
let initialized = false;
export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false,
    autocapture: false,
    person_profiles: "identified_only",
  });
  initialized = true;
}
export function identifyUser(userId: string) {
  if (!initialized) return;
  posthog.identify(userId);
}
export function capturePageview(url: string) {
  if (!initialized) return;
  posthog.capture("$pageview", { $current_url: url });
}
export function captureEvent(name: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(name, properties);
}
