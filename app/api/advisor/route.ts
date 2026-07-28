import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { BudgetCategory, Goal, Transaction } from "@/types";
import { generateAdvisorNotes, type AdvisorInput } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rateLimit";
import { reportError } from "@/lib/errorReporting";
function isValidBody(body: unknown): body is AdvisorInput {
  if (!body || typeof body !== "object") return false;
  const candidate = body as Record<string, unknown>;
  return (
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.transactions) &&
    Array.isArray(candidate.goals) &&
    (candidate.currencyCode === null ||
      candidate.currencyCode === undefined ||
      typeof candidate.currencyCode === "string")
  );
}
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many Advisor requests — try again in a moment." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Expected categories, transactions, and goals arrays." },
      { status: 400 },
    );
  }
  const input: AdvisorInput = {
    categories: body.categories as BudgetCategory[],
    transactions: body.transactions as Transaction[],
    goals: body.goals as Goal[],
    currencyCode: (body.currencyCode as string | null | undefined) ?? null,
  };
  try {
    const { notes, source } = await generateAdvisorNotes(input);
    return NextResponse.json({ notes, source });
  } catch (error) {
    reportError("Garden Advisor route failed", error);
    return NextResponse.json(
      { error: "The Garden Advisor couldn't reach the greenhouse right now." },
      { status: 500 },
    );
  }
}
