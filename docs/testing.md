# Testing

| Layer    | Tool                         | Location                                  | Naming                                 |
| -------- | ---------------------------- | ----------------------------------------- | -------------------------------------- |
| Unit     | Vitest + RTL                 | `src/**/__tests__/*.{spec,test}.{ts,tsx}` | `*.spec.ts` / `*.spec.tsx` (preferred) |
| Coverage | Vitest `@vitest/coverage-v8` | `coverage/` (gitignored; HTML report)     | `npm run test:coverage`                |
| E2E      | Playwright                   | `e2e/`                                    | `*.spec.ts`                            |

Put a new unit spec next to the module under `__tests__/`. Use React Testing Library for components and hooks (`.spec.tsx` when JSX is needed). Components that render `Link` need a router: use `renderWithTestRouter` from `src/__tests__/renderWithProviders.tsx`.

`src/__tests__/setup.ts` clears `localStorage` and resets the locale to English before each test.

Route unit specs live under `src/routes/__tests__/`. The TanStack Router plugin ignores `*.spec.*` / `*.test.*` (`routeFileIgnorePattern` in `vite.config.ts`) so those files are not treated as routes.

HLS playback depends on Media Source Extensions, which happy-dom does not provide. Keep hls.js wiring behind a thin adapter so logic can be unit-tested with a fake, and cover real playback in e2e.

When to write and run tests: [change-code-steps.md](change-code-steps.md). Commands: [commands.md](commands.md).
