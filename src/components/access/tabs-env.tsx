import Link from "next/link";
import { cn } from "@/lib/utils";
import { PLATFORMS, type Platform } from "@/lib/server/backend";

const PATHS = { access: "/", flags: "/feature-flags", paper: "/paper-sol" } as const;

/** Environment switch (staging / production). Env lives in the URL. */
export function TabsEnv({ tab, env }: { tab: "access" | "flags" | "paper"; env: Platform }) {
  const path = PATHS[tab];
  return (
    <div role="tablist" aria-label="Environment" className="inline-flex rounded-lg border border-border bg-surface p-0.5">
      {PLATFORMS.map((e) => (
        <Link
          key={e}
          href={`${path}?env=${e}`}
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
  );
}
