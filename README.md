# tdhls

A browser HLS player: paste an `.m3u8` URL and watch. No backend — a static SPA built with React, MUI, and hls.js. UI is English / 中文.

Plays VOD and live streams. Live playback stays a chosen delay (10s / 30s / 60s in Settings, default 60s) behind the live edge so the player always has a buffer. Pausing a live stream resumes where it stopped. Streams must be served with CORS headers.

## Requirements

- Node.js `^22.18.0` or `^24.12.0` (see `package.json` `engines`)
- `NODE_AUTH_TOKEN` with `read:packages` to install `@mengtaoxin/oxc-config` from GitHub Packages

## Quick start

```sh
npm install
npx playwright install chromium firefox webkit
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Stop with Ctrl+C.

| Command                                             | Purpose                                       |
| --------------------------------------------------- | --------------------------------------------- |
| `npm run dev`                                       | Start the Vite dev server                     |
| `npm run build`                                     | Type-check + production build                 |
| `npm run fmt && npm run lint && npm run type-check` | Format + lint + type-check (**writes files**) |
| `npm run test:unit` / `test:e2e`                    | Unit (Vitest) / e2e (Playwright)              |

More: [docs/commands.md](docs/commands.md) · Stack: [docs/tech-stack.md](docs/tech-stack.md) · Layout: [docs/file-structure.md](docs/file-structure.md)

## License

[MIT](LICENSE)
