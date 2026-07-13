import {
  ArrowUpRight, ArrowDownRight, Bot, UserPlus, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard-shell";
import { Sparkline, AreaChart } from "@/components/dashboard/charts";
import { KPIS, VOLUME_SERIES, LAUNCHPADS, ACTIVITY, type Kpi, type Activity } from "@/lib/dashboard-data";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="rise space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
            <p className="mt-0.5 text-sm text-muted">Platform activity across the last 14 days.</p>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-sm">
            {["24h", "7d", "14d"].map((t, i) => (
              <button
                key={t}
                className={cn(
                  "focus-ring min-h-9 rounded-md px-3 font-medium transition-colors",
                  i === 2 ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((k) => <KpiCard key={k.label} kpi={k} />)}
        </div>

        {/* Chart + launchpads */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Trading volume</h2>
                <p className="text-xs text-muted">Daily total, USD</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success">
                <ArrowUpRight className="size-3.5" /> 18.2%
              </span>
            </div>
            <div className="h-56">
              <AreaChart data={VOLUME_SERIES} label="Daily trading volume over the last 14 days" />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Volume by launchpad</h2>
            <p className="text-xs text-muted">Last 24 hours</p>
            <ul className="mt-4 space-y-4">
              {LAUNCHPADS.map((lp) => (
                <li key={lp.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{lp.name}</span>
                    <span className="font-mono text-xs text-muted">{lp.volume}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                      style={{ width: `${Math.round(lp.share * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Recent activity */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <a href="#" className="focus-ring inline-flex items-center gap-1 rounded text-xs text-muted transition-colors hover:text-foreground">
              View all <ArrowRight className="size-3.5" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-border text-left text-[11px] uppercase tracking-wider text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Event</th>
                  <th className="px-4 py-2.5 font-medium">Actor</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-4 py-2.5 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY.map((a) => <ActivityRow key={a.id} a={a} />)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.deltaPct >= 0;
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{kpi.label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">{kpi.value}</span>
        <span className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
          up ? "bg-success/12 text-success" : "bg-danger/12 text-danger",
        )}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(kpi.deltaPct)}%
        </span>
      </div>
      <div className="mt-3">
        <Sparkline data={kpi.spark} up={up} />
      </div>
    </div>
  );
}

const KIND_META: Record<Activity["kind"], { icon: typeof Bot; cls: string }> = {
  buy: { icon: ArrowUpRight, cls: "text-success bg-success/12" },
  sell: { icon: ArrowDownRight, cls: "text-danger bg-danger/12" },
  bot: { icon: Bot, cls: "text-accent bg-accent/12" },
  signup: { icon: UserPlus, cls: "text-accent-2 bg-accent-2/12" },
};

function ActivityRow({ a }: { a: Activity }) {
  const meta = KIND_META[a.kind];
  const Icon = meta.icon;
  const amountCls = a.amount.startsWith("+") ? "text-success" : a.amount.startsWith("-") ? "text-danger" : "text-muted-2";
  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-surface-2/50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", meta.cls)}>
            <Icon className="size-4" />
          </span>
          <span className="font-medium">{a.detail}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted">{a.actor}</td>
      <td className={cn("px-4 py-3 text-right font-mono text-xs tabular-nums", amountCls)}>{a.amount}</td>
      <td className="px-4 py-3 text-right text-xs text-muted-2">{a.time}</td>
    </tr>
  );
}
