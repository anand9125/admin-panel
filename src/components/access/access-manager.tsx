"use client";

import { useMemo, useState } from "react";
import {
  Mail, Wallet, Plus, Check, X, Search, Clock, AlertTriangle,
  ShieldCheck, Ban, RotateCcw, Trash2, CheckCircle2, Inbox, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { INITIAL_ACCESS, type Env, type Kind, type AccessEntry } from "@/lib/access-data";

const ENVS: Env[] = ["staging", "production"];

let idc = 1000;
const newId = () => `n${++idc}`;

export function AccessManager() {
  const [env, setEnv] = useState<Env>("production");
  const [data, setData] = useState(INITIAL_ACCESS);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Kind>("all");
  const [adding, setAdding] = useState(false);

  const entries = data[env];
  const update = (fn: (list: AccessEntry[]) => AccessEntry[]) =>
    setData((d) => ({ ...d, [env]: fn(d[env]) }));

  const pending = entries.filter((e) => e.status === "pending");
  const allowedAll = entries.filter((e) => e.status === "allowed");
  const emails = entries.filter((e) => e.kind === "email").length;
  const wallets = entries.filter((e) => e.kind === "wallet").length;
  const liveBots = allowedAll.filter((e) => e.liveBot).length;

  const allowed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allowedAll.filter(
      (e) =>
        (typeFilter === "all" || e.kind === typeFilter) &&
        (!q || e.value.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q)),
    );
  }, [allowedAll, query, typeFilter]);

  /* actions */
  const approve = (id: string) =>
    update((list) =>
      list.map((e) => (e.id === id ? { ...e, status: "allowed", enabled: true, addedBy: "anand@trenchers.ai", addedAt: "just now" } : e)),
    );
  const dismiss = (id: string) => update((list) => list.filter((e) => e.id !== id));
  const remove = (e: AccessEntry) => {
    if (confirm(`Remove ${e.value} from the ${env} list? They'll lose access on next login.`))
      update((list) => list.filter((x) => x.id !== e.id));
  };
  const toggleEnabled = (id: string) =>
    update((list) => list.map((e) => (e.id === id ? { ...e, enabled: e.enabled === false } : e)));
  const toggleLiveBot = (id: string) =>
    update((list) => list.map((e) => (e.id === id ? { ...e, liveBot: !e.liveBot } : e)));
  const add = (kind: Kind, value: string, note: string, liveBot: boolean) =>
    update((list) => [
      { id: newId(), kind, value, note: note || undefined, status: "allowed", enabled: true, liveBot, addedBy: "anand@trenchers.ai", addedAt: "just now" },
      ...list,
    ]);

  return (
    <div className="rise space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Platform access</h1>
          <p className="mt-0.5 max-w-xl text-sm text-muted">
            Control who can log into the Trenchers platform. Grant access by email or wallet, and
            approve people who requested it.
          </p>
        </div>
        <button onClick={() => setAdding(true)} className={btn.primary}>
          <Plus className="size-4" /> Add access
        </button>
      </div>

      {/* Env switch */}
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Environment" className="inline-flex rounded-lg border border-border bg-surface p-0.5">
          {ENVS.map((e) => {
            const active = e === env;
            const count = data[e].filter((x) => x.status === "allowed").length;
            return (
              <button
                key={e}
                role="tab"
                aria-selected={active}
                onClick={() => setEnv(e)}
                className={cn(
                  "focus-ring flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium capitalize transition-colors",
                  active ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {e}
                <span className="rounded-full bg-background px-1.5 text-[11px] tabular-nums text-muted-2">{count}</span>
              </button>
            );
          })}
        </div>
        {env === "production" && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
            <AlertTriangle className="size-3.5" /> Live users — changes apply on next sign-in
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat icon={CheckCircle2} label="Allowed" value={allowedAll.length} tone="success" />
        <Stat icon={Clock} label="Pending" value={pending.length} tone="warning" />
        <Stat icon={Zap} label="Live bots" value={liveBots} tone="accent" />
        <Stat icon={Mail} label="Emails" value={emails} tone="muted" />
        <Stat icon={Wallet} label="Wallets" value={wallets} tone="muted" />
      </div>

      {/* Pending requests — actionable, so it leads */}
      {pending.length > 0 && (
        <section className="card overflow-hidden border-warning/25">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <Inbox className="size-4 text-warning" />
            <h2 className="text-sm font-semibold">Access requests</h2>
            <span className="rounded-full bg-warning/12 px-2 py-0.5 text-xs font-medium text-warning">{pending.length}</span>
            <span className="ml-auto hidden text-xs text-muted sm:block">People turned away at login</span>
          </div>
          <ul className="divide-y divide-border">
            {pending.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <IdentityCell entry={e} />
                <span className="hidden items-center gap-1 text-xs text-muted-2 sm:flex">
                  <Clock className="size-3.5" /> {e.requestedAt} · {e.attempts} tries
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => approve(e.id)} className={btn.primary}>
                    <Check className="size-4" /> Approve
                  </button>
                  <button onClick={() => dismiss(e.id)} aria-label={`Dismiss ${e.value}`} className={btn.iconGhost}>
                    <X className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Allowed */}
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-success" />
            <h2 className="text-sm font-semibold">Allowed</h2>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs tabular-nums text-muted">{allowedAll.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-2" />
              <span className="sr-only">Search allowed list</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search…"
                className="focus-ring h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-2 sm:w-48"
              />
            </label>
            <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
              {(["all", "email", "wallet"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "focus-ring min-h-9 rounded-md px-2.5 text-xs font-medium capitalize transition-colors",
                    typeFilter === t ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {allowed.length === 0 ? (
          <EmptyState hasAny={allowedAll.length > 0} onAdd={() => setAdding(true)} env={env} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Identity</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">
                    <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5 text-accent" /> Live bot</span>
                  </th>
                  <th className="px-4 py-2.5 font-medium">Added by</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allowed.map((e) => {
                  const disabled = e.enabled === false;
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0 transition-colors hover:bg-surface-2/40">
                      <td className="px-5 py-3"><IdentityCell entry={e} /></td>
                      <td className="px-4 py-3">
                        {disabled ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted-2/15 px-2 py-0.5 text-xs font-medium text-muted"><span className="size-1.5 rounded-full bg-muted-2" /> Disabled</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success"><span className="size-1.5 rounded-full bg-success" /> Allowed</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!!e.liveBot}
                            onChange={() => toggleLiveBot(e.id)}
                            label={`Live bot access for ${e.value}`}
                          />
                          <span className={cn("text-xs", e.liveBot ? "text-accent" : "text-muted-2")}>
                            {e.liveBot ? "On" : "Off"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {e.addedBy ?? "—"}
                        {e.addedAt && <span className="text-muted-2"> · {e.addedAt}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleEnabled(e.id)} className={btn.textGhost}>
                            {disabled ? <><RotateCcw className="size-3.5" /> Enable</> : <><Ban className="size-3.5" /> Disable</>}
                          </button>
                          <button onClick={() => remove(e)} aria-label={`Remove ${e.value}`} className={btn.iconDanger}>
                            <Trash2 className="size-4" />
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

      <AddModal open={adding} onClose={() => setAdding(false)} env={env} onAdd={add} />
    </div>
  );
}

/* ---- pieces ------------------------------------------------------- */

function IdentityCell({ entry }: { entry: AccessEntry }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
        {entry.kind === "email" ? <Mail className="size-4" /> : <Wallet className="size-4" />}
      </span>
      <div className="min-w-0">
        <div className="truncate font-mono text-xs text-foreground" title={entry.value}>{entry.value}</div>
        {entry.note && <div className="truncate text-[11px] text-muted-2">{entry.note}</div>}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Mail; label: string; value: number; tone: "success" | "warning" | "muted" | "accent" }) {
  const toneCls = { success: "text-success", warning: "text-warning", muted: "text-muted-2", accent: "text-accent" }[tone];
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <Icon className={cn("size-4", toneCls)} />
      </div>
      <div className="mt-1.5 font-mono text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState({ hasAny, onAdd, env }: { hasAny: boolean; onAdd: () => void; env: Env }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted-2">
        <ShieldCheck className="size-5" />
      </span>
      <p className="mt-3 text-sm font-medium">{hasAny ? "No matches" : `Nobody has ${env} access yet`}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        {hasAny ? "Try a different search or filter." : "Add a Google email or a connected wallet to let someone log in."}
      </p>
      {!hasAny && (
        <button onClick={onAdd} className={cn(btn.primary, "mt-4")}><Plus className="size-4" /> Add access</button>
      )}
    </div>
  );
}

function AddModal({ open, onClose, env, onAdd }: { open: boolean; onClose: () => void; env: Env; onAdd: (k: Kind, v: string, n: string, liveBot: boolean) => void }) {
  const [kind, setKind] = useState<Kind>("email");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [liveBot, setLiveBot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (kind === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return setError("Enter a valid email address.");
    if (kind === "wallet" && v.length < 32) return setError("Enter a valid base58 wallet address.");
    onAdd(kind, v, note.trim(), liveBot);
    setValue(""); setNote(""); setLiveBot(false); setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add access" description={`Grant ${env} platform access to a new person.`}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Type</span>
          <div className="inline-flex w-full rounded-lg border border-border bg-surface p-0.5">
            {(["email", "wallet"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setKind(k); setError(null); }}
                aria-pressed={kind === k}
                className={cn(
                  "focus-ring min-h-9 flex-1 rounded-md px-3 text-sm font-medium capitalize transition-colors",
                  kind === k ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="acc-value" className="mb-1.5 block text-xs font-medium text-muted">
            {kind === "email" ? "Google / login email" : "Connected wallet (base58)"}
          </label>
          <input
            id="acc-value"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            type={kind === "email" ? "email" : "text"}
            autoComplete="off"
            placeholder={kind === "email" ? "trader@gmail.com" : "7xKq…9aBc"}
            className="focus-ring h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm placeholder:text-muted-2"
          />
        </div>
        <div>
          <label htmlFor="acc-note" className="mb-1.5 block text-xs font-medium text-muted">Note <span className="font-normal text-muted-2">(optional)</span></label>
          <input
            id="acc-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. KOL, referral, team"
            className="focus-ring h-10 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-2"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent/12 text-accent"><Zap className="size-4" /></span>
            <div>
              <p className="text-sm font-medium">Live bot access</p>
              <p className="text-xs text-muted-2">Allow real-money bot trading</p>
            </div>
          </div>
          <Switch checked={liveBot} onChange={setLiveBot} label="Grant live bot access" />
        </div>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={btn.ghost}>Cancel</button>
          <button type="submit" className={btn.primary}>Grant access</button>
        </div>
      </form>
    </Modal>
  );
}

/* button class presets */
const btn = {
  primary: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-sm font-medium text-white transition-colors hover:bg-accent/90",
  ghost: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2",
  textGhost: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground",
  iconGhost: "focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground",
  iconDanger: "focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-danger/10 hover:text-danger",
};
