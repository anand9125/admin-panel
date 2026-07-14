import "server-only";
import { call, type Platform } from "./backend";
import type { FlagMode, FlagConfig } from "@/lib/flags";

/**
 * Global per-flag rollout config, per environment.
 *
 * Backend contract (to expose):
 *   GET   /admin/feature-flags            → { [key]: "off" | "custom" | "everyone" }
 *   PATCH /admin/feature-flags/{key}      body { mode } → { key, mode }
 *
 * "everyone" = on for all users, "off" = off for all, "custom" = per-user.
 */
export function getFlagConfig(env: Platform): Promise<FlagConfig> {
  return call<FlagConfig>(env, "GET", "/admin/feature-flags");
}

export function setFlagModeApi(env: Platform, key: string, mode: FlagMode): Promise<unknown> {
  return call(env, "PATCH", `/admin/feature-flags/${key}`, { mode });
}
