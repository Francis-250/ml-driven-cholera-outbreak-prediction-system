import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { roleForPath, roleHome } from "@/lib/auth-routing";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const pathname = request.nextUrl.pathname;

  // Seamlessly redirect legacy /doctor paths to /staff
  if (pathname === "/doctor" || pathname.startsWith("/doctor/")) {
    const newPath = pathname.replace(/^\/doctor/, "/staff");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Redirect legacy /community and /patient paths to /staff
  if (
    pathname === "/community" ||
    pathname.startsWith("/community/") ||
    pathname === "/patient" ||
    pathname.startsWith("/patient/")
  ) {
    return NextResponse.redirect(new URL("/staff", request.url));
  }

  const requiredRole = roleForPath(pathname);
  const authEntry = pathname === "/auth/login" || pathname === "/auth/register";
  const isPageRequest = request.method === "GET" || request.method === "HEAD";

  if (!session?.user) {
    if (requiredRole) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  const home = roleHome(session.user.role);

  if (authEntry && isPageRequest) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (requiredRole) {
    const userRole = session.user.role?.toLowerCase();
    const isAllowedStaff =
      requiredRole === "staff" &&
      (userRole === "staff" ||
        userRole === "doctor" ||
        userRole === "community" ||
        userRole === "community_user" ||
        userRole === "patient");

    if (!isAllowedStaff && userRole !== requiredRole) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/staff/:path*",
    "/doctor/:path*",
    "/community/:path*",
    "/patient/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
