import "server-only";
import { call, type Platform } from "./backend";

/**
 * Paper-SOL seed API (ops-token stack). Manages the configurable paper-wallet
 * seed — the backend derives every balance from it live, so a change applies to
 * existing AND future users with no backfill.
 *   GET|PATCH /admin/paper-seed-default   — global default (null = system 10 SOL)
 *   PATCH     /admin/users/{id}/paper-seed — per-user override (null = inherit)
 */

/** The admin-set global default seed in lamports, or `null` when unset. */
export function getPaperSeedDefault(env: Platform): Promise<{ lamports: number | null }> {
  return call(env, "GET", "/admin/paper-seed-default");
}

/** Set (or clear with `null`) the global default seed. Applies live. */
export function setPaperSeedDefault(env: Platform, lamports: number | null): Promise<{ lamports: number | null }> {
  return call(env, "PATCH", "/admin/paper-seed-default", { lamports });
}

/** Set (or clear with `null`) a user's per-user seed override. Applies live. */
export function setUserPaperSeed(
  env: Platform,
  id: string,
  lamports: number | null,
): Promise<{ id: string; paper_seed_lamports: number | null }> {
  return call(env, "PATCH", `/admin/users/${id}/paper-seed`, { lamports });
}
