import Image from "next/image";
import {
  Radar,
  Bot,
  Zap,
  Crosshair,
  LineChart,
  Coins,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";

const APP_URL = "https://trenchers.ai";

export default function Landing() {
  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden">
      <SiteNav />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Faq />
      <CtaBand />
      <Footer />
    </div>
  );
}

/* ---- Hero --------------------------------------------------------- */

function Hero() {
  return (
    <section className="bg-hero relative">
      <div className="bg-grid absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-36 sm:px-6 sm:pt-40 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rise inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-muted backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            Now in beta on Solana
          </div>

          <h1 className="rise mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl" style={{ animationDelay: "60ms" }}>
            Trade the trenches,
            <br />
            <span className="text-gradient">faster than everyone.</span>
          </h1>

          <p className="rise mx-auto mt-6 max-w-xl text-pretty text-lg text-muted" style={{ animationDelay: "120ms" }}>
            The all-in-one Solana terminal: a real-time feed of every new token, AI agents that trade
            your strategy 24/7, and one-click execution built for speed.
          </p>

          <div className="rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
            <a href={APP_URL} className="btn btn-primary w-full px-5 py-3 text-sm sm:w-auto">
              Launch app
              <ArrowUpRight className="size-4" />
            </a>
            <a href="#features" className="btn btn-ghost w-full px-5 py-3 text-sm sm:w-auto">
              Explore features
              <ArrowRight className="size-4" />
            </a>
          </div>
          <p className="rise mt-4 text-xs text-muted-2" style={{ animationDelay: "220ms" }}>
            Non-custodial · Your keys, your coins
          </p>
        </div>

        {/* Product mock */}
        <div className="rise mt-16" style={{ animationDelay: "280ms" }}>
          <TerminalMock />
        </div>
      </div>
    </section>
  );
}

