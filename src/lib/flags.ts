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

/**
 * Global rollout for a flag:
 *  - "everyone": on for every allowed user
 *  - "off": off for everyone
 *  - "custom": decided per-user
 */
export type FlagMode = "off" | "custom" | "everyone";
export type FlagConfig = Record<string, FlagMode>;

/** Default config: every flag starts in per-user "custom" mode. */
export const defaultFlagConfig = (): FlagConfig =>
  Object.fromEntries(FEATURE_FLAGS.map((f) => [f.id, "custom" as FlagMode]));

/** Effective value for a user, combining global mode + their per-user override. */
export const effectiveFlag = (mode: FlagMode | undefined, userValue?: boolean): boolean =>
  mode === "everyone" ? true : mode === "off" ? false : !!userValue;

/** Flags that are effectively ON for a user, given the env's config. */
export const enabledFlags = (flags: Flags | undefined, cfg?: FlagConfig) =>
  FEATURE_FLAGS.filter((f) => effectiveFlag(cfg?.[f.id], flags?.[f.id]));

export const flagCount = (flags: Flags | undefined, cfg?: FlagConfig) => enabledFlags(flags, cfg).length;
