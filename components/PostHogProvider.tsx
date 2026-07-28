"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { initAnalytics, identifyUser } from "@/lib/analytics";
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();
  useEffect(() => {
    initAnalytics();
  }, []);
  useEffect(() => {
    if (isSignedIn && user) {
      identifyUser(user.id);
    }
  }, [isSignedIn, user]);
  return <>{children}</>;
}
