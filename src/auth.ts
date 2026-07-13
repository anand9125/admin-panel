import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Google OAuth, locked to the company Workspace domain — same identity model as
// ops, but this is a SEPARATE app. Signing in here grants ONLY the Platform
// Access panel; it never touches ops.trenchers.ai or the secrets console.
export const ALLOWED_DOMAIN = process.env.ACCESS_PANEL_DOMAIN ?? "trenchers.ai";

/**
 * Optional per-person gate. If ACCESS_PANEL_ALLOWED_EMAILS is set (comma-
 * separated), ONLY those addresses may use the panel. If unset, any verified
 * @<ALLOWED_DOMAIN> Google account may. Either way the domain check always
 * applies, so an allow-listed non-company address can never slip through.
 */
function allowlist(): Set<string> | null {
  const raw = process.env.ACCESS_PANEL_ALLOWED_EMAILS?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function emailAllowed(email?: string | null, verified?: boolean): boolean {
  if (!email || verified === false) return false;
  const e = email.toLowerCase();
  if (!e.endsWith(`@${ALLOWED_DOMAIN}`)) return false;
  const list = allowlist();
  return list ? list.has(e) : true;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: { params: { prompt: "select_account", hd: ALLOWED_DOMAIN } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ profile }) {
      return emailAllowed(
        profile?.email,
        (profile as { email_verified?: boolean })?.email_verified,
      );
    },
    authorized({ auth }) {
      return emailAllowed(auth?.user?.email);
    },
  },
});
