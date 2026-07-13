"use server";

import { revalidatePath } from "next/cache";
import { auth, emailAllowed, signOut } from "@/auth";
import {
  addWhitelist,
  removeWhitelist,
  setWhitelistEnabled,
  WhitelistApiError,
  type Platform,
} from "@/lib/whitelist-api";

/** Result shape returned to the client form ({ ok } or { error }). */
export interface ActionResult {
  ok?: true;
  error?: string;
}

/** Sign out and return to the login screen. */
export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/** Require an allowed, signed-in user; return their email (used for attribution). */
async function requireUser(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!emailAllowed(email)) throw new Error("unauthorized");
  return email!.toLowerCase();
}

/** Validate the environment coming from the client. */
function asPlatform(env: string): Platform {
  if (env !== "staging" && env !== "production") {
    throw new Error(`invalid environment: ${env}`);
  }
  return env;
}

function friendly(e: unknown): string {
  if (e instanceof WhitelistApiError) {
    return e.status === 0 ? `Can't reach the backend — ${e.message}` : `Backend error (${e.status}): ${e.message}`;
  }
  if (e instanceof Error && (e.message === "unauthorized" || e.message.startsWith("invalid"))) {
    return e.message === "unauthorized" ? "Your session expired — sign in again." : e.message;
  }
  return "Something went wrong. Try again.";
}

/** Add (or approve) an email/wallet on an environment's access list. */
export async function addEntry(env: string, formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    const platform = asPlatform(env);
    const kind = String(formData.get("kind") ?? "email") === "wallet" ? "wallet" : "email";
    const value = String(formData.get("value") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim() || null;
    if (!value) return { error: "Enter an email or wallet." };

    await addWhitelist(platform, { kind, value, note, addedBy: actor });
    revalidatePath("/");
    revalidatePath("/access");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}

/** Enable or disable an entry by id. `value` is only used for the error text. */
export async function toggleEntry(
  env: string,
  id: string,
  enabled: boolean,
  _value?: string,
): Promise<ActionResult> {
  try {
    await requireUser();
    await setWhitelistEnabled(asPlatform(env), id, enabled);
    revalidatePath("/");
    revalidatePath("/access");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}

/** Permanently remove an entry by id. */
export async function deleteEntry(env: string, id: string, _value?: string): Promise<ActionResult> {
  try {
    await requireUser();
    await removeWhitelist(asPlatform(env), id);
    revalidatePath("/");
    revalidatePath("/access");
    return { ok: true };
  } catch (e) {
    return { error: friendly(e) };
  }
}
