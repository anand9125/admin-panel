"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/actions";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/access", label: "Access list", icon: ShieldCheck },
];

function active(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function pageTitle(pathname: string) {
  return NAV.find((n) => active(pathname, n.href))?.label ?? "Trenchers Admin";
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground">
        T
      </span>
      <span className="text-sm font-semibold tracking-tight">
        Trenchers <span className="font-normal text-muted-foreground">Admin</span>
      </span>
    </Link>
  );
}

function SidebarContent({ email, onNavigate }: { email: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Platform
        </p>
        {NAV.map((item) => {
          const isActive = active(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {email.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground" title={email}>
            {email}
          </span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon" aria-label="Sign out" className="size-8">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ email, children }: { email: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        <SidebarContent email={email} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 z-10 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <X className="size-4" />
            </button>
            <SidebarContent email={email} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <h1 className="text-sm font-semibold">{pageTitle(pathname)}</h1>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
