import type { AdminUser } from "@/lib/server/users-api";

/**
 * Paper-SOL helpers. Paper balance is DERIVED on the backend
 * (`seed + Σ paper PnL`), so all the panel manages is the SEED, resolved as:
 *
 *   user override  ??  global default  ??  system default (10 SOL)
 *
 * Amounts travel the wire as lamports (BIGINT); the UI speaks SOL.
 */
export const LAMPORTS_PER_SOL = 1_000_000_000;

/** Backend fallback when neither an override nor a global default is set. */
export const SYSTEM_DEFAULT_LAMPORTS = 10 * LAMPORTS_PER_SOL;

export const lamportsToSol = (lamports: number): number => lamports / LAMPORTS_PER_SOL;
export const solToLamports = (sol: number): number => Math.round(sol * LAMPORTS_PER_SOL);

/** Compact SOL string, e.g. `10`, `2.5`, `0.25` (trims trailing zeros). */
export function formatSol(lamports: number): string {
  const sol = lamportsToSol(lamports);
  return `${sol.toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
}

/** The seed a user actually gets, given the env's global default. */
export function effectiveSeedLamports(user: AdminUser, defaultLamports: number | null): number {
  return user.paper_seed_lamports ?? defaultLamports ?? SYSTEM_DEFAULT_LAMPORTS;
}

/** True when the user has a per-user override (vs inheriting the default). */
export const hasOverride = (user: AdminUser): boolean => user.paper_seed_lamports != null;
