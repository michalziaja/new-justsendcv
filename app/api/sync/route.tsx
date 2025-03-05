import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

// Typ dla odpowiedzi z Clerk
interface ClerkUser {
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string;
  lastName?: string;
}

export async function GET() {
  const authResult = await auth(); // Poczekaj na wynik auth
  const userId = authResult.userId; // Pobierz userId z wyniku
  const user = await currentUser(); // Pobierz dane użytkownika

  if (userId) {
    const token = await authResult.getToken(); // Pobierz token JWT z authResult
    return NextResponse.json({
      isLoggedIn: true,
      userData: {
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
      },
      token: token, // Zwracamy token w odpowiedzi
    }, { status: 200 });
  } else {
    return NextResponse.json({ 
      isLoggedIn: false,
      userData: null,
      token: null, // Brak tokenu dla niezalogowanego
    }, { status: 200 });
  }
}