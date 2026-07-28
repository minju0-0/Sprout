import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { GardenState } from "@/types";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { reportError } from "@/lib/errorReporting";
interface GardenStateRow {
  categories: GardenState["categories"];
  transactions: GardenState["transactions"];
  goals: GardenState["goals"];
  debts: GardenState["debts"] | null;
  active_season: string;
  harvest_history: GardenState["harvestHistory"];
  currency_code: GardenState["currencyCode"];
  unallocated: GardenState["unallocated"] | null;
  allocation_history: GardenState["allocationHistory"] | null;
}
function isValidGardenState(body: unknown): body is GardenState {
  if (!body || typeof body !== "object") return false;
  const candidate = body as Record<string, unknown>;
  return (
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.transactions) &&
    Array.isArray(candidate.goals) &&
    Array.isArray(candidate.debts) &&
    typeof candidate.activeSeason === "string" &&
    Array.isArray(candidate.harvestHistory) &&
    (candidate.currencyCode === null || typeof candidate.currencyCode === "string") &&
    typeof candidate.unallocated === "number" &&
    Array.isArray(candidate.allocationHistory)
  );
}
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("garden_states")
      .select(
        "categories, transactions, goals, debts, active_season, harvest_history, currency_code, unallocated, allocation_history",
      )
      .eq("user_id", userId)
      .maybeSingle<GardenStateRow>();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ state: null });
    }
    const state: GardenState = {
      categories: data.categories,
      transactions: data.transactions,
      goals: data.goals,
      debts: data.debts ?? [],
      activeSeason: data.active_season,
      harvestHistory: data.harvest_history,
      currencyCode: data.currency_code,
      unallocated: data.unallocated ?? 0,
      allocationHistory: data.allocation_history ?? [],
    };
    return NextResponse.json({ state });
  } catch (error) {
    reportError("Garden state fetch failed", error);
    return NextResponse.json(
      { error: "Couldn't load your saved garden right now." },
      { status: 500 },
    );
  }
}
export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValidGardenState(body)) {
    return NextResponse.json(
      {
        error:
          "Expected categories, transactions, goals, debts, activeSeason, harvestHistory, currencyCode, unallocated, and allocationHistory.",
      },
      { status: 400 },
    );
  }
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("garden_states").upsert({
      user_id: userId,
      categories: body.categories,
      transactions: body.transactions,
      goals: body.goals,
      debts: body.debts,
      active_season: body.activeSeason,
      harvest_history: body.harvestHistory,
      currency_code: body.currencyCode,
      unallocated: body.unallocated,
      allocation_history: body.allocationHistory,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    reportError("Garden state save failed", error);
    return NextResponse.json(
      { error: "Couldn't save your garden right now." },
      { status: 500 },
    );
  }
}