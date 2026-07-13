"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Settings, Bell, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [{ label: "Access", icon: ShieldCheck, href: "/" }];

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Image src="/logo-mark.svg" alt="Trenchers" width={28} height={24} className="h-6 w-auto" priority />
        <span className="text-sm font-semibold tracking-tight">
          Trenchers<span className="text-accent"> Admin</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-2">Platform</p>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active ? "bg-accent/12 text-foreground" : "text-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <Icon className={cn("size-[18px] shrink-0", active ? "text-accent" : "text-muted-2")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3">
        <a href="#" className="focus-ring flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground">
          <Settings className="size-[18px] text-muted-2" /> Settings
        </a>
      </div>

      <div className="border-t border-border p-3">
        <button className="focus-ring flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-semibold text-white">A</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">Anand</span>
            <span className="block truncate text-xs text-muted-2">anand@trenchers.ai</span>
          </span>
          <ChevronDown className="size-4 text-muted-2" />
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar lg:block">
        <SidebarBody />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-sidebar">
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="focus-ring absolute right-3 top-4 flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2">
              <X className="size-5" />
            </button>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="focus-ring flex size-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 lg:hidden">
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-medium lg:hidden">Trenchers Admin</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button aria-label="Notifications" className="focus-ring relative flex size-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2">
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-accent ring-2 ring-background" />
            </button>
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-semibold text-white lg:hidden">A</span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
