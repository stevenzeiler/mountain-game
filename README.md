# mountain-game

A small Three.js prototype: walk, jump and sprint through a generated mountain landscape with trees, a road, a river, a bridge and a bus. The package is named `andorra-game`, and the in-game title screen says "Andorora Mountain Explorer".

**Status:** dormant since 2025-02. Two commits on one afternoon (2025-02-27). It is an experiment, not a finished game. The steps below come from `package.json` and the source; they were not run for this README.

## Install

You need Node.js and npm.

```sh
npm install
```

## Usage

```sh
npm run dev       # start the Vite dev server
npm run build     # type-check with tsc, then build with Vite
npm run preview   # serve the production build
```

Open the URL Vite prints. A title screen lists the controls:

| Key | Action |
|---|---|
| W / A / S / D | Move |
| Space | Jump |
| Left Shift | Sprint |
| Mouse | Look around |
| Left / right arrows | Turn |

## Config

No environment variables. Tuning values (world size, chunk size, player speed, tree count, force field look) live in `src/game/config.ts`.

## How it works

- Vite + TypeScript, with Three.js 0.160 for rendering.
- `src/main.ts` shows the loading screen, then starts `Game` from `src/game/Game.ts`.
- `src/core` holds the renderer, scene and camera. `src/terrain` builds terrain in chunks. `src/environment` holds trees, road, river, bridge and bus. `src/entities/Player.ts` and `src/controls/Controls.ts` handle the player and keyboard input. `src/effects/ForceField.ts` draws a force field at the world edge.
- `src/index.ts` and `src/counter.ts` look like leftovers from the Vite starter and a first draft **(inference)**.

## Status

See [docs/STATUS.md](docs/STATUS.md). No license is declared, so all rights are reserved by default; that is Steven's decision to change.
