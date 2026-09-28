# tdhls

Personal HLS player SPA: paste an `.m3u8` URL and watch in the browser. Static deploy only — no backend. Playback is not implemented yet; the repo currently holds the app shell, tooling, and docs.

## Rules

- Changing code (structure, TDD, tests, format/check, i18n): [docs/change-code-steps.md](docs/change-code-steps.md).
- Skills: [`.cursor/rules/skills-intro.mdc`](.cursor/rules/skills-intro.mdc).

## Read when

- Changing code → [docs/change-code-steps.md](docs/change-code-steps.md)
- Running scripts or a test layer → [docs/commands.md](docs/commands.md)
- Test placement and naming → [docs/testing.md](docs/testing.md)
- Adding or moving files → [docs/file-structure.md](docs/file-structure.md)
- Style, MUI, i18n → [docs/conventions.md](docs/conventions.md)
- Stack and versions → [docs/tech-stack.md](docs/tech-stack.md)

Install notes: `@mengtaoxin/oxc-config` comes from GitHub Packages. Set `NODE_AUTH_TOKEN` (PAT with `read:packages`) so `.npmrc` can fetch `@mengtaoxin/*`.
