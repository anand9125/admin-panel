import { AlertTriangle, PlugZap } from "lucide-react";
import { TabsEnv } from "@/components/access/tabs-env";
import { FeatureFlagsManager } from "@/components/flags/feature-flags-manager";
import { isPlatformConfigured, BackendError, type Platform } from "@/lib/server/backend";
import { listUsers, type AdminUser } from "@/lib/server/users-api";
import { getFlagConfig } from "@/lib/server/flags-api";
import { defaultFlagConfig, type FlagConfig } from "@/lib/flags";

export const metadata = { title: "Feature flags — Trenchers Admin" };
export const dynamic = "force-dynamic";

function resolveEnv(v?: string): Platform {
  return v === "staging" ? "staging" : "production";
}

export default async function FeatureFlagsPage({ searchParams }: { searchParams: Promise<{ env?: string }> }) {
  const env = resolveEnv((await searchParams).env);
  const configured = isPlatformConfigured(env);

  let users: AdminUser[] = [];
  let total = 0;
  let config: FlagConfig = defaultFlagConfig();
  let error: string | null = null;

  if (configured) {
    try {
      const [usersRes, cfg] = await Promise.all([
        listUsers(env, { limit: 200 }),
        getFlagConfig(env).catch(() => defaultFlagConfig()), // backend may not expose yet
      ]);
      users = usersRes.users;
      total = usersRes.total;
      config = { ...defaultFlagConfig(), ...cfg };
    } catch (e) {
      error = e instanceof BackendError
        ? e.status === 0 ? `Can't reach the ${env} backend — ${e.message}` : `${env} API error (${e.status}): ${e.message}`
        : `Failed to load users.`;
    }
  }

  return (
    <div className="rise space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Feature flags</h1>
        <p className="mt-0.5 max-w-xl text-sm text-muted">
          Roll features out to everyone, no one, or per user. Adding a flag is one line in the
          registry — it appears here automatically.
        </p>
      </div>

      {!configured ? (
        <>
          <TabsEnv tab="flags" env={env} />
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted-2"><PlugZap className="size-5" /></span>
            <p className="mt-3 text-sm font-medium">{env} backend isn&apos;t configured</p>
            <p className="mt-1 max-w-sm text-sm text-muted">Set the {env} API URL + <code className="font-mono text-foreground">OPS_SERVICE_TOKEN</code> to connect.</p>
          </div>
        </>
      ) : error ? (
        <>
          <TabsEnv tab="flags" env={env} />
          <div className="card border-danger/30 p-5">
            <div className="flex items-start gap-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
              <div>
                <p className="font-medium text-danger">Couldn&apos;t load</p>
                <p className="mt-1 text-muted">{error}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <FeatureFlagsManager env={env} users={users} total={total} config={config} demo={false} envSwitch={<TabsEnv tab="flags" env={env} />} />
      )}
    </div>
  );
}
