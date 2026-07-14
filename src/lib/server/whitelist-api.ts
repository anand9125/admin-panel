import "server-only";
import { call, type Platform } from "./backend";

export type WhitelistKind = "email" | "wallet";

export interface WhitelistEntry {
  id: string;
  kind: WhitelistKind;
  value: string;
  note: string | null;
  enabled: boolean;
  added_by: string | null;
  created_at: string;
  source: "admin" | "request";
  requested_at: string | null;
  attempts: number;
}

/** Every allow-list entry for an environment, newest activity first. */
export function listWhitelist(env: Platform): Promise<WhitelistEntry[]> {
  return call<WhitelistEntry[]>(env, "GET", "/admin/whitelist");
}

/** Add (or approve a pending request for) an email/wallet. Upserts on (kind,value). */
export function addWhitelist(
  env: Platform,
  input: { kind: WhitelistKind; value: string; note?: string | null; addedBy?: string | null },
): Promise<WhitelistEntry> {
  return call<WhitelistEntry>(env, "POST", "/admin/whitelist", {
    kind: input.kind,
    value: input.value,
    note: input.note ?? null,
    added_by: input.addedBy ?? null,
  });
}

/** Enable / disable an entry by id. */
export function setWhitelistEnabled(env: Platform, id: string, enabled: boolean): Promise<unknown> {
  return call(env, "PATCH", `/admin/whitelist/${id}`, { enabled });
}

/** Permanently remove an entry by id. */
export function removeWhitelist(env: Platform, id: string): Promise<unknown> {
  return call(env, "DELETE", `/admin/whitelist/${id}`);
}
