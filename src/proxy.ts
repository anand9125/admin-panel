import { NextResponse } from "next/server";
import { auth, emailAllowed } from "@/auth";

// Gate the whole app. Everything except the auth endpoints, the login page,
// Next internals and public assets requires an allowed Google login.
export default auth((req) => {
  if (emailAllowed(req.auth?.user?.email)) return; // authenticated → proceed

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/login", req.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|logo.png|logo-mark.svg|logo-full.svg|robots.txt).*)",
  ],
};
