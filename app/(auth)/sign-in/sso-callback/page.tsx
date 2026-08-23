"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";

// Give Clerk a window to finish exchanging the OAuth code before we give up
// and send the user back. `signIn`/`signUp` change identity as that
// processing completes, which is what re-triggers the effect below — this
// timeout only fires if that never happens at all.
const GIVE_UP_TIMEOUT_MS = 10000;

export default function SignInSSOCallbackPage() {
  const clerk = useClerk();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const router = useRouter();
  // Guards the *action* (finalize/navigate), not the status check — the
  // effect itself should keep re-running as signIn/signUp settle.
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
      // Clerk is still exchanging the OAuth code — signIn.status isn't
      // trustworthy yet. Wait; this effect re-runs once it settles because
      // signIn/signUp get new references when that happens.
      if (signInFetchStatus === "fetching" || signUpFetchStatus === "fetching") return;

      if (signIn.status === "complete") {
        committedRef.current = true;
        await signIn.finalize({ navigate: navigateHome });
        return;
      }

      if (signUp.isTransferable) {
        const { error } = await signIn.create({ transfer: true });
        // See note in earlier version: String(...) sidesteps a stale TS
        // narrowing of signIn.status after this call, no runtime effect.
        if (!error && String(signIn.status) === "complete") {
          committedRef.current = true;
          await signIn.finalize({ navigate: navigateHome });
          return;
        }
      }

      if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
        committedRef.current = true;
        router.push("/sign-in");
        return;
      }

      // Otherwise: not settled into a recognized state yet. Don't bounce
      // immediately — only the GIVE_UP_TIMEOUT_MS timeout above should send
      // the user back if this genuinely never resolves.
    })();
  }, [clerk.loaded, signIn, signUp, signInFetchStatus, signUpFetchStatus]);

  useEffect(() => {
    if (timedOut && !committedRef.current) {
      committedRef.current = true;
      router.push("/sign-in");
    }
  }, [timedOut, router]);

  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-moss/25 border-t-moss" />
      <p className="text-sm text-ink-soft">Finishing sign-in…</p>
      <div id="clerk-captcha" />
    </div>
  );
}