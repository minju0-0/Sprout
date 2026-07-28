import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageview } from "@/components/PostHogPageview";
import "./globals.css";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sprout.example.com";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sprout — The Living Budget Garden",
    template: "%s — Sprout",
  },
  description:
    "A budget planner that reimagines personal finance as a living garden — every category is a plant, every dollar you save waters it.",
  keywords: ["budgeting app", "personal finance", "budget tracker", "savings goals"],
  openGraph: {
    title: "Sprout — The Living Budget Garden",
    description:
      "A budget planner that reimagines personal finance as a living garden — every category is a plant, every dollar you save waters it.",
    url: siteUrl,
    siteName: "Sprout",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sprout — The Living Budget Garden",
    description:
      "A budget planner that reimagines personal finance as a living garden — every category is a plant, every dollar you save waters it.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#3f6b3a",
          colorBackground: "#eef1e4",
          colorInput: "#f7f8f0",
          colorForeground: "#262a1f",
          colorMutedForeground: "#5c6152",
          colorDanger: "#b5553a",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-body)",
        },
      }}
    >
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col font-body">
          <PostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageview />
            </Suspense>
            {children}
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
