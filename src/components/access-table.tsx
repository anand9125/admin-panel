"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Wallet, Plus, Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { addEntry, toggleEntry, deleteEntry, type ActionResult } from "@/app/actions";
import { PLATFORMS, type Platform } from "@/lib/whitelist-api";
import type { AllEnvs } from "@/lib/whitelist-data";

export interface EntryRow {
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

function dt(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function AccessTable({ data }: { data: AllEnvs }) {
  const firstConfigured = PLATFORMS.find((p) => data[p].configured) ?? "production";
  const [env, setEnv] = useState<Platform>(firstConfigured);
  const current = data[env];

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Access list</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Only people on this list can log into the Trenchers platform. Add a Google email or a
          connected wallet; anyone turned away shows up as a request you can approve.
        </p>
      </div>

      {/* Env tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {PLATFORMS.map((p) => {
          const isActive = p === env;
          const d = data[p];
          const count = d.entries.filter((e) => e.enabled).length;
          const pend = d.entries.filter((e) => !e.enabled).length;
          return (
            <button
              key={p}
              onClick={() => setEnv(p)}
              aria-pressed={isActive}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
              {d.configured && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {count}
                  {pend > 0 && <span className="text-warning"> +{pend}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {current.error ? (
        <Card className="border-destructive/40">
          <div className="flex items-start gap-3 p-5 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Couldn&apos;t load {env}</p>
              <p className="mt-1 text-muted-foreground">{current.error}</p>
            </div>
          </div>
        </Card>
      ) : (
        <EnvPanel env={env} entries={current.entries} />
      )}
    </div>
  );
}

function EnvPanel({ env, entries }: { env: Platform; entries: EntryRow[] }) {
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
    <div className="space-y-5">
      {env === "production" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />
          Editing the <strong>production</strong> access list — changes affect real users on next sign-in.
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{allowed.length}</span> allowed
          {requests.length > 0 && (
            <>
              {" · "}
              <span className="font-medium text-warning tabular-nums">{requests.length}</span> pending
            </>
          )}
        </p>
        <Button size="sm" onClick={() => { setAdding((v) => !v); setError(null); }}>
          <Plus className="size-4" />
          Add to {env}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {adding && (
        <Card className="p-4">
          <form
            action={(fd) => run(() => addEntry(env, fd), () => setAdding(false))}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="sm:w-40">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
              <div className="inline-flex w-full rounded-md border border-border bg-muted/50 p-0.5">
                {(["email", "wallet"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={cn(
                      "flex-1 rounded px-2 py-1 text-xs font-medium capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      kind === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <input type="hidden" name="kind" value={kind} />
            </div>
            <div className="flex-1">
              <label htmlFor="value" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {kind === "email" ? "Google / login email" : "Connected wallet (base58)"}
              </label>
              <Input
                id="value"
                name="value"
                required
                type={kind === "email" ? "email" : "text"}
                autoComplete="off"
                placeholder={kind === "email" ? "trader@gmail.com" : "7xKq…9aBc"}
                className="font-mono"
              />
            </div>
            <div className="sm:w-44">
              <label htmlFor="note" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Note <span className="font-normal">(optional)</span>
              </label>
              <Input id="note" name="note" placeholder="e.g. KOL" />
            </div>
            <Button type="submit" disabled={pending}>Add</Button>
          </form>
        </Card>
      )}

      {/* Requests */}
      {requests.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-warning">
            Access requests <span className="font-normal text-muted-foreground">· {requests.length}</span>
          </h3>
          <Card className="overflow-hidden">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Identity</TH>
                  <TH className="hidden sm:table-cell">Last tried</TH>
                  <TH className="hidden sm:table-cell">Tries</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {requests.map((e) => (
                  <TR key={e.id}>
                    <TD><Identity e={e} /></TD>
                    <TD className="hidden text-xs text-muted-foreground sm:table-cell">
                      {dt(e.requested_at ?? e.created_at)}
                    </TD>
                    <TD className="hidden text-xs text-muted-foreground sm:table-cell tabular-nums">
                      {e.attempts || "—"}
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={pending}
                          onClick={() => run(() => toggleEntry(env, e.id, true, e.value))}
                        >
                          <Check className="size-3.5" />
                          Allow
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Dismiss ${e.value}`}
                          className="size-8 text-muted-foreground hover:text-destructive"
                          disabled={pending}
                          onClick={() => {
                            if (confirm(`Dismiss the request from ${e.value}?`))
                              run(() => deleteEntry(env, e.id, e.value));
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </section>
      )}

      {/* Allowed */}
      <section>
        <h3 className="mb-2 text-sm font-semibold">
          Allowed <span className="font-normal text-muted-foreground">· {allowed.length}</span>
        </h3>
        <Card className="overflow-hidden">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Identity</TH>
                <TH className="hidden md:table-cell">Note</TH>
                <TH className="hidden sm:table-cell">Added by</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {allowed.length === 0 ? (
                <TR className="hover:bg-transparent">
                  <TD colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Nobody is allowed on {env} yet. Add someone above, or approve a request.
                  </TD>
                </TR>
              ) : (
                allowed.map((e) => (
                  <TR key={e.id}>
                    <TD><Identity e={e} withDate /></TD>
                    <TD className="hidden text-xs text-muted-foreground md:table-cell">{e.note ?? "—"}</TD>
                    <TD className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                      {e.added_by ?? "—"}
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          disabled={pending}
                          onClick={() => run(() => toggleEntry(env, e.id, false, e.value))}
                        >
                          Disable
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={pending}
                          onClick={() => {
                            if (confirm(`Remove ${e.value} from the ${env} list? They'll be locked out on next login.`))
                              run(() => deleteEntry(env, e.id, e.value));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}

function Identity({ e, withDate }: { e: EntryRow; withDate?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {e.kind === "email" ? <Mail className="size-3.5" /> : <Wallet className="size-3.5" />}
      </span>
      <div className="min-w-0">
        <div className="truncate font-mono text-xs text-foreground" title={e.value}>{e.value}</div>
        {withDate && <div className="text-[10px] text-muted-foreground">added {dt(e.created_at)}</div>}
      </div>
    </div>
  );
}