function TerminalMock() {
  const rows = [
    { sym: "$WIF", name: "dogwifhat", mc: "$412M", chg: 24.6, up: true },
    { sym: "$POPCAT", name: "Popcat", mc: "$98M", chg: 12.1, up: true },
    { sym: "$MOON", name: "moonrunner", mc: "$1.2M", chg: -8.4, up: false },
    { sym: "$GIGA", name: "Gigachad", mc: "$56M", chg: 5.9, up: true },
    { sym: "$TRENCH", name: "trench pass", mc: "$740K", chg: 61.3, up: true },
  ];
  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-border-strong bg-surface/80 shadow-[0_40px_120px_-40px_rgba(255,7,81,0.35)] backdrop-blur">
        {/* window bar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <div className="ml-3 flex items-center gap-2 text-xs text-muted-2">
            <Radar className="size-3.5 text-accent" />
            <span className="font-mono">trenches · live feed</span>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" /> streaming
          </span>
        </div>
        {/* rows */}
        <div className="divide-y divide-border">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-2 sm:px-6">
            <span>Token</span>
            <span className="text-right">Market cap</span>
            <span className="w-20 text-right">24h</span>
          </div>
          {rows.map((r) => (
            <div key={r.sym} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.02] sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent/25 to-accent-2/20 font-mono text-[11px] font-semibold text-foreground">
                  {r.sym.replace("$", "").slice(0, 2)}
                </span>
                <div className="leading-tight">
                  <div className="font-mono text-sm text-foreground">{r.sym}</div>
                  <div className="text-xs text-muted-2">{r.name}</div>
                </div>
              </div>
              <div className="text-right font-mono text-sm tabular-nums text-muted">{r.mc}</div>
              <div className={`w-20 text-right font-mono text-sm tabular-nums ${r.up ? "text-emerald-400" : "text-rose-400"}`}>
                {r.up ? "+" : ""}{r.chg}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Stats -------------------------------------------------------- */

function Stats() {
  const items = [
    { k: "Sub-second", v: "execution & fills" },
    { k: "Multi-launchpad", v: "token coverage" },
    { k: "24/7", v: "AI trading agents" },
    { k: "Non-custodial", v: "you hold the keys" },
  ];
  return (
    <section className="border-y border-border bg-surface/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.k} className="px-6 py-8 text-center">
            <div className="text-2xl font-semibold tracking-tight text-gradient-accent">{it.k}</div>
            <div className="mt-1 text-sm text-muted">{it.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Features ----------------------------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-border bg-white/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent-soft">
      {children}
    </span>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <span className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-accent/20 to-accent-2/10 text-accent-soft">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

function Features() {
  const feats: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: Radar, title: "Live trenches feed", desc: "Every new token the moment it mints — across pump.fun and the major Solana launchpads, in real time." },
    { icon: Bot, title: "AI trading agents", desc: "Deploy bots that snipe, scale in, and take profit on your rules — running around the clock without you." },
    { icon: Zap, title: "One-click execution", desc: "Pro-grade routing with buy and sell presets. Get in and out in a single tap, no fumbling." },
    { icon: Crosshair, title: "Wallet & alpha tracking", desc: "Follow smart-money wallets and mirror their moves the instant they trade." },
    { icon: LineChart, title: "Portfolio & PnL", desc: "Live positions with realized and unrealized PnL, holdings, and history — all in one view." },
    { icon: Coins, title: "Yield & rewards", desc: "Put idle SOL to work and earn rewards as you trade, straight from the terminal." },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="max-w-2xl">
        <Eyebrow>Everything in one terminal</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for how you actually trade
        </h2>
        <p className="mt-3 text-muted">
          Discovery, automation, and execution in a single, fast interface — no more juggling ten tabs.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feats.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}

/* ---- How it works ------------------------------------------------- */

function HowItWorks() {
  const steps = [
    { n: "01", icon: Wallet, title: "Connect your wallet", desc: "Link a Solana wallet in seconds. Non-custodial — Trenchers never holds your funds." },
    { n: "02", icon: Radar, title: "Find the play", desc: "Scan the live feed, track smart-money wallets, and spot momentum before the crowd." },
    { n: "03", icon: Bot, title: "Trade or automate", desc: "Execute in one click, or hand it to an AI agent that trades your strategy 24/7." },
  ];
  return (
    <section id="how" className="border-t border-border bg-surface/20 scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">From zero to trading in minutes</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="card p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-white/[0.03] text-accent-soft">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-sm text-muted-2">{s.n}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---- FAQ ---------------------------------------------------------- */

function Faq() {
  const qa = [
    { q: "What is Trenchers?", a: "A fast, all-in-one trading terminal for Solana — a live token feed, wallet trackers, portfolio and PnL, plus AI agents that automate your strategy." },
    { q: "Is it custodial?", a: "No. Trenchers is non-custodial — you connect your own wallet and keep full control of your keys and funds at all times." },
    { q: "Which launchpads are covered?", a: "The feed streams new tokens across pump.fun and the major Solana launchpads, updated in real time as they mint." },
    { q: "Do I need to code to run a bot?", a: "No. AI agents are configured from simple presets and rules — set your entries, sizing, and take-profit, and let them run." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="text-center">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Questions, answered</h2>
      </div>
      <div className="mt-10 space-y-3">
        {qa.map((item) => (
          <details key={item.q} className="card group p-5 [&_summary]:cursor-pointer">
            <summary className="flex list-none items-center justify-between gap-4 text-sm font-medium marker:hidden">
              {item.q}
              <span className="text-muted-2 transition-transform group-open:rotate-45">
                <PlusIcon />
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ---- CTA band ----------------------------------------------------- */

function CtaBand() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="bg-hero relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border-strong px-6 py-16 text-center">
        <div className="bg-grid absolute inset-0" />
        <div className="relative">
          <ShieldCheck className="mx-auto size-8 text-accent-soft" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to trade the trenches?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Join the traders using Trenchers to move faster on Solana.
          </p>
          <a href={APP_URL} className="btn btn-primary mt-8 px-6 py-3 text-sm">
            Launch app
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---- Footer ------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-mark.svg" alt="Trenchers" width={28} height={24} className="h-6 w-auto" />
            <span className="text-sm font-semibold tracking-tight">
              Trenchers<span className="text-accent">.AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
            <a href={APP_URL} className="transition-colors hover:text-foreground">Launch app</a>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {2026} Trenchers.AI — All rights reserved.</p>
          <p>Crypto trading involves risk. Nothing here is financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
