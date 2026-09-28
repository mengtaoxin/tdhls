# File structure

Repository layout for tdhls. Changing code: [change-code-steps.md](change-code-steps.md). Library versions: [tech-stack.md](tech-stack.md). Agent entry: `AGENTS.md`.

```
.
├── AGENTS.md
├── .agents/skills/               Installed agent skills (pinned in skills-lock.json)
├── .cursor/rules/                Shared Cursor rules (path-scoped)
├── docs/                         Project docs (this file, commands, conventions, …)
├── e2e/                          Playwright specs
├── public/                       Static assets (favicon / PWA icon)
├── src/
│   ├── __tests__/                Vitest setup, render helpers, app-level specs only
│   ├── components/               Shared UI (.tsx) + colocated __tests__/
│   ├── hooks/                    React hooks (use*) + colocated __tests__/
│   ├── i18n/                     react-i18next bootstrap
│   ├── lib/                      Framework-agnostic helpers + colocated __tests__/
│   │   ├── hls/                  Player adapter, hls.js config, URL + prefs helpers
│   │   └── pwa/                  web app manifest + service worker options
│   ├── locales/                  i18n message modules (en, zh)
│   ├── routes/                   TanStack Router file routes (routeTree.gen.ts is generated)
│   ├── stores/                   Zustand stores
│   ├── styles/                   Global app CSS
│   ├── theme/                    MUI theme
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

## Placement rules

- Imports use `@/`.
- Route files → `src/routes/` (thin: `createFileRoute` + page component). Shared UI and page components → `src/components/`. React hooks (`use*`) → `src/hooks/`.
- Framework-agnostic helpers → `src/lib/`. Group by domain once a domain has more than one file (e.g. `src/lib/hls/` for player logic, `src/lib/pwa/`).
- Locale strings → `src/locales/`; i18n bootstrap → `src/i18n/`.
- Unit tests colocate next to the module: `src/{hooks,lib,routes,components,stores}/**/__tests__/*.spec.{ts,tsx}`. `src/__tests__/` is only for setup, shared render helpers, and app-level specs (see [testing.md](testing.md)).
