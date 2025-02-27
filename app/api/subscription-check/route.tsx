//app/api/subscription-check/route.tsx

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";

export async function GET(request: Request) {
  // Użycie await przy wywołaniu auth(), aby uzyskać obiekt Auth
  const authObj = await auth();
  const { userId } = authObj;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClerkSupabaseClient({
    getToken: async () => await authObj.getToken({ template: "supabase" }) || "",
  } as any);

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, plan")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 to "no rows found"
    console.error("Błąd pobierania subskrypcji:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: data?.status || null,
    plan: data?.plan || null,
  }, { status: 200 });
}