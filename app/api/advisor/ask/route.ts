import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { BudgetCategory, Goal, Transaction } from "@/types";
import { answerAdvisorQuestion, type AdvisorInput } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rateLimit";
import { reportError } from "@/lib/errorReporting";
const MAX_QUESTION_LENGTH = 300;
function isValidBody(body: unknown): body is AdvisorInput & { question: string } {
  if (!body || typeof body !== "object") return false;
  const candidate = body as Record<string, unknown>;
  return (
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.transactions) &&
    Array.isArray(candidate.goals) &&
    (candidate.currencyCode === null ||
      candidate.currencyCode === undefined ||
      typeof candidate.currencyCode === "string") &&
    typeof candidate.question === "string" &&
    candidate.question.trim().length > 0
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
      { error: "Expected categories, transactions, goals arrays and a question." },
      { status: 400 },
    );
  }
  const question = body.question.trim().slice(0, MAX_QUESTION_LENGTH);
  const input: AdvisorInput = {
    categories: body.categories as BudgetCategory[],
    transactions: body.transactions as Transaction[],
    goals: body.goals as Goal[],
    currencyCode: (body.currencyCode as string | null | undefined) ?? null,
  };
  try {
    const { answer, source } = await answerAdvisorQuestion(input, question);
    return NextResponse.json({ answer, source });
  } catch (error) {
    reportError("Garden Advisor ask route failed", error);
    return NextResponse.json(
      { error: "The Garden Advisor couldn't reach the greenhouse right now." },
      { status: 500 },
    );
  }
}
