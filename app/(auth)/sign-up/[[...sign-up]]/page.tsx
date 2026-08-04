"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { AuthField } from "@/components/AuthField";
import { OAuthButtons } from "@/components/OAuthButtons";
import { AuthDivider } from "@/components/AuthDivider";
import { authButtonClass, authGhostLinkClass } from "@/lib/authStyles";

// Same easing curve used by the layout's card transition, so the inner
// view swap (form → verify → done) feels like one continuous motion
// system rather than two different animations layered on top of each
// other.
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Only opacity + a small y shift here — no scale — so this never
// compounds with the layout's own card/panel transitions.
const viewTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: EASE_OUT },
};

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isSignedIn) router.replace("/garden");
  }, [isSignedIn, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { error } = await signUp.password({
      emailAddress,
      password,
      firstName,
      lastName,
    });
    if (error) return;

    await signUp.verifications.sendEmailCode();
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/garden");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    }
  }

  const view =
    signUp.status === "complete" || isSignedIn
      ? "done"
      : signUp.status === "missing_requirements" &&
          signUp.unverifiedFields.includes("email_address") &&
          signUp.missingFields.length === 0
        ? "verify"
        : "form";

  return (
    <AnimatePresence mode="wait">
      {view === "done" && <motion.div key="done" {...viewTransition} />}

      {view === "verify" && (
        <motion.div key="verify" {...viewTransition} className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-2xl text-ink">Check your email</h1>
            <p className="mt-1 text-sm text-ink-soft">
              We sent a verification code to {emailAddress || "your email"}.
            </p>
          </div>
          <form onSubmit={handleVerify} className="flex flex-col gap-3.5">
            <AuthField
              id="code"
              label="Verification code"
              value={code}
              onChange={setCode}
              error={errors.fields.code?.message}
              autoComplete="one-time-code"
            />
            <button type="submit" disabled={fetchStatus === "fetching"} className={authButtonClass}>
              {fetchStatus === "fetching" ? "Verifying…" : "Verify email"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => signUp.verifications.sendEmailCode()}
            className={`${authGhostLinkClass} self-start`}
          >
            Send a new code
          </button>
        </motion.div>
      )}

      {view === "form" && (
        <motion.div key="form" {...viewTransition} className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-2xl text-ink">Plant your garden</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Create an account to start tracking your first season.
            </p>
          </div>

          <OAuthButtons mode="sign-up" />
          <AuthDivider label="or sign up with email" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <AuthField
                id="firstName"
                label="First name"
                value={firstName}
                onChange={setFirstName}
                error={errors.fields.firstName?.message}
                autoComplete="given-name"
              />
              <AuthField
                id="lastName"
                label="Last name"
                value={lastName}
                onChange={setLastName}
                error={errors.fields.lastName?.message}
                autoComplete="family-name"
              />
            </div>
            <AuthField
              id="emailAddress"
              label="Email address"
              type="email"
              value={emailAddress}
              onChange={setEmailAddress}
              error={errors.fields.emailAddress?.message}
              autoComplete="email"
            />
            <AuthField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.fields.password?.message}
              autoComplete="new-password"
            />
            {/* required to catch captcha renders if enabled */}
            <div id="clerk-captcha" />

            <button
              type="submit"
              disabled={
                fetchStatus === "fetching" || !firstName || !lastName || !emailAddress || !password
              }
              className={authButtonClass}
            >
              {fetchStatus === "fetching" ? "Creating your account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-moss hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}