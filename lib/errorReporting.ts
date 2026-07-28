import * as Sentry from "@sentry/nextjs";
export function reportError(context: string, error: unknown) {
  console.error(context, error);
  Sentry.captureException(error, { extra: { context } });
}
