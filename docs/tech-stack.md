# Tech stack

tdhls is a React SPA (Vite) at the repo root — no separate `api/` or `web/` apps. Versions are the ranges in `package.json`.

## Frontend

| Area          | Choice                                          |
| ------------- | ----------------------------------------------- |
| Framework     | React 19                                        |
| Build         | Vite 8                                          |
| Language      | TypeScript 7                                    |
| Routing       | TanStack Router (file routes in `src/routes/`)  |
| State         | Zustand                                         |
| i18n          | react-i18next (en default, zh)                  |
| UI            | MUI 9 + Emotion + Material Icons                |
| HLS           | hls.js (installed; playback not wired up yet)   |
| Lint / format | oxlint + oxfmt (`@mengtaoxin/oxc-config`)       |
| Unit tests    | Vitest + Testing Library + happy-dom            |
| Coverage      | `@vitest/coverage-v8` (`npm run test:coverage`) |
| E2E           | Playwright                                      |
| PWA           | vite-plugin-pwa (manifest + app-shell SW)       |
| Node          | see `package.json` `engines`                    |

Prefer MUI components and theme/`sx`; use `src/styles/` for global tweaks. No Vue, Nuxt, or Tailwind.

## HLS

Plan: use hls.js (MSE) where `Hls.isSupported()`, and fall back to native `<video src>` playback on Safari / iOS where `video.canPlayType('application/vnd.apple.mpegurl')` is truthy. Streams are fetched directly from their origin, so they must send CORS headers.

## PWA

Production builds register a service worker (`registerType: 'autoUpdate'`) and inject a web app manifest (`standalone`, theme `#101820`, icon `/favicon.svg`). The worker precaches the app shell and falls back to `index.html` for client-side routes. It never caches playlists or media segments (`.m3u8`, `.ts`, `.m4s`, …). The dev server does not register the worker. Options live in `src/lib/pwa/pwaOptions.ts`.

## Deploy

`npm run build` outputs static files to `dist/`. `vercel.json` rewrites every path to `/index.html` so client-side routes work on reload.
