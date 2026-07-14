"use client";

import { useMemo, useState } from "react";
import {
  Mail, Wallet, Plus, Check, X, Search, Clock,
  ShieldCheck, Trash2, CheckCircle2, Inbox, ChevronRight, Ban, Info, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { INITIAL_ACCESS, type Env, type Kind, type AccessEntry } from "@/lib/access-data";
import {
  FEATURE_FLAGS, FLAG_GROUPS, enabledFlags, flagCount,
  defaultFlagConfig, effectiveFlag, type FlagMode, type FlagConfig,
} from "@/lib/flags";

const ENVS: Env[] = ["staging", "production"];
type View = "users" | "flags";
let idc = 1000;
const newId = () => `n${++idc}`;

export function AccessManager() {
  const [env, setEnv] = useState<Env>("production");
  const [view, setView] = useState<View>("users");
  const [data, setData] = useState(INITIAL_ACCESS);
  const [flagConfig, setFlagConfig] = useState<Record<Env, FlagConfig>>({
    staging: defaultFlagConfig(),
    production: defaultFlagConfig(),
  });
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Kind>("all");
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const entries = data[env];
  const cfg = flagConfig[env];
  const setFlagMode = (flagId: string, mode: FlagMode) =>
    setFlagConfig((c) => ({ ...c, [env]: { ...c[env], [flagId]: mode } }));
  const update = (fn: (list: AccessEntry[]) => AccessEntry[]) => setData((d) => ({ ...d, [env]: fn(d[env]) }));

  const pending = entries.filter((e) => e.status === "pending");
  const allowedAll = entries.filter((e) => e.status === "allowed");
  const emails = entries.filter((e) => e.kind === "email").length;
  const wallets = entries.filter((e) => e.kind === "wallet").length;

  const allowed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allowedAll.filter(
      (e) => (typeFilter === "all" || e.kind === typeFilter) &&
        (!q || e.value.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q)),
    );
  }, [allowedAll, query, typeFilter]);

  const selected = selectedId ? entries.find((e) => e.id === selectedId) ?? null : null;

  /* actions */
  const approve = (id: string) => update((l) => l.map((e) => (e.id === id ? { ...e, status: "allowed", enabled: true, flags: {} } : e)));
  const dismiss = (id: string) => update((l) => l.filter((e) => e.id !== id));
  const removeEntry = (e: AccessEntry) => {
    if (confirm(`Remove ${e.value} from the ${env} list? They'll lose access on next login.`)) {
      update((l) => l.filter((x) => x.id !== e.id));
      setSelectedId(null);
    }
  };
  const toggleEnabled = (id: string) => update((l) => l.map((e) => (e.id === id ? { ...e, enabled: e.enabled === false } : e)));
  const setFlag = (id: string, flagId: string, val: boolean) =>
    update((l) => l.map((e) => (e.id === id ? { ...e, flags: { ...e.flags, [flagId]: val } } : e)));
  const add = (kind: Kind, value: string, note: string) => {
    const id = newId();
    update((l) => [{ id, kind, value, note: note || undefined, status: "allowed", enabled: true, flags: {}, addedAt: "just now" }, ...l]);
    setSelectedId(id); // open drawer to configure flags right away
  };

  return (
    <div className="rise space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Platform access</h1>
          <p className="mt-0.5 max-w-xl text-sm text-muted">
            Control who can log into Trenchers and which features they can use — per user, or
            rolled out to everyone.
          </p>
        </div>
        {view === "users" && (
          <button onClick={() => setAdding(true)} className={btn.primary}><Plus className="size-4" /> Add access</button>
        )}
      </div>

      {/* View tabs + env switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="View" className="inline-flex rounded-lg border border-border bg-surface p-0.5">
          {([["users", "Users"], ["flags", "Feature flags"]] as const).map(([v, label]) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
              className={cn("focus-ring min-h-9 rounded-md px-3 text-sm font-medium transition-colors",
                view === v ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>{label}</button>
          ))}
        </div>
        <div role="tablist" aria-label="Environment" className="inline-flex rounded-lg border border-border bg-surface p-0.5">
          {ENVS.map((e) => {
            const active = e === env;
            const count = data[e].filter((x) => x.status === "allowed").length;
            return (
              <button key={e} role="tab" aria-selected={active} onClick={() => { setEnv(e); setSelectedId(null); }}
                title={e === "production" ? "Production — live users, changes apply on next sign-in" : undefined}
                className={cn("focus-ring flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium capitalize transition-colors",
                  active ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>
                {e === "production" && <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />}
                {e}
                <span className="rounded-full bg-background px-1.5 text-[11px] tabular-nums text-muted-2">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {view === "flags" ? (
        <FlagsPanel cfg={cfg} allowedCount={allowedAll.length} entries={allowedAll} onSetMode={setFlagMode} env={env} />
      ) : (
      <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={CheckCircle2} label="Allowed" value={allowedAll.length} tone="success" />
        <Stat icon={Clock} label="Pending" value={pending.length} tone="warning" />
        <Stat icon={Mail} label="Emails" value={emails} tone="muted" />
        <Stat icon={Wallet} label="Wallets" value={wallets} tone="muted" />
      </div>

      {/* Pending */}
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
                <span className="hidden items-center gap-1 text-xs text-muted-2 sm:flex"><Clock className="size-3.5" /> {e.requestedAt} · {e.attempts} tries</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => approve(e.id)} className={btn.primary}><Check className="size-4" /> Approve</button>
                  <button onClick={() => dismiss(e.id)} aria-label={`Dismiss ${e.value}`} className={btn.iconGhost}><X className="size-4" /></button>
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
              <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search…"
                className="focus-ring h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-2 sm:w-48" />
            </label>
            <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
              {(["all", "email", "wallet"] as const).map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={cn("focus-ring min-h-9 rounded-md px-2.5 text-xs font-medium capitalize transition-colors",
                    typeFilter === t ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {allowed.length === 0 ? (
          <EmptyState hasAny={allowedAll.length > 0} onAdd={() => setAdding(true)} env={env} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Identity</th>
                  <th className="px-4 py-2.5 font-medium">Features</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Manage</th>
                </tr>
              </thead>
              <tbody>
                {allowed.map((e) => {
                  const disabled = e.enabled === false;
                  return (
                    <tr key={e.id} onClick={() => setSelectedId(e.id)}
                      className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-surface-2/50">
                      <td className="px-5 py-3"><IdentityCell entry={e} /></td>
                      <td className="px-4 py-3"><FlagSummary entry={e} cfg={cfg} /></td>
                      <td className="px-4 py-3">
                        {disabled
                          ? <span className="inline-flex items-center gap-1.5 rounded-full bg-muted-2/15 px-2 py-0.5 text-xs font-medium text-muted"><span className="size-1.5 rounded-full bg-muted-2" /> Disabled</span>
                          : <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success"><span className="size-1.5 rounded-full bg-success" /> Allowed</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button onClick={(ev) => { ev.stopPropagation(); setSelectedId(e.id); }} aria-label={`Manage ${e.value}`} className={btn.iconGhost}>
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
      </>
      )}

      {/* Drawer: per-user feature flags */}
      <UserDrawer
        entry={selected}
        env={env}
        cfg={cfg}
        onClose={() => setSelectedId(null)}
        onToggleEnabled={toggleEnabled}
        onSetFlag={setFlag}
        onRemove={removeEntry}
      />

      <AddModal open={adding} onClose={() => setAdding(false)} env={env} onAdd={add} />
    </div>
  );
}

/* ---- table pieces ------------------------------------------------- */

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

function FlagSummary({ entry, cfg }: { entry: AccessEntry; cfg: FlagConfig }) {
  const on = enabledFlags(entry.flags, cfg);
  if (on.length === 0) return <span className="text-xs text-muted-2">No features</span>;
  const shown = on.slice(0, 4);
  return (
    <div className="flex items-center gap-1.5">
      {shown.map((f) => {
        const Icon = f.icon;
        return (
          <span key={f.id} title={f.label} className="flex size-6 items-center justify-center rounded-md bg-accent/12 text-accent">
            <Icon className="size-3.5" />
          </span>
        );
      })}
      {on.length > shown.length && <span className="text-xs text-muted-2">+{on.length - shown.length}</span>}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Mail; label: string; value: number; tone: "success" | "warning" | "muted" }) {
  const chip = {
    success: "bg-success/12 text-success",
    warning: "bg-warning/12 text-warning",
    muted: "bg-surface-2 text-muted-2",
  }[tone];
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", chip)}>
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[26px] font-semibold leading-none tabular-nums">{value}</div>
        <div className="mt-1.5 text-xs text-muted">{label}</div>
      </div>
    </div>
  );
}

function EmptyState({ hasAny, onAdd, env }: { hasAny: boolean; onAdd: () => void; env: Env }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted-2"><ShieldCheck className="size-5" /></span>
      <p className="mt-3 text-sm font-medium">{hasAny ? "No matches" : `Nobody has ${env} access yet`}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{hasAny ? "Try a different search or filter." : "Add a Google email or a connected wallet to let someone log in."}</p>
      {!hasAny && <button onClick={onAdd} className={cn(btn.primary, "mt-4")}><Plus className="size-4" /> Add access</button>}
    </div>
  );
}

/* ---- feature flags view (global rollout) -------------------------- */

const MODES: { v: FlagMode; label: string }[] = [
  { v: "off", label: "No one" },
  { v: "custom", label: "Custom" },
  { v: "everyone", label: "Everyone" },
];

function FlagsPanel({
  cfg, allowedCount, entries, onSetMode, env,
}: {
  cfg: FlagConfig;
  allowedCount: number;
  entries: AccessEntry[];
  onSetMode: (flagId: string, mode: FlagMode) => void;
  env: Env;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" />
        <p>
          Set a flag to <span className="font-medium text-foreground">Everyone</span> to turn it on for
          all {allowedCount} allowed {env} users at once, <span className="font-medium text-foreground">No one</span> to
          disable it globally, or <span className="font-medium text-foreground">Custom</span> to decide per user.
        </p>
      </div>

      {FLAG_GROUPS.map((group) => {
        const items = FEATURE_FLAGS.filter((f) => f.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group}>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-2">{group}</p>
            <div className="card divide-y divide-border overflow-hidden">
              {items.map((f) => {
                const Icon = f.icon;
                const mode = cfg[f.id] ?? "custom";
                const count = mode === "everyone" ? allowedCount : mode === "off" ? 0 : entries.filter((e) => e.flags?.[f.id]).length;
                const summary =
                  mode === "everyone" ? `On for all ${allowedCount} users`
                    : mode === "off" ? "Off for all users"
                      : `${count} of ${allowedCount} users`;
                return (
                  <div key={f.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", mode === "everyone" ? "bg-accent/12 text-accent" : "bg-surface-2 text-muted-2")}>
                      <Icon className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-2">{f.description}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-muted sm:mr-1 sm:w-36 sm:justify-end">
                      <Users className="size-3.5 text-muted-2" /> {summary}
                    </span>
                    <div role="radiogroup" aria-label={`${f.label} rollout`} className="inline-flex rounded-lg border border-border bg-background p-0.5">
                      {MODES.map((m) => {
                        const on = mode === m.v;
                        const activeCls = m.v === "everyone" ? "bg-accent/15 text-accent" : m.v === "off" ? "bg-muted-2/15 text-foreground" : "bg-surface-2 text-foreground";
                        return (
                          <button key={m.v} role="radio" aria-checked={on} onClick={() => onSetMode(f.id, m.v)}
                            className={cn("focus-ring min-h-8 rounded-md px-2.5 text-xs font-medium transition-colors", on ? activeCls : "text-muted hover:text-foreground")}>
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ---- user drawer (feature flags) ---------------------------------- */

function UserDrawer({
  entry, env, cfg, onClose, onToggleEnabled, onSetFlag, onRemove,
}: {
  entry: AccessEntry | null;
  env: Env;
  cfg: FlagConfig;
  onClose: () => void;
  onToggleEnabled: (id: string) => void;
  onSetFlag: (id: string, flagId: string, val: boolean) => void;
  onRemove: (e: AccessEntry) => void;
}) {
  const e = entry;
  const disabled = e?.enabled === false;
  return (
    <Drawer
      open={!!e}
      onClose={onClose}
      title={e && (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-muted">
            {e.kind === "email" ? <Mail className="size-4" /> : <Wallet className="size-4" />}
          </span>
          <div className="min-w-0">
            <div className="truncate font-mono text-sm" title={e.value}>{e.value}</div>
            <div className="text-xs capitalize text-muted-2">{e.kind} · {env}{e.note ? ` · ${e.note}` : ""}</div>
          </div>
        </div>
      )}
      footer={e && (
        <button onClick={() => onRemove(e)} className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-danger/30 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
          <Trash2 className="size-4" /> Remove access
        </button>
      )}
    >
      {e && (
        <div className="space-y-6">
          {/* account access toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className={cn("flex size-8 items-center justify-center rounded-lg", disabled ? "bg-muted-2/15 text-muted-2" : "bg-success/12 text-success")}>
                {disabled ? <Ban className="size-4" /> : <ShieldCheck className="size-4" />}
              </span>
              <div>
                <p className="text-sm font-medium">Account access</p>
                <p className="text-xs text-muted-2">{disabled ? "Blocked from logging in" : "Can log into the platform"}</p>
              </div>
            </div>
            <Switch checked={!disabled} onChange={() => onToggleEnabled(e.id)} label="Toggle account access" />
          </div>

          {/* feature flags, grouped */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-2">Feature flags</h3>
              <span className="text-xs text-muted-2">{flagCount(e.flags, cfg)} / {FEATURE_FLAGS.length} on</span>
            </div>
            <div className="space-y-5">
              {FLAG_GROUPS.map((group) => {
                const items = FEATURE_FLAGS.filter((f) => f.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-2">{group}</p>
                    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                      {items.map((f) => {
                        const Icon = f.icon;
                        const mode = cfg[f.id];
                        const global = mode === "everyone" || mode === "off";
                        const on = effectiveFlag(mode, e.flags?.[f.id]);
                        return (
                          <div key={f.id} className="flex items-center gap-3 bg-surface px-3.5 py-3">
                            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", on ? "bg-accent/12 text-accent" : "bg-surface-2 text-muted-2")}>
                              <Icon className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{f.label}</p>
                              <p className="text-xs text-muted-2">
                                {global
                                  ? mode === "everyone" ? "On for everyone (global)" : "Off for everyone (global)"
                                  : f.description}
                              </p>
                            </div>
                            <Switch checked={on} onChange={(v) => onSetFlag(e.id, f.id, v)} label={`${f.label} for ${e.value}`} disabled={disabled || global} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ---- add modal ---------------------------------------------------- */

function AddModal({ open, onClose, env, onAdd }: { open: boolean; onClose: () => void; env: Env; onAdd: (k: Kind, v: string, n: string) => void }) {
  const [kind, setKind] = useState<Kind>("email");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const v = value.trim();
    if (kind === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return setError("Enter a valid email address.");
    if (kind === "wallet" && v.length < 32) return setError("Enter a valid base58 wallet address.");
    onAdd(kind, v, note.trim());
    setValue(""); setNote(""); setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add access" description={`Grant ${env} access, then set their feature flags.`}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Type</span>
          <div className="inline-flex w-full rounded-lg border border-border bg-surface p-0.5">
            {(["email", "wallet"] as const).map((k) => (
              <button key={k} type="button" onClick={() => { setKind(k); setError(null); }} aria-pressed={kind === k}
                className={cn("focus-ring min-h-9 flex-1 rounded-md px-3 text-sm font-medium capitalize transition-colors",
                  kind === k ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>{k}</button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="acc-value" className="mb-1.5 block text-xs font-medium text-muted">{kind === "email" ? "Google / login email" : "Connected wallet (base58)"}</label>
          <input id="acc-value" value={value} onChange={(e) => { setValue(e.target.value); setError(null); }} type={kind === "email" ? "email" : "text"} autoComplete="off"
            placeholder={kind === "email" ? "trader@gmail.com" : "7xKq…9aBc"}
            className="focus-ring h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm placeholder:text-muted-2" />
        </div>
        <div>
          <label htmlFor="acc-note" className="mb-1.5 block text-xs font-medium text-muted">Note <span className="font-normal text-muted-2">(optional)</span></label>
          <input id="acc-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. KOL, referral, team"
            className="focus-ring h-10 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-2" />
        </div>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={btn.ghost}>Cancel</button>
          <button type="submit" className={btn.primary}>Add & configure</button>
        </div>
      </form>
    </Modal>
  );
}

const btn = {
  primary: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-sm font-medium text-white transition-colors hover:bg-accent/90",
  ghost: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2",
  iconGhost: "focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground",
};
