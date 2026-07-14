import "server-only";
import { call, type Platform } from "./backend";

/** A signed-up user, as returned by the ops-token /admin/users API. */
export interface AdminUser {
  id: string;
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  funding_wallet_address: string | null;
  live_trading_enabled: boolean;
  /** Per-user paper-SOL seed override in lamports, or `null` to inherit the
   *  global default. Managed via PATCH /admin/users/{id}/paper-seed. */
  paper_seed_lamports: number | null;
  /** Generic per-user feature flags (backend `users.feature_flags` JSONB). */
  feature_flags?: Record<string, boolean>;
  is_onboarded: boolean;
  created_at: string;
}

export interface ListUsersResponse {
  total: number;
  users: AdminUser[];
}

/** List users (optionally filtered). `search` matches email/username/display/wallets. */
export function listUsers(env: Platform, opts: { search?: string; limit?: number } = {}): Promise<ListUsersResponse> {
  const q = new URLSearchParams();
  if (opts.search) q.set("search", opts.search);
  if (opts.limit) q.set("limit", String(opts.limit));
  const qs = q.toString();
  return call<ListUsersResponse>(env, "GET", `/admin/users${qs ? `?${qs}` : ""}`);
}

/** Toggle a user's live-trading (real-money bot) entitlement. */
export function setLiveTrading(
  env: Platform,
  id: string,
  enabled: boolean,
): Promise<{ id: string; live_trading_enabled: boolean }> {
  return call(env, "PATCH", `/admin/users/${id}`, { live_trading_enabled: enabled });
}

/**
 * Set one per-user feature flag by key.
 * — "live_trading" bridges to the EXISTING endpoint (PATCH /admin/users/{id}
 *   { live_trading_enabled }) so it works today.
 * — every other key uses the generic PATCH /admin/users/{id}/flags { key, enabled }
 *   (backend to expose; stores in users.feature_flags JSONB).
 */
export function setUserFlag(env: Platform, id: string, key: string, enabled: boolean): Promise<unknown> {
  if (key === "live_trading") {
    return call(env, "PATCH", `/admin/users/${id}`, { live_trading_enabled: enabled });
  }
  return call(env, "PATCH", `/admin/users/${id}/flags`, { key, enabled });
}
