import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";

const corsHeaders = {
  "Access-Control-Allow-Origin": "chrome-extension://*", // W produkcji zmień na konkretny ID wtyczki
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    // Pobierz dane autoryzacji z Clerk
    const authData = await auth(); // Synchroniczne wywołanie
    const { userId, getToken } = authData;

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const { position, company } = await request.json();
    if (!position) {
      return new NextResponse(
        JSON.stringify({ error: "Position is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Pobierz token Supabase z Clerk manualnie
    const supabaseToken = await getToken({ template: "supabase" });
    console.log("User ID from Clerk:", userId); // Debugowanie
    console.log("Supabase Token:", supabaseToken); // Debugowanie

    
    // Utwórz klienta Supabase z tokenem
    const supabase = await createClerkSupabaseClient({
      getToken: async () => supabaseToken,
    } as any); // Tymczasowe obejście typu, dostosuj jeśli typy się zmienią

    const { data, error } = await supabase
      .from("job_offers")
      .insert([{ position, company, user_id: userId }])
      .select();

    if (error) throw error;

    return new NextResponse(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error saving job offer:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to save job offer" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}