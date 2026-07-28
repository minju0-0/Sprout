"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings as SettingsIcon } from "lucide-react";
import { useGardenSync } from "@/hooks/useGardenSync";
import { useSignOutRedirect } from "@/hooks/useSignOutRedirect";
import { AppNav } from "@/components/AppNav";
import { PageTransition } from "@/components/PageTransition";
import { cn } from "@/lib/cn";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useGardenSync();
  useSignOutRedirect();
  return (
    <div className="flex flex-1 bg-canvas">
      <AppNav />
      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
        {
}
        <header className="flex items-center justify-between border-b border-moss/15 bg-card px-4 py-3 lg:hidden">
          <p className="font-display text-lg text-ink">Sprout</p>
          <Link
            href="/settings"
            aria-current={pathname.startsWith("/settings") ? "page" : undefined}
            aria-label="Settings"
            className={cn(
              "rounded-full p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
              pathname.startsWith("/settings")
                ? "bg-moss/10 text-moss"
                : "text-ink-soft hover:bg-moss/10 hover:text-moss active:bg-moss/20",
            )}
          >
            <SettingsIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
        </header>
        <main className="flex flex-1 flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
