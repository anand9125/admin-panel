import { redirect } from "next/navigation";
import { auth, emailAllowed, signOut } from "@/auth";
import { LogoMark } from "@/components/brand";
import {
  listWhitelist,
  isPlatformConfigured,
  WhitelistApiError,
  PLATFORMS,
  type Platform,
  type WhitelistEntry,
} from "@/lib/whitelist-api";
import { WhitelistPanel, type EnvData } from "@/components/whitelist-panel";

export const dynamic = "force-dynamic";

/** Load one environment's list, turning any failure into a display string. */
async function loadEnv(env: Platform): Promise<EnvData> {
  if (!isPlatformConfigured(env)) {
    return { entries: [], error: `${env} backend is not configured`, configured: false };
  }
  try {
    const entries: WhitelistEntry[] = await listWhitelist(env);
    return { entries, error: null, configured: true };
  } catch (e) {
    const error =
      e instanceof WhitelistApiError
        ? e.status === 0
          ? `Can't reach the ${env} API — ${e.message}`
          : `${env} API error (${e.status}): ${e.message}`
        : `Failed to load the ${env} access list.`;
    return { entries: [], error, configured: true };
  }
}

export default async function AccessPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!emailAllowed(email)) redirect("/login");

  const [staging, production] = await Promise.all(PLATFORMS.map(loadEnv));

  return (
    <div className="bg-aurora bg-grid relative min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-7" />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              Trenchers<span className="text-gradient">.AI</span>
            </span>
            <span className="rounded-md border border-accent-blue/30 bg-accent-blue/10 px-1.5 py-0.5 font-mono text-[10px] text-accent-blue">
              platform access
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-muted-faint md:inline">{email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Platform access list</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Only people on this list can log into the Trenchers platform. Add a Google email or a
            connected wallet; people who try to log in without access show up as requests you can
            approve in one click.
          </p>
        </div>

        <WhitelistPanel data={{ staging, production }} />
      </main>
    </div>
  );
}
