"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, User as UserIcon, ChevronRight, Info, Coins, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { setPaperDefault, setUserPaper, type ActionResult } from "@/app/actions";
import type { Platform } from "@/lib/server/backend";
import type { AdminUser } from "@/lib/server/users-api";
import {
  SYSTEM_DEFAULT_LAMPORTS,
  lamportsToSol, solToLamports, formatSol, effectiveSeedLamports, hasOverride,
} from "@/lib/paper";

function displayName(u: AdminUser) {
  return u.display_name || u.username || u.email || (u.wallet_address ? `${u.wallet_address.slice(0, 4)}…${u.wallet_address.slice(-4)}` : "Unknown");
}

/** Parse a SOL string to lamports, or `null` if blank/invalid/negative. */
function parseSol(input: string): number | null {
  const t = input.trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return solToLamports(n);
}

export function PaperSolManager({
  env, users, total, defaultLamports, envSwitch,
}: {
  env: Platform;
  users: AdminUser[];
  total: number;
  defaultLamports: number | null;
  envSwitch?: React.ReactNode;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const [localUsers, setLocalUsers] = useState(users);
  const [globalDefault, setGlobalDefault] = useState(defaultLamports);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setLocalUsers(users), [users]);
  useEffect(() => setGlobalDefault(defaultLamports), [defaultLamports]);

  const persist = (fn: () => Promise<ActionResult>) => {
    start(async () => {
      const res = await fn();
      if (res?.error) { setError(res.error); router.refresh(); }
    });
  };

  const saveDefault = (lamports: number | null) => {
    setError(null);
    setGlobalDefault(lamports);
    persist(() => setPaperDefault(env, lamports));
  };
  const saveUser = (userId: string, lamports: number | null) => {
    setError(null);
    setLocalUsers((list) => list.map((u) => (u.id === userId ? { ...u, paper_seed_lamports: lamports } : u)));
    persist(() => setUserPaper(env, userId, lamports));
  };

  const selected = selectedId ? localUsers.find((u) => u.id === selectedId) ?? null : null;
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return localUsers.filter((u) => !s || [u.email, u.username, u.display_name, u.wallet_address, u.funding_wallet_address].some((f) => f?.toLowerCase().includes(s)));
  }, [localUsers, q]);
  const overrides = useMemo(() => localUsers.filter(hasOverride).length, [localUsers]);

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">{error}</div>}

      {envSwitch}

      <GlobalDefaultCard value={globalDefault} overrides={overrides} onSave={saveDefault} />

      <UsersList users={filtered} total={total} globalDefault={globalDefault} q={q} setQ={setQ} onOpen={setSelectedId} />

      <UserDrawer user={selected} globalDefault={globalDefault} onClose={() => setSelectedId(null)} onSave={saveUser} />
    </div>
  );
}

/* ---- Global default ----------------------------------------------- */

function GlobalDefaultCard({ value, overrides, onSave }: { value: number | null; overrides: number; onSave: (l: number | null) => void }) {
  const [input, setInput] = useState("");
  useEffect(() => setInput(value != null ? String(lamportsToSol(value)) : ""), [value]);

  const parsed = parseSol(input);
  const effective = value ?? SYSTEM_DEFAULT_LAMPORTS;
  const isSystem = value == null;
  // Dirty only when the parsed value differs from what's stored.
  const dirty = parsed !== value && !(parsed == null && value == null);

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Coins className="size-4 text-accent" />
        <h2 className="text-sm font-semibold">Global default</h2>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            Every user starts with this much <span className="font-medium text-foreground">paper SOL</span> to trade with. Changing it applies{" "}
            <span className="font-medium text-foreground">instantly</span> to all existing and future users — except the{" "}
            <span className="font-medium text-foreground">{overrides}</span> with a custom amount below.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="paper-default" className="mb-1.5 block text-xs font-medium text-muted-2">Default paper balance</label>
            <div className="relative flex items-center">
              <input
                id="paper-default"
                type="number" min="0" step="any" inputMode="decimal"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && dirty && parsed != null) onSave(parsed); }}
                placeholder="10"
                className="focus-ring h-11 w-full rounded-lg border border-border bg-background pl-3.5 pr-14 text-sm tabular-nums placeholder:text-muted-2"
              />
              <span className="pointer-events-none absolute right-3.5 text-xs font-medium text-muted-2">SOL</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-2">
              {isSystem
                ? <>Currently the system default of <span className="tabular-nums text-muted">{formatSol(SYSTEM_DEFAULT_LAMPORTS)} SOL</span>.</>
                : <>Currently <span className="tabular-nums text-muted">{formatSol(effective)} SOL</span>.</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isSystem && (
              <button
                onClick={() => onSave(null)}
                className="focus-ring inline-flex h-11 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                title={`Reset to the system default of ${formatSol(SYSTEM_DEFAULT_LAMPORTS)} SOL`}
              >
                <RotateCcw className="size-3.5" /> Reset
              </button>
            )}
            <button
              onClick={() => parsed != null && onSave(parsed)}
              disabled={!dirty || parsed == null}
              className="focus-ring inline-flex h-11 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-opacity disabled:opacity-40"
            >
              <Check className="size-4" /> Save
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Users list --------------------------------------------------- */

