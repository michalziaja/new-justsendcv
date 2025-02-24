// import { clerkMiddleware } from '@clerk/nextjs/server'

// export default clerkMiddleware()


// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// }

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";

const isPublicRoute = createRouteMatcher([
  "/", "/sign-in(.*)", 
  "/sign-up(.*)", 
  "/api(.*)"
]);

const isDashboardRoute = createRouteMatcher(
  ["/calculator(.*)", 
    "/dashboard(.*)",
    "/profile(.*)", 
    "/saved(.*)", 
    "/stats(.*)", 
    "/subscriptions(.*)", 
    "/success(.*)", 
    "/training(.*)", 
    "/upgrade(.*)"
  ]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Pozwól na publiczne trasy bez sprawdzania
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Jeśli użytkownik nie jest zalogowany, przekieruj na sign-in
  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Sprawdź subskrypcję użytkownika
  const supabase = await createClerkSupabaseClient({
    getToken: async () => process.env.SUPABASE_SERVICE_ROLE_KEY!, // Klucz serwisowy
  } as any);

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .single();

  // Jeśli użytkownik nie ma subskrypcji i próbuje wejść na dashboard, przekieruj na /welcome
  if (!subscription && isDashboardRoute(req)) {
    return NextResponse.redirect(new URL("/welcome", req.url));
  }

  // Jeśli użytkownik ma subskrypcję lub jest na innej trasie, kontynuuj
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};