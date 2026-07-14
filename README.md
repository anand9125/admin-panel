# Trenchers Admin

Internal admin panel for **platform access** and **live-trading entitlement**,
wired to the `solana-terminal` backend over its ops-token admin API.

## What it does

- **Platform access** — manage the login allow-list (`/admin/whitelist`): add an
  email/wallet, approve people who requested access, enable/disable, remove.
- **Live trading** — toggle a user's real-money bot entitlement
  (`users.live_trading_enabled`) via `/admin/users`. Searchable.
- Both are per environment (**staging** / **production**), switched in the URL.

## Architecture

- Next.js (App Router) + TypeScript + Tailwind v4.
- **Auth**: Google OAuth locked to `@trenchers.ai` (Auth.js). Every route gated in
  `src/proxy.ts`.
- **Backend calls are server-only** (`src/lib/server/*`, `import "server-only"`).
  The `X-Ops-Token` never reaches the browser. Mutations run through server
  actions in `src/app/actions.ts`.
- No database of its own — it's a thin client of the solana-terminal admin API.

## Backend it talks to (already exists, no Rust changes)

| Feature | Route (X-Ops-Token) |
|---|---|
| List / add / enable-disable / remove access | `GET/POST/PATCH/DELETE /admin/whitelist` |
| List users, toggle live trading | `GET /admin/users`, `PATCH /admin/users/{id}` |

## Configure

Copy `.env.example` → `.env.local` and fill in:

- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (add this app's callback
  `https://<domain>/api/auth/callback/google` to the Google OAuth client)
- `SOLANA_TERMINAL_API_URL_PRODUCTION` + `OPS_SERVICE_TOKEN_PRODUCTION`
  (token must match `OPS_SERVICE_TOKEN` on the backend). Staging vars optional.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
```

Until the backend vars are set, each view shows a clear "not configured" state.
