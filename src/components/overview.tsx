"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Mail,
  Wallet,
  ArrowRight,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PLATFORMS, type Platform } from "@/lib/whitelist-api";
import type { AllEnvs, EnvData } from "@/lib/whitelist-data";

function relTime(iso: string, now: number): string {
  const s = Math.round((now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}

function EnvTabs({ env, setEnv, data }: { env: Platform; setEnv: (p: Platform) => void; data: AllEnvs }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
      {PLATFORMS.map((p) => (
        <button
          key={p}
          onClick={() => setEnv(p)}
          disabled={!data[p].configured}
          aria-pressed={p === env}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
            p === env ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

export function Overview({ data, now }: { data: AllEnvs; now: number }) {
  const firstConfigured = PLATFORMS.find((p) => data[p].configured) ?? "production";
  const [env, setEnv] = useState<Platform>(firstConfigured);
  const current: EnvData = data[env];

  const entries = current.entries;
  const allowed = entries.filter((e) => e.enabled);
  const pending = entries.filter((e) => !e.enabled);
  const emails = entries.filter((e) => e.kind === "email").length;
  const wallets = entries.filter((e) => e.kind === "wallet").length;
  const recent = [...entries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">Who can log into the Trenchers platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <EnvTabs env={env} setEnv={setEnv} data={data} />
          <Link href="/access" className={cn(buttonClass(), "hidden sm:inline-flex")}>
            Manage access
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {current.error ? (
        <Card className="border-destructive/40">
          <CardContent className="flex items-start gap-3 p-5 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Couldn&apos;t load {env}</p>
              <p className="mt-1 text-muted-foreground">{current.error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={CheckCircle2} label="Allowed" value={allowed.length} />
            <StatCard icon={Clock} label="Pending" value={pending.length} />
            <StatCard icon={Mail} label="Emails" value={emails} />
            <StatCard icon={Wallet} label="Wallets" value={wallets} />
          </div>

          {/* Pending callout */}
          {pending.length > 0 && (
            <Link
              href="/access"
              className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/8 px-4 py-3 outline-none transition-colors hover:bg-warning/12 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Clock className="size-4 shrink-0 text-warning" />
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium">
                  {pending.length} {pending.length === 1 ? "person is" : "people are"} waiting for access
                </span>
                <span className="text-muted-foreground"> — review and approve.</span>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          )}

          {/* Recent */}
          <Card>
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="text-sm font-semibold">Recently added</h3>
              <Link
                href="/access"
                className="rounded text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center border-t border-border px-6 py-12 text-center">
                <ShieldEmpty />
                <p className="mt-3 text-sm font-medium">No {env} access yet</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Add a Google email or wallet to let someone log into the platform.
                </p>
                <Link href="/access" className={cn(buttonClass(), "mt-4")}>
                  Add someone
                </Link>
              </div>
            ) : (
              <div className="border-t border-border">
                <Table>
                  <THead>
                    <TR className="hover:bg-transparent">
                      <TH>Identity</TH>
                      <TH className="hidden sm:table-cell">Added by</TH>
                      <TH>Added</TH>
                      <TH className="text-right">Status</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {recent.map((e) => (
                      <TR key={e.id}>
                        <TD>
                          <div className="flex items-center gap-2.5">
                            {e.kind === "email" ? (
                              <Mail className="size-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <Wallet className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate font-mono text-xs" title={e.value}>
                              {e.value}
                            </span>
                          </div>
                        </TD>
                        <TD className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                          {e.added_by ?? "self-requested"}
                        </TD>
                        <TD className="text-xs text-muted-foreground">{relTime(e.created_at, now)}</TD>
                        <TD className="text-right">
                          {e.enabled ? (
                            <Badge variant="success">Allowed</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function ShieldEmpty() {
  return (
    <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <ShieldCheckIcon />
    </span>
  );
}
function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
