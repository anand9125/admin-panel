import { AlertTriangle, PlugZap } from "lucide-react";
import { TabsEnv } from "@/components/access/tabs-env";
import { WhitelistManager } from "@/components/access/whitelist-manager";
import { isPlatformConfigured, BackendError, type Platform } from "@/lib/server/backend";
import { listWhitelist, type WhitelistEntry } from "@/lib/server/whitelist-api";

export const metadata = { title: "Platform access — Trenchers Admin" };
export const dynamic = "force-dynamic";

function resolveEnv(v?: string): Platform {
  return v === "staging" ? "staging" : "production";
}

export default async function AccessPage({ searchParams }: { searchParams: Promise<{ env?: string }> }) {
  const env = resolveEnv((await searchParams).env);
  const configured = isPlatformConfigured(env);

  let entries: WhitelistEntry[] = [];
  let error: string | null = null;
  if (configured) {
    try {
      entries = await listWhitelist(env);
    } catch (e) {
      error = e instanceof BackendError
        ? e.status === 0 ? `Can't reach the ${env} backend — ${e.message}` : `${env} API error (${e.status}): ${e.message}`
        : `Failed to load the ${env} access list.`;
    }
  }

  return (
    <div className="rise space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Platform access</h1>
        <p className="mt-0.5 max-w-xl text-sm text-muted">
          Control who can log into Trenchers. Add an email or wallet, or approve people who requested access.
        </p>
      </div>

      <TabsEnv tab="access" env={env} />

      {!configured ? (
        <NotConfigured env={env} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <WhitelistManager env={env} entries={entries} />
      )}
    </div>
  );
}

function NotConfigured({ env }: { env: Platform }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted-2"><PlugZap className="size-5" /></span>
      <p className="mt-3 text-sm font-medium">{env} backend isn&apos;t configured</p>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Set <code className="font-mono text-foreground">SOLANA_TERMINAL_API_URL_{env === "production" ? "PRODUCTION" : "STAGING"}</code> and{" "}
        <code className="font-mono text-foreground">OPS_SERVICE_TOKEN_{env === "production" ? "PRODUCTION" : "STAGING"}</code> to connect.
      </p>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="card border-danger/30 p-5">
      <div className="flex items-start gap-3 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
        <div>
          <p className="font-medium text-danger">Couldn&apos;t load access list</p>
          <p className="mt-1 text-muted">{message}</p>
        </div>
      </div>
    </div>
  );
}
