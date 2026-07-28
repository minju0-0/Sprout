"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useBudgetStore } from "@/store/budgetStore";
export function useSignOutRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const wasSignedIn = useRef(false);
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      wasSignedIn.current = true;
      return;
    }
    if (wasSignedIn.current) {
      wasSignedIn.current = false;
      useBudgetStore.persist.clearStorage();
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);
}
