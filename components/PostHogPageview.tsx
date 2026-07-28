"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { capturePageview } from "@/lib/analytics";
export function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const query = searchParams.toString();
    capturePageview(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);
  return null;
}
