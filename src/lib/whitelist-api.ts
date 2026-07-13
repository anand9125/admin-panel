// Client for the solana-terminal login allow-list API (`/admin/whitelist*`).
//
// The whitelist lives in each backend's DB so the Rust login path can read it on
// the hot path; ops never touches that DB directly. Instead this module calls
// the backend's service-token-guarded admin API, presenting the shared secret in
// the `X-Ops-Token` header.
//
// MULTI-ENVIRONMENT: ops manages BOTH the staging and production allow-lists,
// which live on two separate backends. Every call takes a `Platform` and is
// routed to that environment's URL + token:
//   staging    → SOLANA_TERMINAL_API_URL_STAGING    (fallback SOLANA_TERMINAL_API_URL)
//   production → SOLANA_TERMINAL_API_URL_PRODUCTION
//   token      → OPS_SERVICE_TOKEN_<ENV>            (fallback OPS_SERVICE_TOKEN)
//
// Server-only: reads non-public env vars (no NEXT_PUBLIC_ prefix → never shipped
// to the browser). Import only from server components / server actions — never
// from a "use client" module, or the token would leak into the client bundle.

/** Which backend to manage. */
export type Platform = "staging" | "production";

export const PLATFORMS: Platform[] = ["staging", "production"];

export type WhitelistKind = "email" | "wallet";

export interface WhitelistEntry {
  id: string;
  kind: WhitelistKind;
  value: string;
  note: string | null;
  enabled: boolean;
  added_by: string | null;
  created_at: string;
  /** "admin" (operator-added) or "request" (self-requested via a turned-away login). */
  source: "admin" | "request";
  /** When the identity was last turned away while not allowed (self-requests). */
  requested_at: string | null;
  /** How many times this identity has been turned away. */
  attempts: number;
}

/** Thrown when the backend rejects or is unreachable; `status` is 0 on network failure. */
export class WhitelistApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "WhitelistApiError";
    this.status = status;
  }
}

/** True if an environment is wired up (has a base URL + token configured). */
export function isPlatformConfigured(env: Platform): boolean {
  try {
    config(env);
    return true;
  } catch {
    return false;
  }
}

function config(env: Platform): { baseUrl: string; token: string } {
  const url =
    env === "staging"
      ? process.env.SOLANA_TERMINAL_API_URL_STAGING ?? process.env.SOLANA_TERMINAL_API_URL
      : process.env.SOLANA_TERMINAL_API_URL_PRODUCTION;
  const baseUrl = url?.replace(/\/$/, "");
  const token =
    (env === "staging"
      ? process.env.OPS_SERVICE_TOKEN_STAGING
      : process.env.OPS_SERVICE_TOKEN_PRODUCTION) ?? process.env.OPS_SERVICE_TOKEN;
  if (!baseUrl) {
    throw new WhitelistApiError(0, `${env} API URL is not configured`);
  }
  if (!token) {
    throw new WhitelistApiError(0, `${env} OPS_SERVICE_TOKEN is not configured`);
  }
  return { baseUrl, token };
}

async function call<T>(
  env: Platform,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const { baseUrl, token } = config(env);
  let resp: Response;
  try {
    resp = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "x-ops-token": token,
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (e) {
    throw new WhitelistApiError(0, `cannot reach ${env} API: ${String(e)}`);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new WhitelistApiError(
      resp.status,
      text || `${method} ${path} failed with ${resp.status}`,
    );
  }

  // DELETE/PATCH return a small JSON ack we don't need to type strictly.
  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}

/** List every allow-list entry for an environment, newest activity first. */
export function listWhitelist(env: Platform): Promise<WhitelistEntry[]> {
  return call<WhitelistEntry[]>(env, "GET", "/admin/whitelist");
}

/** Add (or approve) an email or wallet on an environment's allow-list. */
export function addWhitelist(
  env: Platform,
  input: {
    kind: WhitelistKind;
    value: string;
    note?: string | null;
    addedBy?: string | null;
  },
): Promise<WhitelistEntry> {
  return call<WhitelistEntry>(env, "POST", "/admin/whitelist", {
    kind: input.kind,
    value: input.value,
    note: input.note ?? null,
    added_by: input.addedBy ?? null,
  });
}

/** Enable or disable an entry by id on an environment. */
export function setWhitelistEnabled(
  env: Platform,
  id: string,
  enabled: boolean,
): Promise<unknown> {
  return call(env, "PATCH", `/admin/whitelist/${id}`, { enabled });
}

/** Permanently remove an entry by id from an environment. */
export function removeWhitelist(env: Platform, id: string): Promise<unknown> {
  return call(env, "DELETE", `/admin/whitelist/${id}`);
}
