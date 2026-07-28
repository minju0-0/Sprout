import { GoogleGenAI } from "@google/genai";
import type { AdvisorAnswer, AdvisorNote, BudgetCategory, Goal, Transaction } from "@/types";
import { getGrowthStage, getPercentSpent } from "@/lib/gardenLogic";
import { formatCurrency } from "@/lib/currency";
export interface AdvisorInput {
  categories: BudgetCategory[];
  transactions: Transaction[];
  goals: Goal[];
  currencyCode: string | null;
}
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "mock-key";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
let genAI: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return genAI;
}
const SYSTEM_PROMPT = `You are the Garden Advisor inside Sprout, a budgeting app where every
spending category is rendered as a plant and every savings goal as a tree.
You are given the real, already-computed numbers for the current season —
never invent figures that aren't in the digest.
Write 2-4 short advisor notes (one sentence each, under 25 words) in a warm,
observational tone that leans on the garden metaphor without being twee.
Reference at least one concrete number or category name per note. Prefer
noting categories that are wilting/overgrown or a goal that's close to
complete. Do not repeat the same category in two notes.
Respond with ONLY a JSON array, no markdown fences, no prose before or
after, matching this shape:
[{ "categoryId": "groceries", "message": "..." }]
"categoryId" is optional — omit it for a note about a goal or the garden
as a whole.`;
const ASK_SYSTEM_PROMPT = `You are the Garden Advisor inside Sprout, a budgeting app where every
spending category is rendered as a plant and every savings goal as a tree.
You are given the real, already-computed numbers for the current season and
a single question from the user. Answer using only those numbers — never
invent figures that aren't in the digest. If the digest doesn't contain
enough information to answer, say so plainly instead of guessing.
Write ONE short answer (under 55 words total) in a warm, observational tone
that leans on the garden metaphor without being twee. This is a single
note-style answer, not the start of a conversation.
The answer must end with a short parenthetical in plain, literal language —
no metaphor — that states the direct, practical takeaway in one clause, e.g.
"(meaning: hold off until you're back under budget)". This is so the answer
is clear even to someone skimming past the metaphor.
Respond with ONLY a JSON object, no markdown fences, no prose before or
after, matching this shape:
{ "categoryId": "groceries", "message": "..." }
"categoryId" is optional — omit it unless the answer is about one specific
category.`;
function buildDigest({ categories, goals, currencyCode }: AdvisorInput): string {
  const categoryLines = categories.map((category) => {
    const percent = Math.round(getPercentSpent(category) * 100);
    const stage = getGrowthStage(getPercentSpent(category));
    return `- id: ${category.id} | ${category.name}: ${formatCurrency(
      category.spent,
      currencyCode,
    )} of ${formatCurrency(category.budgetLimit, currencyCode)} (${percent}%, ${stage})`;
  });
  const goalLines = goals.map((goal) => {
    const percent =
      goal.targetAmount > 0
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0;
    return `- ${goal.name}: ${formatCurrency(goal.currentAmount, currencyCode)} of ${formatCurrency(
      goal.targetAmount,
      currencyCode,
    )} (${percent}%)`;
  });
  return [
    "Budget categories this season:",
    categoryLines.length > 0 ? categoryLines.join("\n") : "(none yet)",
    "",
    "Savings goals:",
    goalLines.length > 0 ? goalLines.join("\n") : "(none yet)",
  ].join("\n");
}
function parseNotes(rawText: string, categories: BudgetCategory[]): AdvisorNote[] {
  const cleaned = rawText.trim().replace(/^```json\s*|\s*```$/g, "");
  const parsed: unknown = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Advisor response was not an array.");
  const validCategoryIds = new Set(categories.map((category) => category.id));
  return parsed
    .filter(
      (entry): entry is { categoryId?: string; message: string } =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as { message?: unknown }).message === "string",
    )
    .slice(0, 4)
    .map((entry) => ({
      id: crypto.randomUUID(),
      categoryId:
        typeof entry.categoryId === "string" && validCategoryIds.has(entry.categoryId)
          ? entry.categoryId
          : undefined,
      message: entry.message,
    }));
}
function buildFallbackNotes({ categories, goals, currencyCode }: AdvisorInput): AdvisorNote[] {
  const notes: AdvisorNote[] = [];
  for (const category of categories) {
    const percent = getPercentSpent(category);
    const stage = getGrowthStage(percent);
    if (stage === "overgrown") {
      notes.push({
        id: crypto.randomUUID(),
        categoryId: category.id,
        message: `${category.name} has gone over budget — ${formatCurrency(
          category.spent,
          currencyCode,
        )} against a ${formatCurrency(category.budgetLimit, currencyCode)} limit. Weeds are creeping in.`,
      });
    } else if (stage === "wilting") {
      notes.push({
        id: crypto.randomUUID(),
        categoryId: category.id,
        message: `${category.name} is close to its limit at ${Math.round(
          percent * 100,
        )}% spent — worth keeping an eye on for the rest of the season.`,
      });
    }
  }
  const healthiestCategory = [...categories].sort(
    (a, b) => getPercentSpent(a) - getPercentSpent(b),
  )[0];
  if (healthiestCategory && getPercentSpent(healthiestCategory) < 0.5) {
    notes.push({
      id: crypto.randomUUID(),
      categoryId: healthiestCategory.id,
      message: `${healthiestCategory.name} is thriving, only ${Math.round(
        getPercentSpent(healthiestCategory) * 100,
      )}% spent so far this season.`,
    });
  }
  const closestGoal = [...goals]
    .filter((goal) => goal.targetAmount > 0 && goal.currentAmount < goal.targetAmount)
    .sort(
      (a, b) =>
        b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount,
    )[0];
  if (closestGoal) {
    const percent = Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100);
    notes.push({
      id: crypto.randomUUID(),
      message: `Your ${closestGoal.name} tree is ${percent}% grown — ${formatCurrency(
        closestGoal.targetAmount - closestGoal.currentAmount,
        currencyCode,
      )} left to reach full height.`,
    });
  }
  return notes.slice(0, 4);
}
function parseAskAnswer(rawText: string, categories: BudgetCategory[]): AdvisorAnswer {
  const cleaned = rawText.trim().replace(/^```json\s*|\s*```$/g, "");
  const parsed: unknown = JSON.parse(cleaned);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Advisor answer was not an object.");
  }
  const candidate = parsed as { categoryId?: unknown; message?: unknown };
  if (typeof candidate.message !== "string" || candidate.message.trim().length === 0) {
    throw new Error("Advisor answer had no message.");
  }
  const validCategoryIds = new Set(categories.map((category) => category.id));
  return {
    categoryId:
      typeof candidate.categoryId === "string" && validCategoryIds.has(candidate.categoryId)
        ? candidate.categoryId
        : undefined,
    message: candidate.message,
  };
}
function buildAskFallbackAnswer(input: AdvisorInput): AdvisorAnswer {
  const [firstNote] = buildFallbackNotes(input);
  if (firstNote) {
    return {
      categoryId: firstNote.categoryId,
      message: `I can't read specific questions without a live connection right now, but here's what's true this season: ${firstNote.message} (meaning: this doesn't answer your question directly — it's today's real number instead).`,
    };
  }
  return {
    message:
      "I can't read specific questions without a live connection right now, and there isn't enough garden data yet for a general note either — add a category or transaction first. (meaning: nothing to report on yet).",
  };
}
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { status?: unknown; code?: unknown };
  if (typeof candidate.status === "number") return candidate.status;
  if (typeof candidate.code === "number") return candidate.code;
  return undefined;
}
function isRetryable(status: number | undefined): boolean {
  return status === 429 || status === 503;
}
async function callGemini(input: AdvisorInput): Promise<AdvisorNote[]> {
  const maxAttempts = 2;
  const client = getClient();
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildDigest(input),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
        },
      });
      const rawText = response.text;
      if (!rawText) throw new Error("Gemini response had no text content.");
      return parseNotes(rawText, input.categories);
    } catch (error) {
      const status = getErrorStatus(error);
      if (isRetryable(status) && attempt < maxAttempts) {
        await sleep(500 * attempt);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Gemini request exhausted its retries.");
}
async function callGeminiAsk(input: AdvisorInput, question: string): Promise<AdvisorAnswer> {
  const maxAttempts = 2;
  const client = getClient();
  const prompt = `${buildDigest(input)}\n\nQuestion: ${question}`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: ASK_SYSTEM_PROMPT,
          responseMimeType: "application/json",
        },
      });
      const rawText = response.text;
      if (!rawText) throw new Error("Gemini response had no text content.");
      return parseAskAnswer(rawText, input.categories);
    } catch (error) {
      const status = getErrorStatus(error);
      if (isRetryable(status) && attempt < maxAttempts) {
        await sleep(500 * attempt);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Gemini request exhausted its retries.");
}
export interface AdvisorResult {
  notes: AdvisorNote[];
  source: "live" | "fallback";
}
export async function generateAdvisorNotes(input: AdvisorInput): Promise<AdvisorResult> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "mock-key") {
    return { notes: buildFallbackNotes(input), source: "fallback" };
  }
  try {
    const notes = await callGemini(input);
    return { notes, source: "live" };
  } catch (error) {
    console.warn("Garden Advisor: falling back to local notes.", error);
    return { notes: buildFallbackNotes(input), source: "fallback" };
  }
}
export interface AdvisorAnswerResult {
  answer: AdvisorAnswer;
  source: "live" | "fallback";
}
export async function answerAdvisorQuestion(
  input: AdvisorInput,
  question: string,
): Promise<AdvisorAnswerResult> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "mock-key") {
    return { answer: buildAskFallbackAnswer(input), source: "fallback" };
  }
  try {
    const answer = await callGeminiAsk(input, question);
    return { answer, source: "live" };
  } catch (error) {
    console.warn("Garden Advisor ask: falling back to local answer.", error);
    return { answer: buildAskFallbackAnswer(input), source: "fallback" };
  }
}
