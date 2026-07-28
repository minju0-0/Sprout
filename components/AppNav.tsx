"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sprout as SproutIcon,
  Receipt,
  Wallet,
  TreePine,
  PieChart,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
const NAV_LINKS = [
  { href: "/garden", label: "Garden", icon: SproutIcon },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/goals", label: "Goals", icon: TreePine },
  { href: "/reports", label: "Reports", icon: PieChart },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;
const MOBILE_TAB_LINKS = NAV_LINKS.filter((link) => link.href !== "/settings");
function isLinkActive(pathname: string, href: string) {
  return href === "/garden" ? pathname === href : pathname.startsWith(href);
}
export function AppNav() {
  const pathname = usePathname();
  return (
    <>
      {}
      <nav
        aria-label="Main"
        className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-1 border-r border-moss/15 bg-card px-3 py-6 lg:flex"
      >
        <div className="mb-4 px-3">
          <p className="font-display text-lg text-ink">Sprout</p>
        </div>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = isLinkActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
                isActive
                  ? "bg-moss/10 text-moss"
                  : "text-ink-soft hover:bg-moss/10 hover:text-moss active:bg-moss/20",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      {}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-moss/15 bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {MOBILE_TAB_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = isLinkActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-moss active:bg-moss/10",
                isActive ? "text-moss" : "text-ink-soft",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
