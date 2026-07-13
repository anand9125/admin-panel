import { Zap, Copy, CandlestickChart, Code, Gauge, Sparkles, type LucideIcon } from "lucide-react";

/**
 * Feature-flag registry — the single source of truth.
 * Add a new per-user feature flag by appending one entry here; it then appears
 * automatically in the user drawer, the table summary, and the counts.
 */
export interface FeatureFlag {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Trading" | "Platform" | "Access";
}

export const FEATURE_FLAGS: FeatureFlag[] = [
  { id: "live_bot", label: "Live bots", description: "Run real-money trading bots", icon: Zap, group: "Trading" },
  { id: "copy_trade", label: "Copy trading", description: "Mirror smart-money wallets automatically", icon: Copy, group: "Trading" },
  { id: "priority_exec", label: "Priority execution", description: "Low-latency order routing", icon: Gauge, group: "Trading" },
  { id: "advanced_charts", label: "Advanced charts", description: "Pro TradingView tools & indicators", icon: CandlestickChart, group: "Platform" },
  { id: "api_access", label: "API access", description: "Programmatic API keys", icon: Code, group: "Platform" },
  { id: "beta", label: "Beta features", description: "Early access to new features", icon: Sparkles, group: "Access" },
];

export const FLAG_GROUPS = ["Trading", "Platform", "Access"] as const;

export type Flags = Record<string, boolean>;

export const flagCount = (flags?: Flags) => (flags ? Object.values(flags).filter(Boolean).length : 0);
export const enabledFlags = (flags?: Flags) => FEATURE_FLAGS.filter((f) => flags?.[f.id]);
