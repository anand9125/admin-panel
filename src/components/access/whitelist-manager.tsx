"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, Wallet, Plus, Check, X, Search, Clock, CheckCircle2, Inbox, ShieldCheck, Trash2, Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { addEntry, toggleEntry, deleteEntry, type ActionResult } from "@/app/actions";
import type { Platform } from "@/lib/server/backend";
import type { WhitelistEntry, WhitelistKind } from "@/lib/server/whitelist-api";

export function WhitelistManager({ env, entries }: { env: Platform; entries: WhitelistEntry[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | WhitelistKind>("all");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<ActionResult>, onOk?: () => void) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res?.error) return setError(res.error);
      onOk?.();
      router.refresh();
    });
  };

  const pendingReqs = entries.filter((e) => !e.enabled);
  const allowedAll = entries.filter((e) => e.enabled);
  const emails = entries.filter((e) => e.kind === "email").length;
  const wallets = entries.filter((e) => e.kind === "wallet").length;

  const allowed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allowedAll.filter(
      (e) => (typeFilter === "all" || e.kind === typeFilter) &&
        (!q || e.value.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q)),
    );
  }, [allowedAll, query, typeFilter]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={CheckCircle2} label="Allowed" value={allowedAll.length} tone="success" />
        <Stat icon={Clock} label="Pending" value={pendingReqs.length} tone="warning" />
        <Stat icon={Mail} label="Emails" value={emails} tone="muted" />
        <Stat icon={Wallet} label="Wallets" value={wallets} tone="muted" />
      </div>

      {/* Pending requests */}
      {pendingReqs.length > 0 && (
        <section className="card overflow-hidden border-warning/25">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <Inbox className="size-4 text-warning" />
            <h2 className="text-sm font-semibold">Access requests</h2>
            <span className="rounded-full bg-warning/12 px-2 py-0.5 text-xs font-medium text-warning">{pendingReqs.length}</span>
            <span className="ml-auto hidden text-xs text-muted sm:block">Turned away at login</span>
          </div>
          <ul className="divide-y divide-border">
            {pendingReqs.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Identity entry={e} />
                {(e.requested_at || e.attempts > 0) && (
                  <span className="hidden items-center gap-1 text-xs text-muted-2 sm:flex">
                    <Clock className="size-3.5" /> {e.attempts} {e.attempts === 1 ? "try" : "tries"}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => run(() => toggleEntry(env, e.id, true))} disabled={pending} className={btn.primary}>
                    <Check className="size-4" /> Approve
                  </button>
                  <button onClick={() => run(() => deleteEntry(env, e.id))} disabled={pending} aria-label={`Dismiss ${e.value}`} className={btn.iconGhost}>
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
            <button onClick={() => { setAdding(true); setError(null); }} className={btn.primary}><Plus className="size-4" /> Add</button>
          </div>
        </div>

        {allowed.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted-2"><ShieldCheck className="size-5" /></span>
            <p className="mt-3 text-sm font-medium">{allowedAll.length ? "No matches" : `Nobody has ${env} access yet`}</p>
            <p className="mt-1 max-w-xs text-sm text-muted">{allowedAll.length ? "Try a different search or filter." : "Add a Google email or a connected wallet to let someone log in."}</p>
            {!allowedAll.length && <button onClick={() => setAdding(true)} className={cn(btn.primary, "mt-4")}><Plus className="size-4" /> Add access</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Identity</th>
                  <th className="px-4 py-2.5 font-medium">Note</th>
                  <th className="px-4 py-2.5 font-medium">Added by</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allowed.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 transition-colors hover:bg-surface-2/40">
                    <td className="px-5 py-3"><Identity entry={e} /></td>
                    <td className="px-4 py-3 text-xs text-muted">{e.note ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-2">{e.added_by ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => run(() => toggleEntry(env, e.id, false))} disabled={pending} className={btn.textGhost}>
                          <Ban className="size-3.5" /> Disable
                        </button>
                        <button onClick={() => { if (confirm(`Remove ${e.value} from the ${env} list?`)) run(() => deleteEntry(env, e.id)); }} disabled={pending} aria-label={`Remove ${e.value}`} className={btn.iconDanger}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AddModal open={adding} onClose={() => setAdding(false)} env={env} pending={pending}
        onSubmit={(fd, done) => run(() => addEntry(env, fd), done)} />
    </div>
  );
}

function Identity({ entry }: { entry: WhitelistEntry }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
        {entry.kind === "email" ? <Mail className="size-4" /> : <Wallet className="size-4" />}
      </span>
      <div className="truncate font-mono text-xs text-foreground" title={entry.value}>{entry.value}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Mail; label: string; value: number; tone: "success" | "warning" | "muted" }) {
  const chip = { success: "bg-success/12 text-success", warning: "bg-warning/12 text-warning", muted: "bg-surface-2 text-muted-2" }[tone];
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

function AddModal({ open, onClose, env, pending, onSubmit }: {
  open: boolean; onClose: () => void; env: Platform; pending: boolean;
  onSubmit: (fd: FormData, done: () => void) => void;
}) {
  const [kind, setKind] = useState<WhitelistKind>("email");
  return (
    <Modal open={open} onClose={onClose} title="Add access" description={`Grant ${env} platform access.`}>
      <form action={(fd) => onSubmit(fd, onClose)} className="space-y-4">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Type</span>
          <div className="inline-flex w-full rounded-lg border border-border bg-surface p-0.5">
            {(["email", "wallet"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k}
                className={cn("focus-ring min-h-9 flex-1 rounded-md px-3 text-sm font-medium capitalize transition-colors",
                  kind === k ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>{k}</button>
            ))}
          </div>
          <input type="hidden" name="kind" value={kind} />
        </div>
        <div>
          <label htmlFor="wl-value" className="mb-1.5 block text-xs font-medium text-muted">{kind === "email" ? "Google / login email" : "Connected wallet (base58)"}</label>
          <input id="wl-value" name="value" required type={kind === "email" ? "email" : "text"} autoComplete="off"
            placeholder={kind === "email" ? "trader@gmail.com" : "7xKq…9aBc"}
            className="focus-ring h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm placeholder:text-muted-2" />
        </div>
        <div>
          <label htmlFor="wl-note" className="mb-1.5 block text-xs font-medium text-muted">Note <span className="font-normal text-muted-2">(optional)</span></label>
          <input id="wl-note" name="note" placeholder="e.g. KOL, referral" className="focus-ring h-10 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-2" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={btn.ghost}>Cancel</button>
          <button type="submit" disabled={pending} className={btn.primary}>Grant access</button>
        </div>
      </form>
    </Modal>
  );
}

const btn = {
  primary: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50",
  ghost: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2",
  textGhost: "focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-50",
  iconGhost: "focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-50",
  iconDanger: "focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50",
};
