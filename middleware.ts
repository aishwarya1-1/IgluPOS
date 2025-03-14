// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // If the user is not logged in and trying to access protected routes
  if (
    !session &&
    (pathname.startsWith("/admin") || pathname.startsWith("/billing"))
  ) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // If logged in user tries to access the wrong area
  if (session?.user?.userType === "employee" && pathname.startsWith("/admin")) {
    const url = new URL("/billing", request.url);
    return NextResponse.redirect(url);
  }

  if (session?.user?.userType === "store" && pathname.startsWith("/billing")) {
    const url = new URL("/admin", request.url);
    return NextResponse.redirect(url);
  }

  // If logged in user tries to access login page
  if (session && pathname === "/") {
    if (session.user.userType === "employee") {
      const url = new URL("/billing", request.url);
      return NextResponse.redirect(url);
    } else if (session.user.userType === "store") {
      const url = new URL("/admin", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/billing/:path*"],
};
