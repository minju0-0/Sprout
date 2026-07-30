"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Sprout as SproutIcon,
  Receipt,
  Wallet,
  TreePine,
  PieChart,
  Settings as SettingsIcon,
  Coins,
} from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
import { CurrencyProfilePage } from "@/components/CurrencyProfilePage";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/garden", label: "Garden", icon: SproutIcon },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/goals", label: "Goals & Debts", icon: TreePine },
  { href: "/reports", label: "Reports", icon: PieChart },
] as const;
const MOBILE_TAB_LINKS = NAV_LINKS;

function isLinkActive(pathname: string, href: string) {
  return href === "/garden" ? pathname === href : pathname.startsWith(href);
}

export function AppNav() {
  const pathname = usePathname();
  const activeSeason = useBudgetStore((state) => state.activeSeason);
  const { user } = useUser();

  return (
    <>
      <nav
        aria-label="Main"
        className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-moss/10 bg-card px-4 py-6 lg:flex"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 px-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss text-canvas">
              <SproutIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-base leading-none text-ink">Sprout</p>
              <p className="text-[11px] text-ink-soft">{activeSeason}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = isLinkActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
                    isActive
                      ? "bg-moss/10 text-moss-700 font-semibold"
                      : "text-ink-soft hover:bg-moss/5 hover:text-ink active:bg-moss/10",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/settings"
            aria-current={pathname.startsWith("/settings") ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
              pathname.startsWith("/settings")
                ? "bg-moss/10 text-moss-700 font-semibold"
                : "text-ink-soft hover:bg-moss/5 hover:text-ink active:bg-moss/10",
            )}
          >
            <SettingsIcon className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>
          <div className="mt-2 flex items-center gap-2 rounded-lg px-2 py-2">
            <UserButton>
              <UserButton.UserProfilePage
                label="Currency"
                url="currency"
                labelIcon={<Coins className="h-4 w-4" aria-hidden="true" />}
              >
                <CurrencyProfilePage />
              </UserButton.UserProfilePage>
            </UserButton>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {user?.fullName ?? user?.firstName ?? "Your account"}
              </p>
              <p className="truncate text-xs text-ink-soft">
                {user?.primaryEmailAddress?.emailAddress ?? ""}
              </p>
            </div>
          </div>
        </div>
      </nav>
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
                "flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-moss active:bg-moss/10",
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