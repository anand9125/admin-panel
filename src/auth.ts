import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Google OAuth, locked to the company Workspace domain. Only verified
// @trenchers.ai accounts may reach the admin panel — enforced in the signIn
// callback (login) and the authorized callback (every request, via middleware).
export const ALLOWED_DOMAIN = process.env.ADMIN_ALLOWED_DOMAIN ?? "trenchers.ai";

function allowlist(): Set<string> | null {
  const raw = process.env.ADMIN_ALLOWED_EMAILS?.trim();
  if (!raw) return null;
  return new Set(raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));
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
    Google({ authorization: { params: { prompt: "select_account", hd: ALLOWED_DOMAIN } } }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ profile }) {
      return emailAllowed(profile?.email, (profile as { email_verified?: boolean })?.email_verified);
    },
    authorized({ auth }) {
      return emailAllowed(auth?.user?.email);
    },
  },
});
