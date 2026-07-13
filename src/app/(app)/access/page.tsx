import { AccessTable } from "@/components/access-table";
import { loadAllEnvs } from "@/lib/whitelist-data";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const data = await loadAllEnvs();
  return <AccessTable data={data} />;
}
