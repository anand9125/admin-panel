"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/brand";
import { PLATFORMS, type Platform } from "@/lib/whitelist-api";
import type { AllEnvs, EnvData } from "@/lib/whitelist-data";

/* ---- helpers ------------------------------------------------------ */

function relTime(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}

/* ---- env toggle --------------------------------------------------- */

function EnvToggle({
  env,
  setEnv,
  data,
}: {
  env: Platform;
  setEnv: (p: Platform) => void;
  data: AllEnvs;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-surface p-1">
      {PLATFORMS.map((p) => {
        const active = p === env;
        const isProd = p === "production";
        return (
          <button
            key={p}
            onClick={() => setEnv(p)}
            aria-pressed={active}
            disabled={!data[p].configured}
            className={[
              "relative rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
              active
                ? isProd
                  ? "bg-accent/15 text-accent"
                  : "bg-accent-blue/15 text-accent-blue"
                : "text-muted hover:text-foreground",
            ].join(" ")}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}

/* ---- stat tile ---------------------------------------------------- */

function StatTile({
  icon: TileIcon,
  label,
  value,
  accent,
}: {
  icon: (p: { className?: string }) => React.ReactElement;
  label: string;
  value: number;
  accent: "brand" | "green" | "amber" | "blue";
}) {
  const tone = {
    brand: "text-accent bg-accent/10",
    green: "text-accent-green bg-accent-green/10",
    amber: "text-accent-amber bg-accent-amber/10",
    blue: "text-accent-blue bg-accent-blue/10",
  }[accent];
  return (
    <div className="card-interactive panel rounded-2xl border border-border p-4">
      <div className={`inline-flex size-9 items-center justify-center rounded-lg ${tone}`}>
        <TileIcon className="size-[18px]" />
      </div>
      <div className="mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  );
}

/* ---- main --------------------------------------------------------- */

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
              <span className="pulse-dot size-1.5 rounded-full bg-accent-green" />
              live
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Who can log into the Trenchers platform, at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EnvToggle env={env} setEnv={setEnv} data={data} />
          <Link
            href="/access"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Manage
            <Icon.arrow className="size-4" />
          </Link>
        </div>
      </div>

      {current.error ? (
        <div className="panel rounded-2xl border border-accent-red/30 bg-accent-red/5 p-6 text-sm text-accent-red">
          {current.error}
          <p className="mt-2 text-xs text-muted">
            Check the {env} backend URL + service token, and that the platform API is reachable.
          </p>
        </div>
      ) : (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Icon.check} label="Allowed" value={allowed.length} accent="green" />
            <StatTile icon={Icon.clock} label="Pending requests" value={pending.length} accent="amber" />
            <StatTile icon={Icon.mail} label="Emails" value={emails} accent="blue" />
            <StatTile icon={Icon.wallet} label="Wallets" value={wallets} accent="brand" />
          </div>

          {/* Pending callout */}
          {pending.length > 0 && (
            <Link
              href="/access"
              className="card-interactive flex items-center gap-4 rounded-2xl border border-accent-amber/30 bg-accent-amber/5 p-4"
            >
              <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-amber/15 text-accent-amber">
                <Icon.clock className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">
                  {pending.length} {pending.length === 1 ? "person is" : "people are"} waiting for access
                </div>
                <div className="text-xs text-muted">Review and approve them on the access list.</div>
              </div>
              <Icon.arrow className="size-4 shrink-0 text-accent-amber" />
            </Link>
          )}

          {/* Recent activity */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Recently added
              </h2>
              <Link href="/access" className="text-xs text-muted transition-colors hover:text-foreground">
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="panel flex flex-col items-center rounded-2xl border border-border px-6 py-12 text-center">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-background-elevated text-muted-faint">
                  <Icon.access className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Nobody has {env} access yet
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted">
                  Add a Google email or wallet to let someone log into the Trenchers platform.
                </p>
                <Link
                  href="/access"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon.plus className="size-4" />
                  Add someone
                </Link>
              </div>
            ) : (
              <div className="panel divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {recent.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className={[
                        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
                        e.kind === "email" ? "bg-accent-blue/10 text-accent-blue" : "bg-accent/10 text-accent",
                      ].join(" ")}
                    >
                      {e.kind === "email" ? <Icon.mail className="size-4" /> : <Icon.wallet className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-xs text-foreground" title={e.value}>
                        {e.value}
                      </div>
                      <div className="text-[11px] text-muted-faint">
                        {e.added_by ? `by ${e.added_by}` : "self-requested"} · {relTime(e.created_at, now)}
                      </div>
                    </div>
                    {e.enabled ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-green/10 px-2 py-0.5 text-[11px] font-medium text-accent-green">
                        <span className="size-1.5 rounded-full bg-accent-green" />
                        allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-amber/10 px-2 py-0.5 text-[11px] font-medium text-accent-amber">
                        <span className="size-1.5 rounded-full bg-accent-amber" />
                        pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
