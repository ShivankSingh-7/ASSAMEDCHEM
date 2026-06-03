import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/seller/dashboard", req.url));
    }
  }

  // Protect seller routes
  if (pathname.startsWith("/seller")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.user.role !== "SELLER") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/login" || pathname === "/register") && session) {
    if (session.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/seller/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/login", "/register"],
};
