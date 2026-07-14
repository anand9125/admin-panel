import { Zap, Copy, CandlestickChart, Code, Gauge, Sparkles, type LucideIcon } from "lucide-react";
import type { AdminUser } from "@/lib/server/users-api";

/**
 * Feature-flag registry — the single source of truth for the admin panel.
 * Add a per-user feature flag by appending one entry here; it then appears
 * automatically in the per-user drawer, the rollout view, the table summary,
 * and the counts.
 *
 * `id` is the flag KEY the backend stores/reads. The special key `live_trading`
 * maps to the dedicated `users.live_trading_enabled` column; every other key
 * lives in the generic `users.feature_flags` map the backend exposes.
 */
export interface FeatureFlag {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Trading" | "Platform" | "Access";
}

export const LIVE_TRADING = "live_trading";

export const FEATURE_FLAGS: FeatureFlag[] = [
  { id: LIVE_TRADING, label: "Live trading", description: "Create & run real-money (non-paper) bots", icon: Zap, group: "Trading" },
  { id: "copy_trade", label: "Copy trading", description: "Mirror smart-money wallets automatically", icon: Copy, group: "Trading" },
  { id: "priority_exec", label: "Priority execution", description: "Low-latency order routing", icon: Gauge, group: "Trading" },
  { id: "advanced_charts", label: "Advanced charts", description: "Pro TradingView tools & indicators", icon: CandlestickChart, group: "Platform" },
  { id: "api_access", label: "API access", description: "Programmatic API keys", icon: Code, group: "Platform" },
  { id: "beta", label: "Beta features", description: "Early access to new features", icon: Sparkles, group: "Access" },
];

export const FLAG_GROUPS = ["Trading", "Platform", "Access"] as const;

/** Global rollout for a flag, per environment. */
export type FlagMode = "off" | "custom" | "everyone";
export type FlagConfig = Record<string, FlagMode>;

export const defaultFlagConfig = (): FlagConfig =>
  Object.fromEntries(FEATURE_FLAGS.map((f) => [f.id, "custom" as FlagMode]));

/** A user's raw per-user value for a flag key (live_trading bridges to its column). */
export function userFlagValue(user: AdminUser, key: string): boolean {
  if (key === LIVE_TRADING) return user.live_trading_enabled;
  return !!user.feature_flags?.[key];
}

/** Effective value = global mode combined with the user's per-user override. */
export const effectiveFlag = (mode: FlagMode | undefined, userValue: boolean): boolean =>
  mode === "everyone" ? true : mode === "off" ? false : userValue;

/** Flags effectively ON for a user, given the env's rollout config. */
export const enabledFlags = (user: AdminUser, cfg: FlagConfig) =>
  FEATURE_FLAGS.filter((f) => effectiveFlag(cfg[f.id], userFlagValue(user, f.id)));

export const flagCount = (user: AdminUser, cfg: FlagConfig) => enabledFlags(user, cfg).length;
