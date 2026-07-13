import { WhitelistPanel } from "@/components/whitelist-panel";
import { loadAllEnvs } from "@/lib/whitelist-data";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const { staging, production } = await loadAllEnvs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Access list</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Only people on this list can log into the Trenchers platform. Add a Google email or a
          connected wallet; people who try to log in without access show up as requests you can
          approve in one click.
        </p>
      </div>

      <WhitelistPanel data={{ staging, production }} />
    </div>
  );
}
