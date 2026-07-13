"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addEntry, toggleEntry, deleteEntry, type ActionResult } from "@/app/actions";
import { PLATFORMS, type Platform } from "@/lib/whitelist-api";

export interface WhitelistEntryRow {
  id: string;
  kind: "email" | "wallet";
  value: string;
  note: string | null;
  enabled: boolean;
  added_by: string | null;
  created_at: string;
  source: "admin" | "request";
  requested_at: string | null;
  attempts: number;
}

export interface EnvData {
  entries: WhitelistEntryRow[];
  error: string | null;
  configured: boolean;
}

function dt(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16).replace("T", " ") + "Z";
}

export function WhitelistPanel({ data }: { data: Record<Platform, EnvData> }) {
  // Default to the first configured environment (production-only deploys start there).
  const firstConfigured = PLATFORMS.find((p) => data[p].configured) ?? PLATFORMS[0];
  const [env, setEnv] = useState<Platform>(firstConfigured);
  const current = data[env];

  return (
    <section className="space-y-5">
      {/* Environment tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {PLATFORMS.map((p) => {
          const active = p === env;
          const isProd = p === "production";
          const count = data[p].entries.filter((e) => e.enabled).length;
          const pendingCount = data[p].entries.filter((e) => !e.enabled).length;
          return (
            <button
              key={p}
              onClick={() => setEnv(p)}
              className={[
                "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                active
                  ? isProd
                    ? "border-accent-red text-accent-red"
                    : "border-accent-blue text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              ].join(" ")}
            >
              {p}
              {data[p].configured && (
                <span className="rounded-full bg-background-elevated px-1.5 py-0.5 text-[10px] text-muted-faint">
                  {count}
                  {pendingCount > 0 && <span className="text-accent-amber"> +{pendingCount}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Production guard banner */}
      {env === "production" && (
        <div className="rounded-lg border border-accent-red/30 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
          ⚠ You are editing the <strong>PRODUCTION</strong> access list — real users. Changes take
          effect on their next sign-in.
        </div>
      )}

      {current.error ? (
        <div className="panel rounded-2xl border border-accent-red/30 bg-accent-red/5 p-5 text-sm text-accent-red">
          {current.error}
          <p className="mt-2 text-xs text-muted">
            Check the {env} backend URL + <code className="font-mono">OPS_SERVICE_TOKEN</code>, and
            that the platform API is reachable and has the whitelist deployed.
          </p>
        </div>
      ) : (
        <EnvPanel env={env} entries={current.entries} />
      )}
    </section>
  );
}

/** The add form + requests + allowed tables for a single environment. */
function EnvPanel({ env, entries }: { env: Platform; entries: WhitelistEntryRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<"email" | "wallet">("email");
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<ActionResult>, onOk?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res?.error) {
        setError(res.error);
        return;
      }
      onOk?.();
      router.refresh();
    });
  }

  const requests = entries.filter((e) => !e.enabled);
  const allowed = entries.filter((e) => e.enabled);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-faint">
          <span className="text-accent-green">{allowed.length}</span> allowed ·{" "}
          <span className={requests.length ? "text-accent-amber" : "text-muted-faint"}>
            {requests.length}
          </span>{" "}
          pending
        </div>
        <button
          onClick={() => {
            setAdding((v) => !v);
            setError(null);
          }}
          className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          + Add to {env} list
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-accent-red/30 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
          {error}
        </div>
      )}

      {adding && (
        <form
          action={(fd) => run(() => addEntry(env, fd), () => setAdding(false))}
          className="panel flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-end"
        >
          <label className="sm:w-32">
            <span className="mb-1 block text-xs text-muted">Type</span>
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as "email" | "wallet")}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="email">email</option>
              <option value="wallet">wallet</option>
            </select>
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs text-muted">
              {kind === "email" ? "Google / login email" : "Connected wallet (base58)"}
            </span>
            <input
              name="value"
              required
              type={kind === "email" ? "email" : "text"}
              placeholder={kind === "email" ? "trader@gmail.com" : "7xKq…9aBc"}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-faint focus:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="sm:w-44">
            <span className="mb-1 block text-xs text-muted">Note</span>
            <input
              name="note"
              placeholder="optional"
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-faint focus:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <button
            disabled={pending}
            type="submit"
            className="rounded-lg bg-accent-green/15 px-4 py-2 text-sm font-medium text-accent-green hover:bg-accent-green/25 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {/* Access requests — people who tried to log in but aren't allowed yet. */}
      {requests.length > 0 && (
        <div>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent-amber">
            Access requests <span className="font-normal text-muted-faint">· {requests.length}</span>
          </h2>
          <p className="mb-3 text-xs text-muted">
            Tried to log in and were turned away. Flip <span className="text-accent-green">Allow</span> to let them in, or Remove to dismiss.
          </p>
          <div className="panel overflow-x-auto rounded-2xl border border-accent-amber/25">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-faint">
                  <th className="px-5 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Email / wallet</th>
                  <th className="px-4 py-2 font-medium">Last tried</th>
                  <th className="px-4 py-2 font-medium">Tries</th>
                  <th className="px-4 py-2 font-medium">Source</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((e) => (
                  <tr key={e.id} className="text-foreground/90">
                    <td className="px-5 py-3">
                      <span className={e.kind === "email" ? "text-accent-blue" : "text-accent-green"}>
                        {e.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{e.value}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted">
                      {e.requested_at ? dt(e.requested_at) : dt(e.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted">{e.attempts || "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {e.source === "request" ? (
                        <span className="text-accent-amber">requested</span>
                      ) : (
                        <span className="text-muted-faint">disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3 text-xs">
                        <button
                          onClick={() => run(() => toggleEntry(env, e.id, true, e.value))}
                          disabled={pending}
                          className="rounded-md bg-accent-green/15 px-2.5 py-1 font-medium text-accent-green transition-colors hover:bg-accent-green/25 disabled:opacity-40"
                        >
                          Allow
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Dismiss the access request from ${e.value}?`))
                              run(() => deleteEntry(env, e.id, e.value));
                          }}
                          disabled={pending}
                          className="text-muted-faint transition-colors hover:text-accent-red disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allowed — people who can log in. */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Allowed <span className="font-normal text-muted-faint">· {allowed.length}</span>
        </h2>
        <div className="panel overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-faint">
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Email / wallet</th>
                <th className="px-4 py-2 font-medium">Note</th>
                <th className="px-4 py-2 font-medium">Added by</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allowed.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted">
                    Nobody is allowed on {env} yet — nobody can log in. Add someone above, or Allow a
                    request.
                  </td>
                </tr>
              ) : (
                allowed.map((e) => (
                  <tr key={e.id} className="text-foreground/90">
                    <td className="px-5 py-3">
                      <span className={e.kind === "email" ? "text-accent-blue" : "text-accent-green"}>
                        {e.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {e.value}
                      <div className="text-[10px] text-muted-faint">{dt(e.created_at)}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{e.note ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted">{e.added_by ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3 text-xs">
                        <button
                          onClick={() => run(() => toggleEntry(env, e.id, false, e.value))}
                          disabled={pending}
                          className="text-muted transition-colors hover:text-foreground disabled:opacity-40"
                        >
                          Disable
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${e.value} from the ${env} access list? They'll be locked out on next login.`))
                              run(() => deleteEntry(env, e.id, e.value));
                          }}
                          disabled={pending}
                          className="text-muted-faint transition-colors hover:text-accent-red disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
