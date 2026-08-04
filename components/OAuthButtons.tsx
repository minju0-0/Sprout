"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { motion, type Variants } from "framer-motion";

const PROVIDERS = [
  {
    strategy: "oauth_google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.28-2.1 3.59-5.2 3.59-8.84z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.94H1.27v3.11C3.25 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a11.98 11.98 0 0 0 0 10.8l4.01-3.11z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77z"
        />
      </svg>
    ),
  },
  {
    strategy: "oauth_facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#1877F2"
          d="M24 12.07C24 5.66 18.63.29 12.07.29S.15 5.66.15 12.07c0 5.79 4.24 10.59 9.77 11.46v-8.1H7.08v-3.36h2.84V9.6c0-2.81 1.67-4.36 4.23-4.36 1.22 0 2.5.22 2.5.22v2.75h-1.41c-1.39 0-1.82.86-1.82 1.75v2.11h3.1l-.5 3.36h-2.6v8.1c5.53-.87 9.77-5.67 9.77-11.46z"
        />
      </svg>
    ),
  },
] as const;

type OAuthStrategy = (typeof PROVIDERS)[number]["strategy"];

interface OAuthButtonsProps {
  mode: "sign-in" | "sign-up";
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

export function OAuthButtons({ mode }: OAuthButtonsProps) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [pending, setPending] = useState<OAuthStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Both hook objects return an authenticateWithRedirect shape, so we can cast loosely here
  const client: any = mode === "sign-in" ? signIn : signUp;
  const isLoaded = Boolean(client);

  async function handleClick(strategy: OAuthStrategy) {
    if (!client) {
      setError("Auth isn't ready yet — wait a moment and try again.");
      return;
    }
    if (pending) return;

    setPending(strategy);
    setError(null);

    try {
      const redirectUrl = `/${mode}/sso-callback`;
      const redirectUrlComplete = "/garden";

      if (typeof client.authenticateWithRedirect === "function") {
        await client.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
      } else if (client.value && typeof client.value.authenticateWithRedirect === "function") {
        await client.value.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
      } else if (client.sso && typeof client.sso.authenticateWithRedirect === "function") {
        await client.sso.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
      }
    } catch (err) {
      console.error(`[OAuthButtons] ${strategy} failed:`, err);
      const message =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors?: { message?: string }[] }).errors?.[0]?.message
          : undefined;

      setError(
        message ??
          `Couldn't start ${
            strategy === "oauth_google" ? "Google" : "Facebook"
          } sign-in.`
      );
      setPending(null);
    }
  }

  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center justify-center gap-2.5"
      >
        {PROVIDERS.map((provider) => (
          <motion.button
            key={provider.strategy}
            variants={item}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => handleClick(provider.strategy)}
            disabled={!isLoaded || pending !== null}
            className="pointer-events-auto relative z-10 flex cursor-pointer items-center gap-2 rounded-full border border-white/50 bg-white/30 px-4 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-md transition-colors hover:border-moss/30 hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === provider.strategy ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-moss/25 border-t-moss" />
            ) : (
              provider.icon
            )}
            {provider.label}
          </motion.button>
        ))}
      </motion.div>
      {error && <p className="text-xs font-medium text-rust">{error}</p>}
    </div>
  );
}