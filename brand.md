# Brand — Trenchers Admin (Platform Access)

Design language mirrors the main **trenchers_fe** trading app so this internal tool
feels like part of the same product family. Dark-first, layered blacks, one hot
accent, Geist type.

## Palette (source of truth)

Surfaces — darkest → elevated:

| Token | Hex | Use |
|---|---|---|
| `--background` | `#0f0f0f` | page background |
| panel / card | `#151515` | cards, panels |
| `--background-elevated` | `#1a1a1a` | hover, inputs, chips |
| `--border` | `#232323` | hairline separators |
| `--border-strong` | `#303030` | focused / emphasized borders |
| `--foreground` | `#ededed` | primary text (softer than pure white) |
| `--muted` | `#8a8a8f` | secondary text |
| `--muted-faint` | `#5b5b60` | timestamps, meta |

Accent + semantic:

| Token | Hex | Use |
|---|---|---|
| `--accent` (brand) | `#ff0751` | active nav, primary emphasis, logo badge |
| `--accent-highlight` | `#ff85a9` | brand gradient end |
| `--accent-green` | `#2fe0a4` | status: allowed / success (trenchers pnl-up) |
| `--accent-amber` | `#e0a23a` | status: pending / warning |
| `--accent-red` | `#ec397a` | status: destructive / removed (trenchers pnl-down) |
| `--accent-blue` | `#5b8cff` | info: staging environment, email kind |

Rule: **one brand accent** (`#ff0751`) for interactive emphasis; green/amber/red are
reserved strictly for status. Production is emphasized with the brand crimson;
staging with the calmer blue.

## Typography

- **Geist** (sans) for UI, **Geist Mono** for emails, wallets, counts, timestamps.
- Loaded via `next/font/google`.

## Logo

- `public/logo-mark.svg` — the silvery "T" range mark (use in sidebar + login).
- `public/logo-full.svg` — mark + wordmark.

## Voice

Terse, operational, active voice. "Add to production list", "3 pending", "Nobody is
allowed yet". No filler.
