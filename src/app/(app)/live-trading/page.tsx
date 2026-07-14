import { AlertTriangle, PlugZap } from "lucide-react";
import { TabsEnv } from "@/components/access/tabs-env";
import { LiveTradingTable } from "@/components/access/live-trading-table";
import { isPlatformConfigured, BackendError, type Platform } from "@/lib/server/backend";
import { listUsers, type AdminUser } from "@/lib/server/users-api";

export const metadata = { title: "Live trading — Trenchers Admin" };
export const dynamic = "force-dynamic";

function resolveEnv(v?: string): Platform {
  return v === "staging" ? "staging" : "production";
}

export default async function LiveTradingPage({ searchParams }: { searchParams: Promise<{ env?: string; q?: string }> }) {
  const sp = await searchParams;
  const env = resolveEnv(sp.env);
  const query = (sp.q ?? "").trim();
  const configured = isPlatformConfigured(env);

  let users: AdminUser[] = [];
  let total = 0;
  let error: string | null = null;
  if (configured) {
    try {
      const res = await listUsers(env, { search: query || undefined, limit: 100 });
      users = res.users;
      total = res.total;
    } catch (e) {
      error = e instanceof BackendError
        ? e.status === 0 ? `Can't reach the ${env} backend — ${e.message}` : `${env} API error (${e.status}): ${e.message}`
        : `Failed to load users.`;
    }
  }

  return (
    <div className="rise space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Live trading</h1>
        <p className="mt-0.5 max-w-xl text-sm text-muted">
          Grant real-money bot trading per user. Only enabled users can create and run live (non-paper) bots.
        </p>
      </div>

      <TabsEnv tab="live" env={env} />

      {!configured ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted-2"><PlugZap className="size-5" /></span>
          <p className="mt-3 text-sm font-medium">{env} backend isn&apos;t configured</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Set the {env} API URL + <code className="font-mono text-foreground">OPS_SERVICE_TOKEN</code> to connect.
          </p>
        </div>
      ) : error ? (
        <div className="card border-danger/30 p-5">
          <div className="flex items-start gap-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
            <div>
              <p className="font-medium text-danger">Couldn&apos;t load users</p>
              <p className="mt-1 text-muted">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <LiveTradingTable env={env} users={users} total={total} query={query} />
      )}
    </div>
  );
}
