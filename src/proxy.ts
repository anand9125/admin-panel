import { NextResponse } from "next/server";
import { auth, emailAllowed } from "@/auth";

// Gate the whole panel. Auth endpoints, login, Next internals and public assets
// are exempt; everything else needs an allowed @trenchers.ai login.
export default auth((req) => {
  if (emailAllowed(req.auth?.user?.email)) return;
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/login", req.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico|logo-mark.svg|robots.txt).*)"],
};
