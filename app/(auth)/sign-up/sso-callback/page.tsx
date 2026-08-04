"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SignUpSSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signUpForceRedirectUrl="/garden"
      signUpFallbackRedirectUrl="/garden"
    />
  );
}
