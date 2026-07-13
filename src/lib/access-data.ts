// Mock platform-access data. Mirrors the ops whitelist shape; swap for the API.

export type Env = "staging" | "production";
export type Kind = "email" | "wallet";
export type Status = "allowed" | "pending";

export interface AccessEntry {
  id: string;
  kind: Kind;
  value: string;
  note?: string;
  status: Status;
  enabled?: boolean;  // allowed entries can be temporarily disabled (default true)
  liveBot?: boolean;  // permission to run real-money (live) trading bots
  addedBy?: string;   // who granted (allowed)
  addedAt?: string;   // display date (allowed)
  attempts?: number;  // login attempts while turned away (pending)
  requestedAt?: string; // display (pending)
}

export const INITIAL_ACCESS: Record<Env, AccessEntry[]> = {
  production: [
    { id: "p1", kind: "email", value: "trader.jane@gmail.com", status: "allowed", liveBot: true, addedBy: "anand@trenchers.ai", addedAt: "Jul 12", note: "KOL" },
    { id: "p2", kind: "wallet", value: "7xKq9fLm2pQr8sTuVwXy3zAbCdEfGhJkLmNoPqRsTu9a", status: "allowed", liveBot: true, addedBy: "sam@trenchers.ai", addedAt: "Jul 11" },
    { id: "p3", kind: "email", value: "degen.mike@protonmail.com", status: "allowed", addedBy: "anand@trenchers.ai", addedAt: "Jul 10" },
    { id: "p4", kind: "email", value: "alpha.hunter@gmail.com", status: "allowed", addedBy: "sam@trenchers.ai", addedAt: "Jul 8" },
    { id: "p5", kind: "email", value: "whale@gmail.com", status: "pending", attempts: 3, requestedAt: "2m ago" },
    { id: "p6", kind: "wallet", value: "3nP4qRsTuVwXyZaBcDeFgHjKmNpQrStUvWxYz2A5b6C7", status: "pending", attempts: 1, requestedAt: "1h ago" },
    { id: "p7", kind: "email", value: "newcomer.sol@gmail.com", status: "pending", attempts: 2, requestedAt: "3h ago" },
  ],
  staging: [
    { id: "s1", kind: "email", value: "qa@trenchers.ai", status: "allowed", addedBy: "anand@trenchers.ai", addedAt: "Jul 10" },
    { id: "s2", kind: "email", value: "test.user@gmail.com", status: "pending", attempts: 2, requestedAt: "5h ago" },
  ],
};
