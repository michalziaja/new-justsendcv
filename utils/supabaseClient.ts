import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/nextjs'

// Typ sesji wyciągamy z useSession
type ClerkSession = ReturnType<typeof useSession>["session"]

// Funkcja przyjmuje sesję jako argument
export async function createClerkSupabaseClient(session: ClerkSession) {
  const supabaseToken = await session?.getToken({ template: "supabase" })
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`
        }
      }
    }
  )
}