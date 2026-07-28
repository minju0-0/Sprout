import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { reportError } from "@/lib/errorReporting";
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("garden_states").delete().eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    reportError("Account data deletion failed", error);
    return NextResponse.json(
      { error: "Couldn't delete your saved garden data right now." },
      { status: 500 },
    );
  }
}
