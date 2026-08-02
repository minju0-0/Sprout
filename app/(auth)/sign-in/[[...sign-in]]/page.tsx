"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { AuthField } from "@/components/AuthField";
import { authButtonClass, authGhostLinkClass } from "@/lib/authStyles";
type ForgotStep = "request" | "verify" | "reset";
export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  useEffect(() => {
    if (isSignedIn) router.replace("/garden");
  }, [isSignedIn, router]);
  function finalizeAndRedirect() {
    return signIn.finalize({
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
  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    const { error } = await signIn.password({ emailAddress, password });
    if (error) return;
    if (signIn.status === "complete") {
      await finalizeAndRedirect();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) await signIn.mfa.sendEmailCode();
    }
    // needs_second_factor (MFA): not handled — Sprout doesn't enable MFA
    // today. Add a branch here if that changes.
  }
  async function handleClientTrustVerify(event: FormEvent) {
    event.preventDefault();
    await signIn.mfa.verifyEmailCode({ code: mfaCode });
    if (signIn.status === "complete") {
      await finalizeAndRedirect();
    }
  }
  async function handleForgotRequest(event: FormEvent) {
    event.preventDefault();
    const { error: createError } = await signIn.create({ identifier: forgotEmail });
    if (createError) return;
    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendCodeError) return;
    setForgotStep("verify");
  }
  async function handleForgotVerify(event: FormEvent) {
    event.preventDefault();
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: forgotCode });
    if (error) return;
    setForgotStep("reset");
  }
  async function handleForgotReset(event: FormEvent) {
    event.preventDefault();
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });
    if (error) return;
    if (signIn.status === "complete") {
      await finalizeAndRedirect();
    }
  }
  if (signIn.status === "needs_client_trust") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Verify it&apos;s you</h1>
          <p className="mt-1 text-sm text-ink-soft">
            We sent a code to your email to confirm this sign-in.
          </p>
        </div>
        <form onSubmit={handleClientTrustVerify} className="flex flex-col gap-4">
          <AuthField
            id="mfa-code"
            label="Verification code"
            value={mfaCode}
            onChange={setMfaCode}
            error={errors.fields.code?.message}
            autoComplete="one-time-code"
          />
          <button type="submit" disabled={fetchStatus === "fetching"} className={authButtonClass}>
            {fetchStatus === "fetching" ? "Verifying…" : "Verify"}
          </button>
        </form>
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => signIn.mfa.sendEmailCode()} className={authGhostLinkClass}>
            Send a new code
          </button>
          <button type="button" onClick={() => signIn.reset()} className={authGhostLinkClass}>
            Start over
          </button>
        </div>
      </div>
    );
  }
  if (showForgotPassword && forgotStep === "request") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Enter your email and we&apos;ll send you a reset code.
          </p>
        </div>
        <form onSubmit={handleForgotRequest} className="flex flex-col gap-4">
          <AuthField
            id="forgot-email"
            label="Email address"
            type="email"
            value={forgotEmail}
            onChange={setForgotEmail}
            error={errors.fields.identifier?.message}
            autoComplete="email"
          />
          <button type="submit" disabled={fetchStatus === "fetching"} className={authButtonClass}>
            {fetchStatus === "fetching" ? "Sending…" : "Send reset code"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowForgotPassword(false)}
          className={`${authGhostLinkClass} self-start`}
        >
          Back to sign in
        </button>
      </div>
    );
  }
  if (showForgotPassword && forgotStep === "verify") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Check your email</h1>
          <p className="mt-1 text-sm text-ink-soft">Enter the code we sent to {forgotEmail}.</p>
        </div>
        <form onSubmit={handleForgotVerify} className="flex flex-col gap-4">
          <AuthField
            id="forgot-code"
            label="Reset code"
            value={forgotCode}
            onChange={setForgotCode}
            error={errors.fields.code?.message}
            autoComplete="one-time-code"
          />
          <button type="submit" disabled={fetchStatus === "fetching"} className={authButtonClass}>
            {fetchStatus === "fetching" ? "Verifying…" : "Verify code"}
          </button>
        </form>
      </div>
    );
  }
  if (showForgotPassword && forgotStep === "reset") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Set a new password</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Choose something you haven&apos;t used before.
          </p>
        </div>
        <form onSubmit={handleForgotReset} className="flex flex-col gap-4">
          <AuthField
            id="new-password"
            label="New password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            error={errors.fields.password?.message}
            autoComplete="new-password"
          />
          <button type="submit" disabled={fetchStatus === "fetching"} className={authButtonClass}>
            {fetchStatus === "fetching" ? "Saving…" : "Set new password"}
          </button>
        </form>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">Sign in to check on your garden.</p>
      </div>
      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
        <AuthField
          id="email"
          label="Email address"
          type="email"
          value={emailAddress}
          onChange={setEmailAddress}
          error={errors.fields.identifier?.message}
          autoComplete="email"
        />
        <div className="flex flex-col gap-1.5">
          <AuthField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.fields.password?.message}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => {
              setForgotEmail(emailAddress);
              setForgotStep("request");
              setShowForgotPassword(true);
            }}
            className={`${authGhostLinkClass} self-end`}
          >
            Forgot password?
          </button>
        </div>
        <button
          type="submit"
          disabled={fetchStatus === "fetching" || !emailAddress || !password}
          className={authButtonClass}
        >
          {fetchStatus === "fetching" ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-center text-sm text-ink-soft">
        New to Sprout?{" "}
        <Link href="/sign-up" className="font-semibold text-moss hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}