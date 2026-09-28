# Change code steps

Ordered workflow for every code change. Domain details stay in the linked docs — do not copy them here.

| Need                   | Doc                                    |
| ---------------------- | -------------------------------------- |
| Commands               | [commands.md](commands.md)             |
| Test layers and naming | [testing.md](testing.md)               |
| Where files go         | [file-structure.md](file-structure.md) |
| Style, i18n, MUI       | [conventions.md](conventions.md)       |

## 1. Inspect structure

Before writing or moving files, match [file-structure.md](file-structure.md): put new code in the matching folder, colocate unit specs under `__tests__/`, and use `@/` imports.

## 2. TDD (behavior changes)

Follow the `test-driven-development` skill:

1. State the observable behavior in one sentence.
2. **Red** — add or extend a test at the lowest layer that locks it. Run it; it must fail for the missing behavior.
3. **Green** — change production code only enough to pass.
4. **Refactor** — clean up with tests still green.

No new test required for docs, comments, formatting, or mechanical moves (still run the full unit suite for moves).

## 3. Cross-cutting while implementing

- **i18n:** update both `src/locales/en.ts` and `src/locales/zh.ts`.
- **Docs:** update the matching `docs/` file when a documented contract or workflow changes.

## 4. Tests

Run the focused spec during Red/Green. Before finishing a behavior change, run the full unit suite (`npm run test:unit -- --run`). Add or run e2e only for user-visible integration smoke.

## 5. Format and check

1. Write: `npm run fmt && npm run lint && npm run type-check`.
2. Confirm check-only is clean (`npm run fmt:check && npm run lint && npm run type-check`).

## Done when

- Structure matches [file-structure.md](file-structure.md).
- Behavior changes went through Red → Green.
- Full unit suite is green; format / lint / type-check check-only is clean.
- i18n and docs are updated when they apply.
