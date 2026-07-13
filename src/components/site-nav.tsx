"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X, ArrowUpRight } from "lucide-react";

const APP_URL = "https://trenchers.ai";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5 outline-none">
      <Image src="/logo-mark.svg" alt="Trenchers" width={30} height={26} className="h-6 w-auto" priority />
      <span className="text-[15px] font-semibold tracking-tight">
        Trenchers<span className="text-accent">.AI</span>
      </span>
    </a>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav className="mt-3 flex h-14 items-center justify-between rounded-2xl border border-border bg-background/70 px-4 backdrop-blur-xl">
          <Logo />

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <a href={APP_URL} className="text-sm text-muted transition-colors hover:text-foreground px-3 py-2">
              Sign in
            </a>
            <a href={APP_URL} className="btn btn-primary px-4 py-2 text-sm">
              Launch app
              <ArrowUpRight className="size-4" />
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {open && (
          <div className="mt-2 rounded-2xl border border-border bg-surface/95 p-3 backdrop-blur-xl md:hidden">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href={APP_URL}
              className="btn btn-primary mt-2 w-full px-4 py-2.5 text-sm"
            >
              Launch app
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
