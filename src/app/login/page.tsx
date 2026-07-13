import { redirect } from "next/navigation";
import { auth, signIn, ALLOWED_DOMAIN } from "@/auth";

export const metadata = { title: "Sign in // Platform Access" };

// Minimal functional login — the Google sign-in plumbing, no design yet.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");
  const { error } = await searchParams;

  return (
    <main style={{ maxWidth: 360, margin: "20vh auto", padding: "0 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600 }}>Platform Access</h1>
      <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Restricted to @{ALLOWED_DOMAIN} accounts</p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
        style={{ marginTop: 16 }}
      >
        <button type="submit" style={{ padding: "8px 14px", fontSize: 14, cursor: "pointer" }}>
          Sign in with Google
        </button>
      </form>
      {error && <p style={{ color: "#c00", fontSize: 12, marginTop: 8 }}>Can&apos;t sign in with that account.</p>}
    </main>
  );
}
