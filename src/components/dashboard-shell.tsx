"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Icon, type IconProps } from "@/components/brand";
import { logout } from "@/app/actions";

interface NavItem {
  href: string;
  label: string;
  icon: (p: IconProps) => React.ReactElement;
}

const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: Icon.overview },
  { href: "/access", label: "Access list", icon: Icon.access },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** App chrome: fixed sidebar on desktop, slide-over drawer on mobile. */
export function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="bg-aurora relative min-h-screen lg:flex">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-6 w-auto" />
          <span className="text-sm font-semibold tracking-tight">
            Trenchers<span className="text-gradient">.AI</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon.menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer scrim */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-border bg-surface/95 backdrop-blur transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{ ["--ease" as string]: "cubic-bezier(0.19,1,0.22,1)" }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-auto" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                Trenchers<span className="text-gradient">.AI</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
                platform access
              </div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground lg:hidden"
          >
            <Icon.close className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={[
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-background-elevated text-foreground"
                    : "text-muted hover:bg-background-elevated/60 hover:text-foreground",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                )}
                <ItemIcon
                  className={active ? "size-[18px] text-accent" : "size-[18px] text-muted-faint group-hover:text-muted"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-elevated text-xs font-semibold text-muted">
              {email.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-[11px] text-muted" title={email}>
                {email}
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Sign out"
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-faint transition-colors hover:bg-background-elevated hover:text-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon.logout className="size-[18px]" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
