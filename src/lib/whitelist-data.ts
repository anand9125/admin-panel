import {
  listWhitelist,
  isPlatformConfigured,
  WhitelistApiError,
  PLATFORMS,
  type Platform,
  type WhitelistEntry,
} from "@/lib/whitelist-api";

export interface EnvData {
  entries: WhitelistEntry[];
  error: string | null;
  configured: boolean;
}

export type AllEnvs = Record<Platform, EnvData>;

/** Load one environment's list, turning any failure into a display string. */
async function loadEnv(env: Platform): Promise<EnvData> {
  if (!isPlatformConfigured(env)) {
    return { entries: [], error: `${env} backend is not configured`, configured: false };
  }
  try {
    const entries: WhitelistEntry[] = await listWhitelist(env);
    return { entries, error: null, configured: true };
  } catch (e) {
    const error =
      e instanceof WhitelistApiError
        ? e.status === 0
          ? `Can't reach the ${env} API — ${e.message}`
          : `${env} API error (${e.status}): ${e.message}`
        : `Failed to load the ${env} access list.`;
    return { entries: [], error, configured: true };
  }
}

/** Load every environment in parallel, keyed by platform. */
export async function loadAllEnvs(): Promise<AllEnvs> {
  const [staging, production] = await Promise.all(PLATFORMS.map(loadEnv));
  return { staging, production };
}
