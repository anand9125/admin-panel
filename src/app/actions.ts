"use server";

import { revalidatePath } from "next/cache";
import { auth, emailAllowed, signOut } from "@/auth";
import { BackendError, type Platform } from "@/lib/server/backend";
import { addWhitelist, setWhitelistEnabled, removeWhitelist, type WhitelistKind } from "@/lib/server/whitelist-api";
import { setUserFlag as setUserFlagApi } from "@/lib/server/users-api";
import { setFlagModeApi } from "@/lib/server/flags-api";
import type { FlagMode } from "@/lib/flags";

export interface ActionResult {
  ok?: true;
  error?: string;
}

async function actor(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!emailAllowed(email)) throw new Error("unauthorized");
  return email!.toLowerCase();
}

function asPlatform(env: string): Platform {
  if (env !== "staging" && env !== "production") throw new Error(`invalid environment: ${env}`);
  return env;
}

function friendly(e: unknown): string {
  if (e instanceof BackendError) {
    return e.status === 0 ? `Can't reach the backend — ${e.message}` : `Backend error (${e.status}): ${e.message}`;
  }
  if (e instanceof Error && e.message === "unauthorized") return "Your session expired — sign in again.";
  if (e instanceof Error && e.message.startsWith("invalid")) return e.message;
  return "Something went wrong. Try again.";
}

/* ---- whitelist (platform access) ---------------------------------- */

export async function addEntry(env: string, formData: FormData): Promise<ActionResult> {
  try {
    const by = await actor();
    const platform = asPlatform(env);
    const kind = (String(formData.get("kind") ?? "email") === "wallet" ? "wallet" : "email") as WhitelistKind;
    const value = String(formData.get("value") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim() || null;
    if (!value) return { error: "Enter an email or wallet." };
    await addWhitelist(platform, { kind, value, note, addedBy: by });
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}

export async function toggleEntry(env: string, id: string, enabled: boolean): Promise<ActionResult> {
  try {
    await actor();
    const platform = asPlatform(env);
    await setWhitelistEnabled(platform, id, enabled);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}

export async function deleteEntry(env: string, id: string): Promise<ActionResult> {
  try {
    await actor();
    const platform = asPlatform(env);
    await removeWhitelist(platform, id);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}

/* ---- feature flags ------------------------------------------------ */

/** Set one per-user feature flag (key "live_trading" bridges to its column). */
export async function setUserFlag(env: string, id: string, key: string, enabled: boolean): Promise<ActionResult> {
  try {
    await actor();
    const platform = asPlatform(env);
    await setUserFlagApi(platform, id, key, enabled);
    revalidatePath("/feature-flags");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}

/** Set a flag's global rollout mode (off / custom / everyone). */
export async function setFlagMode(env: string, key: string, mode: FlagMode): Promise<ActionResult> {
  try {
    await actor();
    const platform = asPlatform(env);
    await setFlagModeApi(platform, key, mode);
    revalidatePath("/feature-flags");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}

/* ---- session ------------------------------------------------------ */

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
