# Trenchers — Landing Page

Marketing landing page for **Trenchers**, an all-in-one Solana trading terminal:
a real-time token feed, AI trading agents, and one-click execution.

Dark, premium-crypto design. Single static page — no backend, no auth.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (design tokens in `src/app/globals.css`)
- `lucide-react` icons, Geist / Geist Mono via `next/font`

## Structure

- `src/app/page.tsx` — the landing page (hero, stats, features, how-it-works, FAQ, CTA, footer)
- `src/components/site-nav.tsx` — sticky nav + mobile menu
- `src/app/globals.css` — theme tokens, backdrop glow/grid, buttons, animations

The "Launch app" / "Sign in" links point at `APP_URL` (currently
`https://trenchers.ai`) — update that constant in `page.tsx` and `site-nav.tsx`.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
```

## Deploy

Any static/Next host (Vercel is simplest). No environment variables required.
