import Link from "next/link";
import { cn } from "@/lib/utils";
import { PLATFORMS, type Platform } from "@/lib/server/backend";

const TABS = [
  { key: "access", label: "Platform access", path: "/" },
  { key: "live", label: "Live trading", path: "/live-trading" },
] as const;

/** Shared tab nav + environment switch. Pure links — env/tab live in the URL. */
export function TabsEnv({ tab, env }: { tab: "access" | "live"; env: Platform }) {
  const pathFor = (t: (typeof TABS)[number]["key"]) => TABS.find((x) => x.key === t)!.path;
  const activePath = pathFor(tab);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" aria-label="View" className="inline-flex rounded-lg border border-border bg-surface p-0.5">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`${t.path}?env=${env}`}
            role="tab"
            aria-selected={t.key === tab}
            className={cn(
              "focus-ring min-h-9 rounded-md px-3 text-sm font-medium transition-colors",
              t.key === tab ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div role="tablist" aria-label="Environment" className="inline-flex rounded-lg border border-border bg-surface p-0.5">
        {PLATFORMS.map((e) => (
          <Link
            key={e}
            href={`${activePath}?env=${e}`}
            role="tab"
            aria-selected={e === env}
            title={e === "production" ? "Production — live users" : undefined}
            className={cn(
              "focus-ring flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium capitalize transition-colors",
              e === env ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {e === "production" && <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />}
            {e}
          </Link>
        ))}
      </div>
    </div>
  );
}
