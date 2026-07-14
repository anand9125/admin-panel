"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Zap, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { setUserLiveTrading } from "@/app/actions";
import type { Platform } from "@/lib/server/backend";
import type { AdminUser } from "@/lib/server/users-api";

function shortWallet(w?: string | null) {
  if (!w) return null;
  return w.length > 12 ? `${w.slice(0, 4)}…${w.slice(-4)}` : w;
}

export function LiveTradingTable({ env, users, total, query }: { env: Platform; users: AdminUser[]; total: number; query: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(query);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const liveCount = users.filter((u) => u.live_trading_enabled).length;

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("env", env);
    if (q.trim()) params.set("q", q.trim());
    router.push(`/live-trading?${params.toString()}`);
  };

  const toggle = (u: AdminUser, next: boolean) => {
    setError(null);
    setBusyId(u.id);
    start(async () => {
      const res = await setUserLiveTrading(env, u.id, next);
      setBusyId(null);
      if (res?.error) return setError(res.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat icon={Users} label="Total users" value={total} tone="muted" />
        <Stat icon={Zap} label="Live in view" value={liveCount} tone="accent" />
        <div className="hidden sm:block" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-accent" />
            <h2 className="text-sm font-semibold">Users</h2>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs tabular-nums text-muted">
              {query ? `${users.length} of ${total}` : total}
            </span>
          </div>
          <form onSubmit={search} className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-2" />
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <input id="user-search" value={q} onChange={(e) => setQ(e.target.value)} type="search"
              placeholder="Search email, wallet, name…"
              className="focus-ring h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-2 sm:w-64" />
          </form>
        </div>

        {users.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted-2"><UserIcon className="size-5" /></span>
            <p className="mt-3 text-sm font-medium">{query ? "No users match" : "No users yet"}</p>
            <p className="mt-1 max-w-xs text-sm text-muted">{query ? "Try a different search." : `No signed-up users on ${env}.`}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-2">
                  <th className="px-5 py-2.5 font-medium">User</th>
                  <th className="px-4 py-2.5 font-medium">Funding wallet</th>
                  <th className="px-4 py-2.5 text-right font-medium">Live trading</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const name = u.display_name || u.username || u.email || shortWallet(u.wallet_address) || "Unknown";
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 transition-colors hover:bg-surface-2/40">
                      <td className="px-5 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted"><UserIcon className="size-4" /></span>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-medium text-foreground">{name}</div>
                            {u.email && <div className="truncate font-mono text-[11px] text-muted-2">{u.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-2">{shortWallet(u.funding_wallet_address) ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2.5">
                          <span className={cn("text-xs tabular-nums", u.live_trading_enabled ? "text-accent" : "text-muted-2")}>
                            {u.live_trading_enabled ? "On" : "Off"}
                          </span>
                          <Switch checked={u.live_trading_enabled} onChange={(v) => toggle(u, v)} disabled={pending && busyId === u.id} label={`Live trading for ${name}`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number; tone: "muted" | "accent" }) {
  const chip = { muted: "bg-surface-2 text-muted-2", accent: "bg-accent/12 text-accent" }[tone];
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", chip)}><Icon className="size-[18px]" /></span>
      <div className="min-w-0">
        <div className="font-mono text-[26px] font-semibold leading-none tabular-nums">{value}</div>
        <div className="mt-1.5 text-xs text-muted">{label}</div>
      </div>
    </div>
  );
}
