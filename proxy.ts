import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { roleForPath, roleHome } from "@/lib/auth-routing";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const pathname = request.nextUrl.pathname;

  // Seamlessly redirect legacy /patient paths to /community
  if (pathname === "/patient" || pathname.startsWith("/patient/")) {
    const newPath = pathname.replace(/^\/patient/, "/community");
    return NextResponse.redirect(new URL(newPath, request.url));
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
    const isAllowedCommunity =
      requiredRole === "community" &&
      (userRole === "community" ||
        userRole === "community_user" ||
        userRole === "patient");

    if (!isAllowedCommunity && userRole !== requiredRole) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/community/:path*",
    "/patient/:path*",
    "/doctor/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
