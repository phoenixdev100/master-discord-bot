# Project Notes

Discord bot monorepo (pnpm + Turborepo). Workspaces: `apps/bot` (discord.js), `apps/api` (Fastify — NOT Express, README is wrong), `apps/dashboard` (Next.js 14 + NextAuth), `packages/{database,shared,modules,permissions}`.

## Commands

- `pnpm dev` — turbo dev for all apps (bot/api load root `.env` via dotenv-cli; dashboard now does too)
- `pnpm build` / `pnpm lint` — both currently green across all 7 workspaces
- `pnpm --filter @discord-platform/database db:generate|db:migrate:deploy|db:seed`
- Typecheck single app: `cd apps/<name> && ../../node_modules/.bin/tsc --noEmit -p tsconfig.json`

## Non-obvious architecture facts

- **API routes all live under `/api`** — the bot's `apiClient` auto-prepends `/api` to any path not already starting with it.
- **Internal auth**: bot↔API and dashboard-proxy↔API authenticate via `x-api-key: $INTERNAL_API_KEY` (see `authenticateOrInternal` in `apps/api/src/middleware/auth.ts`). Dashboard injects the key server-side in `src/middleware.ts` — never expose it client-side.
- **Module gating**: every command has a `category`; `interactionCreate` checks `GET /api/guilds/:id/modules/:category`. Missing modules default to **enabled**; guild registration creates rows for all modules in `MODULE_DEFINITIONS` (`packages/database/src/modules.ts`). Toggle via `PUT /api/guilds/:id/modules/:name {enabled}`.
- **Deploy limit**: Discord allows 100 commands/guild. `deployGuildCommands` sorts implemented commands before stub placeholders (detected via `'Command In Development'` in the execute source), so real commands always deploy first.
- **Response conventions**: command-facing endpoints return `{success, data}` or `{success, case}` — the bot's `ApiError` exposes `.response` for axios-style `error.response?.status` checks used by commands.
- **Discord work happens bot-side**: the API only persists state. Ticket channels, role assignments, reaction roles (via `guildMemberAdd`/`messageReaction*` events) and reminder delivery (via `services/reminder-poller.ts`, 30s poll of `/api/reminders/pending`) are all done by the bot.
- Most of the 192 commands are intentional "in development" stubs; the implemented set is moderation/economy/leveling/utility/setup/automod/tickets.

## Environment

- Root `.env` holds all secrets (gitignored): Discord creds, `DATABASE_URL` (Neon), `JWT_SECRET`, `NEXTAUTH_SECRET`, `INTERNAL_API_KEY`.
- Docker Compose env comes from `env_file: .env` so new vars propagate automatically.

## Gotchas discovered

- Live Neon DB can cold-start → first connect may fail P1001, retry works.
- `prisma migrate diff --from-schema-datasource <schema> --to-schema-datamodel <schema> --script` is how the last DB-drift migration was generated.
- `packages/permissions` compiles but is not wired into bot/api yet.
