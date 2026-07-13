import { Overview } from "@/components/overview";
import { loadAllEnvs } from "@/lib/whitelist-data";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await loadAllEnvs();
  // eslint-disable-next-line react-hooks/purity -- dynamic server page; current time for relative timestamps
  const now = Date.now();
  return <Overview data={data} now={now} />;
}
