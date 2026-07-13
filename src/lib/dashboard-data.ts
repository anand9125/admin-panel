// Mock data for the dashboard UI. Swap for real API calls later.

export interface Kpi {
  label: string;
  value: string;
  deltaPct: number; // positive = up
  spark: number[];
}

export const KPIS: Kpi[] = [
  { label: "Total volume (24h)", value: "$4.82M", deltaPct: 12.4, spark: [12, 18, 14, 22, 26, 21, 30, 28, 34, 33, 40, 44] },
  { label: "Active traders", value: "8,214", deltaPct: 5.1, spark: [30, 31, 29, 33, 35, 34, 38, 40, 39, 42, 44, 46] },
  { label: "Trades executed", value: "126.4k", deltaPct: 9.8, spark: [20, 24, 22, 28, 27, 31, 35, 33, 38, 41, 44, 48] },
  { label: "Fees earned (24h)", value: "$38.6k", deltaPct: -3.2, spark: [40, 38, 41, 37, 36, 34, 35, 33, 32, 34, 31, 30] },
];

// 14-day volume series (in $M) for the area chart.
export const VOLUME_SERIES: { day: string; value: number }[] = [
  { day: "Jul 1", value: 2.1 }, { day: "Jul 2", value: 2.6 }, { day: "Jul 3", value: 2.3 },
  { day: "Jul 4", value: 3.1 }, { day: "Jul 5", value: 3.4 }, { day: "Jul 6", value: 3.0 },
  { day: "Jul 7", value: 3.9 }, { day: "Jul 8", value: 4.2 }, { day: "Jul 9", value: 3.8 },
  { day: "Jul 10", value: 4.6 }, { day: "Jul 11", value: 4.3 }, { day: "Jul 12", value: 5.1 },
  { day: "Jul 13", value: 4.7 }, { day: "Jul 14", value: 5.4 },
];

export interface Launchpad {
  name: string;
  share: number; // 0..1
  volume: string;
}
export const LAUNCHPADS: Launchpad[] = [
  { name: "pump.fun", share: 0.52, volume: "$2.51M" },
  { name: "Raydium", share: 0.24, volume: "$1.16M" },
  { name: "Moonshot", share: 0.14, volume: "$675k" },
  { name: "Meteora", share: 0.10, volume: "$482k" },
];

export type ActivityKind = "buy" | "sell" | "bot" | "signup";
export interface Activity {
  id: string;
  kind: ActivityKind;
  actor: string;
  detail: string;
  amount: string;
  time: string;
}
export const ACTIVITY: Activity[] = [
  { id: "1", kind: "buy", actor: "7xKq…9aBc", detail: "Bought $WIF", amount: "+12.4 SOL", time: "2m ago" },
  { id: "2", kind: "bot", actor: "sniper-01", detail: "Bot filled $POPCAT", amount: "+3.1 SOL", time: "6m ago" },
  { id: "3", kind: "sell", actor: "3nP4…b6C7", detail: "Sold $GIGA", amount: "-8.0 SOL", time: "11m ago" },
  { id: "4", kind: "signup", actor: "trader.jane", detail: "New trader joined", amount: "—", time: "18m ago" },
  { id: "5", kind: "buy", actor: "Hb2k…Qq21", detail: "Bought $TRENCH", amount: "+45.2 SOL", time: "24m ago" },
  { id: "6", kind: "sell", actor: "9dFa…7kLm", detail: "Sold $MOON", amount: "-2.3 SOL", time: "31m ago" },
];
