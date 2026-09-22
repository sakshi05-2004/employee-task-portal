import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, type SessionUser } from "@/lib/auth/session";

const SESSION_COOKIE = "session";

function dashboardPathFor(user: SessionUser) {
  if (user.mustChangePassword) return "/change-password";
  return user.role === "admin" ? "/admin" : "/employee";
}

// Gates every page route: bounces anonymous visitors to /login, keeps
// admins and employees out of each other's areas, and forces a
// password change before anything else is reachable. API routes check
// auth themselves (see lib/auth/guards.ts) and are excluded below so a
// fetch() never receives an HTML redirect where it expects JSON.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySession(token) : null;

  const isLoginPage = pathname === "/login";
  const isChangePasswordPage = pathname === "/change-password";
  const isAdminArea = pathname.startsWith("/admin");
  const isEmployeeArea = pathname.startsWith("/employee");
  const isProtected = isAdminArea || isEmployeeArea || isChangePasswordPage;

  if (!user) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (isLoginPage || pathname === "/") {
    return NextResponse.redirect(new URL(dashboardPathFor(user), request.url));
  }

  if (user.mustChangePassword && !isChangePasswordPage) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  if (isAdminArea && user.role !== "admin") {
    return NextResponse.redirect(new URL("/employee", request.url));
  }

  if (isEmployeeArea && user.role !== "employee") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
