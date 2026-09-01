# Finora

Personal & shared finance manager — Next.js (App Router) + Supabase, deployed to Vercel, installable as a PWA.

Data model and architecture are documented in [`../Documentation/money-manager-erd-v2.md`](../Documentation/money-manager-erd-v2.md).

> **Note:** this project runs on Next.js 16, which has breaking changes from older Next.js versions (e.g. `middleware.ts` → `proxy.ts`, fully-async `cookies()`/`params`). See `AGENTS.md` and `node_modules/next/dist/docs/` before making changes.

## Setup

This project develops directly against a hosted Supabase project (no Docker/local stack needed).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if you don't have it (`brew install supabase/tap/supabase`).

3. Create a free project at [supabase.com](https://supabase.com), then link this repo to it:

   ```bash
   supabase link --project-ref <your-project-ref>
   ```

4. Push the migrations in `supabase/migrations/` to that project:

   ```bash
   npm run db:push
   ```

   (`supabase/seed.sql` is only auto-applied by `supabase db reset`, which is for the local/Docker stack — see below. Seed a hosted project manually via the Studio UI or the Supabase SQL editor if you want example data.)

5. Copy `.env.local.example` to `.env.local` and fill in the URL/anon key from your project's dashboard under Project Settings → API:

   ```bash
   cp .env.local.example .env.local
   ```

6. Run the app:

   ```bash
   npm run dev
   ```

## Database workflow

- `npm run db:push` — push local migrations in `supabase/migrations/` to the linked hosted project. This is the main way schema changes ship during development.
- `npm run db:types` — regenerate `src/lib/supabase/database.types.ts` to match the linked project's schema after any migration change:

  ```bash
  supabase gen types typescript --project-id <your-project-ref> > src/lib/supabase/database.types.ts
  ```

  (the `db:types` script itself targets `--local`, i.e. the Docker stack below — use the command above when working against the hosted project instead.)

New migrations go in `supabase/migrations/` as numbered SQL files (see the existing files for the naming/ordering convention — enums and tables first, then RLS policies, then triggers, then RPC functions).

### Optional: local Docker stack

If you'd rather iterate on schema changes offline, `supabase start` runs Postgres/Auth/Realtime in Docker locally instead of touching the hosted project (`npm run db:stop` / `npm run db:reset` manage it, and `npm run db:types` targets it by default). This is entirely optional — the hosted-project workflow above is enough for normal development.

## Deploying

- **Supabase**: create a project at [supabase.com](https://supabase.com), `supabase link --project-ref <ref>`, then `npm run db:push`.
- **Vercel**: import this repo, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables, deploy. No service-role key is needed — every query goes through the user's session and Row Level Security.

## PWA

`src/app/manifest.ts` and `public/sw.js` make the app installable on Android (Chrome) and iOS (Safari → Share → Add to Home Screen). The service worker is intentionally minimal — Finora is fully online, so it only exists for installability and a basic offline fallback page, not for caching data.

The icons in `public/icons/` and `public/apple-touch-icon.png` are flat placeholders generated for development — swap them for real Finora artwork before shipping.
