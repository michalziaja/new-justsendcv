import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();

  if (userId) {
    return NextResponse.json({
      isLoggedIn: true,
      userData: {
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName
      }
    }, { 
      status: 200 
    });
  } else {
    return NextResponse.json({ 
      isLoggedIn: false,
      userData: null 
    }, { 
      status: 200 
    });
  }
}