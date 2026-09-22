import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

// Lets client components read who is logged in without decoding the
// session cookie themselves.
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user,
  });
}
