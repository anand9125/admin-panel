// Mock platform-access data. Mirrors the ops whitelist shape; swap for the API.
import type { Flags } from "@/lib/flags";

export type Env = "staging" | "production";
export type Kind = "email" | "wallet";
export type Status = "allowed" | "pending";

export interface AccessEntry {
  id: string;
  kind: Kind;
  value: string;
  note?: string;
  status: Status;
  enabled?: boolean;   // allowed entries can be temporarily disabled (default true)
  flags?: Flags;       // per-user feature flags (see lib/flags.ts registry)
  addedBy?: string;
  addedAt?: string;
  attempts?: number;   // login attempts while turned away (pending)
  requestedAt?: string;
}

export const INITIAL_ACCESS: Record<Env, AccessEntry[]> = {
  production: [
    { id: "p1", kind: "email", value: "trader.jane@gmail.com", status: "allowed", addedAt: "Jul 12", note: "KOL", flags: { live_bot: true, copy_trade: true, advanced_charts: true, beta: true } },
    { id: "p2", kind: "wallet", value: "7xKq9fLm2pQr8sTuVwXy3zAbCdEfGhJkLmNoPqRsTu9a", status: "allowed", addedAt: "Jul 11", flags: { live_bot: true, priority_exec: true } },
    { id: "p3", kind: "email", value: "degen.mike@protonmail.com", status: "allowed", addedAt: "Jul 10", flags: { advanced_charts: true } },
    { id: "p4", kind: "email", value: "alpha.hunter@gmail.com", status: "allowed", addedAt: "Jul 8", flags: {} },
    { id: "p5", kind: "email", value: "whale@gmail.com", status: "pending", attempts: 3, requestedAt: "2m ago" },
    { id: "p6", kind: "wallet", value: "3nP4qRsTuVwXyZaBcDeFgHjKmNpQrStUvWxYz2A5b6C7", status: "pending", attempts: 1, requestedAt: "1h ago" },
    { id: "p7", kind: "email", value: "newcomer.sol@gmail.com", status: "pending", attempts: 2, requestedAt: "3h ago" },
  ],
  staging: [
    { id: "s1", kind: "email", value: "qa@trenchers.ai", status: "allowed", addedAt: "Jul 10", flags: { live_bot: true, api_access: true, beta: true } },
    { id: "s2", kind: "email", value: "test.user@gmail.com", status: "pending", attempts: 2, requestedAt: "5h ago" },
  ],
};
