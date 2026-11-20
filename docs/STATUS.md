# Status

Last updated: 2026-11-20 (docs baseline pass).

## What works

- Nothing has been run in this pass. From the code: a Vite + Three.js scene with chunked terrain, trees, road, river, bridge, bus, player controls and a force field.

## What's broken or unknown

- Unknown whether `npm install`, `npm run build` or `npm run dev` succeed today.
- Possible dead code: `src/index.ts`, `src/counter.ts`, `src/hooks/useKeyboardControls.ts`, and two files named `TerrainGenerator.ts` (in `src/terrain` and `src/utils`).
- The title screen spells the name "Andorora".
- No tests, no CI.

## What's next

- Run it once and record whether it builds.
- Decide whether to keep it as a small showcase (add a screenshot) or archive it. Archiving is Steven's call.

## Not yet from the standard

- LICENSE (public repo, none declared: Steven's decision)
- CONTRIBUTING.md, SECURITY.md
- .editorconfig
- .github issue and PR templates
- Dependabot config
- ci.yml with gitleaks
- CloudEvents catalog
- Product ONE-PAGER
- Tests
