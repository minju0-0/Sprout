"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";

const GIVE_UP_TIMEOUT_MS = 10000;

export default function SignUpSSOCallbackPage() {
  const clerk = useClerk();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const router = useRouter();
  const committedRef = useRef(false);
  const [timedOut, setTimedOut] = useState(false);

  async function navigateHome({
    session,
    decorateUrl,
  }: {
    session?: { currentTask?: unknown } | null;
    decorateUrl: (url: string) => string;
  }) {
    if (session?.currentTask) return;
    const url = decorateUrl("/garden");
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  }

  useEffect(() => {
    const giveUp = setTimeout(() => setTimedOut(true), GIVE_UP_TIMEOUT_MS);
    return () => clearTimeout(giveUp);
  }, []);

  useEffect(() => {
    if (committedRef.current) return;

    (async () => {
      if (!clerk.loaded) return;
      if (signInFetchStatus === "fetching" || signUpFetchStatus === "fetching") return;

      if (signUp.status === "complete") {
        committedRef.current = true;
        await signUp.finalize({ navigate: navigateHome });
        return;
      }

      if (signIn.isTransferable) {
        const { error } = await signIn.create({ transfer: true });
        if (!error && String(signIn.status) === "complete") {
          committedRef.current = true;
          await signIn.finalize({ navigate: navigateHome });
          return;
        }
      }

      if (signUp.status === "missing_requirements") {
        committedRef.current = true;
        router.push("/sign-up");
        return;
      }

      // Not settled yet — let it keep re-checking; GIVE_UP_TIMEOUT_MS above
      // is the only thing allowed to bounce the user back on its own.
    })();
  }, [clerk.loaded, signIn, signUp, signInFetchStatus, signUpFetchStatus]);

  useEffect(() => {
    if (timedOut && !committedRef.current) {
      committedRef.current = true;
      router.push("/sign-up");
    }
  }, [timedOut, router]);

  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-moss/25 border-t-moss" />
      <p className="text-sm text-ink-soft">Finishing sign-up…</p>
      <div id="clerk-captcha" />
    </div>
  );
}