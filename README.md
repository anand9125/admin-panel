# Trenchers — Platform Access Panel

A **standalone**, single-purpose app for granting and revoking Trenchers
platform login access. It exists so you can hand access-management to many people
**without** giving them the internal ops console (`ops.trenchers.ai`), which also
holds secrets, infra, and the console-user governance.

## What it does

- View the platform allow-list (production, and optionally staging).
- Add a Google email or connected wallet to the list.
- Approve **access requests** — people who tried to log in and were turned away.
- Enable / disable / remove entries.

That's the entire surface. There is no secrets editor, no infra, no way to reach
ops from here.

## How it fits together

The allow-list itself lives in the **solana-terminal** backend DB (the Rust
login path reads it on the hot path). Both this panel and ops are just clients of
the backend's service-token-guarded admin API:

```
GET/POST   /admin/whitelist         PATCH/DELETE /admin/whitelist/:id
auth: X-Ops-Token: <OPS_SERVICE_TOKEN>   (per-env: staging / production)
```

So this app stores **no** whitelist data of its own and needs **no** database.
Every grant is attributed to the signed-in user via the backend's `added_by`
field, giving you a "who added whom" trail without extra infra.

## Auth

Google OAuth locked to your Workspace domain (`ACCESS_PANEL_DOMAIN`, default
`trenchers.ai`). Two ways to control who gets in:

- **Domain-only** (default): any verified `@trenchers.ai` account can use it.
- **Explicit allow-list**: set `ACCESS_PANEL_ALLOWED_EMAILS` to a comma-separated
  list and only those addresses may sign in.

The backend service token is read only in server actions and never shipped to the
browser.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # fill in AUTH_* and the backend URL + token
pnpm dev                     # http://localhost:3000
```

## Deploy

Any Next.js host (Vercel is simplest — mirrors the frontend). Set every var from
`.env.example` in the host's environment, and add
`https://<your-domain>/api/auth/callback/google` as an authorized redirect URI on
the Google OAuth client.

> The panel is a client of the **production** backend, so its network path must be
> allowed to reach `SOLANA_TERMINAL_API_URL_PRODUCTION`.
