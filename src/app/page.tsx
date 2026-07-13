import { redirect } from "next/navigation";
import { auth, emailAllowed } from "@/auth";
import { logout } from "@/app/actions";

export const dynamic = "force-dynamic";

// Blank slate. Auth + backend plumbing is wired (see src/auth.ts, src/lib/
// whitelist-api.ts, src/app/actions.ts); the UI is intentionally empty and
// gets rebuilt from here.
export default async function HomePage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!emailAllowed(email)) redirect("/login");

  return (
    <main style={{ maxWidth: 480, margin: "20vh auto", padding: "0 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600 }}>Platform Access</h1>
      <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
        Signed in as {email}. UI to be rebuilt.
      </p>
      <form action={logout} style={{ marginTop: 16 }}>
        <button type="submit" style={{ padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>
          Sign out
        </button>
      </form>
    </main>
  );
}
