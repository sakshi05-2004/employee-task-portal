import { NextResponse } from "next/server";
import { getCurrentUser } from "./current-user";
import type { SessionUser } from "./session";

type GuardResult =
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

// Shared helper for route handlers: resolves the logged-in user or
// returns the NextResponse that should be sent back immediately.
//
//   const auth = await requireRole("admin");
//   if (auth.error) return auth.error;
//   const { user } = auth;
export async function requireRole(
  role: "admin" | "employee"
): Promise<GuardResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (user.role !== role) {
    return {
      error: NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function requireUser(): Promise<GuardResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { user };
}
