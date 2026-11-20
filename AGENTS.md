# AGENTS.md

Guidance for AI agents working in this repo. People should read [README.md](README.md) first.

## Stack

- TypeScript ^5.2 (strict config in `tsconfig.json`), Vite ^5, Three.js ^0.160, React ^19 listed as a dependency but not used by the game code **(inference)**.
- Needs a current Node.js LTS and npm. Lockfile: `package-lock.json`.

## Layout

- `src/main.ts`: loading screen, starts the game.
- `src/game/`: `Game.ts`, `config.ts`, `types.ts`.
- `src/core/`, `src/terrain/`, `src/environment/`, `src/entities/`, `src/controls/`, `src/effects/`: engine pieces.
- `src/index.ts`, `src/counter.ts`, `src/hooks/`, `src/utils/TerrainGenerator.ts`: probable leftovers or duplicates; check before relying on them.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (runs `tsc` then `vite build`)
- Tests: none exist.
- None of these were run when this file was written, so they are not known to work on today's toolchain.

## Rules

- Add or update tests with every change. (No test setup exists yet; see `docs/STATUS.md`.)
- Never commit secrets. Env var names only; values stay in `.env.local` or the host's settings.
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Keep `docs/STATUS.md` current when behaviour or tooling changes.

## What agents may and may not do

- May: fix bugs, improve docs, add tests, open pull requests.
- May not, without Steven: archive or delete the repo, publish or deploy, rewrite git history, change visibility, rotate or touch real credentials, or merge their own pull requests.
