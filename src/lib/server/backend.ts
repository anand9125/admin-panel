// Server-only client for the solana-terminal admin API (ops-token stack).
//
// Manages BOTH the staging and production backends. Every call takes a
// `Platform` and is routed to that environment's URL + token, presenting the
// shared secret in the `x-ops-token` header:
//   staging    → SOLANA_TERMINAL_API_URL_STAGING    (fallback SOLANA_TERMINAL_API_URL)
//   production → SOLANA_TERMINAL_API_URL_PRODUCTION
//   token      → OPS_SERVICE_TOKEN_<ENV>            (fallback OPS_SERVICE_TOKEN)
//
// Non-public env vars (no NEXT_PUBLIC_ prefix) → never shipped to the browser.
// Import ONLY from server components / server actions.
import "server-only";

export type Platform = "staging" | "production";
export const PLATFORMS: Platform[] = ["staging", "production"];

/** Thrown on backend rejection or unreachable host; `status` is 0 on network/config failure. */
export class BackendError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

function config(env: Platform): { baseUrl: string; token: string } {
  const url =
    env === "staging"
      ? process.env.SOLANA_TERMINAL_API_URL_STAGING ?? process.env.SOLANA_TERMINAL_API_URL
      : process.env.SOLANA_TERMINAL_API_URL_PRODUCTION;
  const baseUrl = url?.replace(/\/$/, "");
  const token =
    (env === "staging" ? process.env.OPS_SERVICE_TOKEN_STAGING : process.env.OPS_SERVICE_TOKEN_PRODUCTION) ??
    process.env.OPS_SERVICE_TOKEN;
  if (!baseUrl) throw new BackendError(0, `${env} API URL is not configured`);
  if (!token) throw new BackendError(0, `${env} OPS_SERVICE_TOKEN is not configured`);
  return { baseUrl, token };
}

/** True if an environment is wired up (base URL + token present). */
export function isPlatformConfigured(env: Platform): boolean {
  try {
    config(env);
    return true;
  } catch {
    return false;
  }
}

export async function call<T>(env: Platform, method: string, path: string, body?: unknown): Promise<T> {
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
    throw new BackendError(0, `cannot reach ${env} API: ${String(e)}`);
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new BackendError(resp.status, text || `${method} ${path} failed with ${resp.status}`);
  }
  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}