function UsersList({ users, total, globalDefault, q, setQ, onOpen }: {
  users: AdminUser[]; total: number; globalDefault: number | null; q: string; setQ: (v: string) => void; onOpen: (id: string) => void;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <UserIcon className="size-4 text-accent" />
          <h2 className="text-sm font-semibold">Per-user overrides</h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs tabular-nums text-muted">{q ? `${users.length} of ${total}` : total}</span>
        </div>
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-2" />
          <span className="sr-only">Search users</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search email, wallet, name…"
            className="focus-ring h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-2 sm:w-64" />
        </label>
      </div>
      {users.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted-2"><UserIcon className="size-5" /></span>
          <p className="mt-3 text-sm font-medium">{q ? "No users match" : "No users yet"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-2">
                <th className="px-5 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Paper balance</th>
                <th className="px-4 py-2.5 text-right font-medium">Manage</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const override = hasOverride(u);
                const seed = effectiveSeedLamports(u, globalDefault);
                return (
                  <tr key={u.id} onClick={() => onOpen(u.id)} className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-surface-2/50">
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted"><UserIcon className="size-4" /></span>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-foreground">{displayName(u)}</div>
                          {u.email && <div className="truncate font-mono text-[11px] text-muted-2">{u.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums text-sm font-medium">{formatSol(seed)} <span className="text-xs font-normal text-muted-2">SOL</span></span>
                        {override
                          ? <span className="rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">Custom</span>
                          : <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-2">Default</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={(ev) => { ev.stopPropagation(); onOpen(u.id); }} aria-label={`Manage ${displayName(u)}`} className="focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground">
                          <ChevronRight className="size-4" />
                        </button>
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
  );
}

/* ---- Per-user drawer ---------------------------------------------- */

function UserDrawer({ user, globalDefault, onClose, onSave }: {
  user: AdminUser | null; globalDefault: number | null; onClose: () => void; onSave: (userId: string, lamports: number | null) => void;
}) {
  const u = user;
  const [input, setInput] = useState("");
  useEffect(() => {
    setInput(u?.paper_seed_lamports != null ? String(lamportsToSol(u.paper_seed_lamports)) : "");
  }, [u]);

  if (!u) return null;
  const override = hasOverride(u);
  const inherited = globalDefault ?? SYSTEM_DEFAULT_LAMPORTS;
  const effective = effectiveSeedLamports(u, globalDefault);
  const parsed = parseSol(input);
  const dirty = parsed !== u.paper_seed_lamports && !(parsed == null && u.paper_seed_lamports == null);

  return (
    <Drawer
      open={!!u}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-muted"><UserIcon className="size-4" /></span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{displayName(u)}</div>
            <div className="truncate font-mono text-xs text-muted-2">{u.email ?? u.wallet_address}</div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onSave(u.id, null)}
            disabled={!override}
            className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
            title="Remove the override — inherit the global default"
          >
            <RotateCcw className="size-3.5" /> Clear override
          </button>
          <button
            onClick={() => { if (parsed != null) onSave(u.id, parsed); }}
            disabled={!dirty || parsed == null}
            className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            <Check className="size-4" /> Save
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface px-3.5 py-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-2">Current</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{formatSol(effective)} <span className="text-xs font-normal text-muted-2">SOL</span></p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-3.5 py-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-2">Source</p>
            <p className="mt-1 text-sm font-medium">{override ? "Custom override" : "Global default"}</p>
          </div>
        </div>

        <div>
          <label htmlFor="user-paper" className="mb-1.5 block text-xs font-medium text-muted-2">Custom paper balance</label>
          <div className="relative flex items-center">
            <input
              id="user-paper"
              type="number" min="0" step="any" inputMode="decimal"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && dirty && parsed != null) onSave(u.id, parsed); }}
              placeholder={String(lamportsToSol(inherited))}
              className="focus-ring h-11 w-full rounded-lg border border-border bg-background pl-3.5 pr-14 text-sm tabular-nums placeholder:text-muted-2"
            />
            <span className="pointer-events-none absolute right-3.5 text-xs font-medium text-muted-2">SOL</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-2">
            Leave blank &amp; clear to inherit the global default of{" "}
            <span className="tabular-nums text-muted">{formatSol(inherited)} SOL</span>. Applies instantly — paper balance is derived from this seed.
          </p>
        </div>
      </div>
    </Drawer>
  );
}
