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
| HLS           | hls.js (MSE) with native HLS fallback           |
| Lint / format | oxlint + oxfmt (`@mengtaoxin/oxc-config`)       |
| Unit tests    | Vitest + Testing Library + happy-dom            |
| Coverage      | `@vitest/coverage-v8` (`npm run test:coverage`) |
| E2E           | Playwright                                      |
| PWA           | vite-plugin-pwa (manifest + app-shell SW)       |
| Node          | see `package.json` `engines`                    |

Prefer MUI components and theme/`sx`; use `src/styles/` for global tweaks. No Vue, Nuxt, or Tailwind.

## HLS

`/watch` plays the stream URL passed in router history state (not the query), so it survives a reload but a bare `/watch` link shows an invalid-URL error. `src/lib/hls/player.ts` (`attachStream`) uses hls.js (MSE) where `Hls.isSupported()`. It falls back to native `<video src>` on Safari / iOS where `video.canPlayType('application/vnd.apple.mpegurl')` is truthy, and otherwise reports "unsupported". Streams are fetched directly from their origin, so they must send CORS headers.

**Live delay and buffer.** The user picks a delay of 10, 30, or 60 seconds in the header settings menu (`SettingsMenu`; default 60, stored as `tdhls.liveDelay`). The player page has no delay picker. `src/lib/hls/hlsConfig.ts` maps it to hls.js settings:

| Setting                   | Value                | Why                                                    |
| ------------------------- | -------------------- | ------------------------------------------------------ |
| `liveSyncDuration`        | delay                | Start (and "Back to live") this far behind the edge    |
| `liveMaxLatencyDuration`  | 24h                  | Never auto-jump forward while paused inside the window |
| `maxLiveSyncPlaybackRate` | 1                    | Never speed up to catch up                             |
| `maxBufferLength`         | `max(30, delay)`     | Forward buffer for VOD                                 |
| `maxMaxBufferLength`      | `max(60, 2 * delay)` | Upper bound for the VOD forward buffer                 |

Once hls.js reports a live playlist, the player raises `maxBufferLength` and `maxMaxBufferLength` to 30 minutes (`LIVE_BUFFER_CONFIG`). While playing this only buffers up to the live edge. While paused, it keeps downloading every new segment before it slides out of the playlist window. If the browser's buffer quota runs out, hls.js lowers `maxMaxBufferLength` itself.

On native HLS, the player seeks to `seekable.end - delay` (clamped to `seekable.start`) on `loadedmetadata` when `duration` is `Infinity`. If the playlist window is shorter than the delay, playback starts at the oldest available segment. The effective delay is then the window length, and this is not an error. Changing the delay re-attaches the player.

**Pause on live.** Pausing keeps the playhead, so resuming continues from the same spot with a larger delay, even after that spot has slid out of the playlist window, as long as it is still buffered. Only when the paused position is neither in the window (`currentTime < seekable.start`) nor buffered does the player seek to the delayed live point on `play`. The control bar shows "Back to live" once latency exceeds the delay by more than 10 seconds.

**Controls.** The `<video>` has no native controls. `PlayerControls` gives play/pause, mute, volume (stored as `tdhls.volume` / `tdhls.muted`), a seek bar for VOD, the live badge with latency, and fullscreen. With the player focused, Space toggles play and M toggles mute. In fullscreen the controls overlay the video and hide (with the cursor) after 10 seconds without activity; moving the pointer, clicking, or pressing a key on the player shows them again and restarts the timer. If the browser blocks autoplay, the video stays paused until the user presses play.

## PWA

Production builds register a service worker (`registerType: 'autoUpdate'`) and inject a web app manifest (`standalone`, theme `#101820`, icon `/favicon.svg`). The worker precaches the app shell and falls back to `index.html` for client-side routes. It never caches playlists or media segments (`.m3u8`, `.ts`, `.m4s`, …). The dev server does not register the worker. Options live in `src/lib/pwa/pwaOptions.ts`.

## Deploy

`npm run build` outputs static files to `dist/`. `vercel.json` rewrites every path to `/index.html` so client-side routes work on reload.
