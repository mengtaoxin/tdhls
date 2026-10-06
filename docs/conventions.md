# Conventions

- Match nearby file style; keep React components (`.tsx`) and TypeScript consistent with existing `src/` code. 2-space indent.
- **i18n:** Add, rename, or remove UI strings in both `src/locales/en.ts` and `src/locales/zh.ts` (`zh.ts` uses `satisfies typeof en`, so a missing key fails type-check). Default locale is English.
- **Styling:** Prefer MUI `sx`, theme palette, and layout tokens from `src/theme/muiTheme.ts` over raw values in UI code. Put recurring layout sizes in `theme.layout`; put brand colors in `palette`. Global chrome may use CSS variables from `src/styles/app.css`. Do not introduce Tailwind, Vue, or another UI library (see [tech-stack.md](tech-stack.md)).
- **Player logic:** Keep hls.js setup, stream URL validation, and similar logic in `src/lib/`; components stay UI + wiring.
- **localStorage keys:** prefix with `tdhls.` and go through `src/lib/clientStorage.ts`. Current keys: `tdhls.locale`, `tdhls.liveDelay`, `tdhls.muted`, `tdhls.streamHistory` (JSON array of the last 10 played URLs, newest first), `tdhls.urlFunction` (source text of the custom URL function, see `src/lib/hls/urlFunction.ts`).
- **Watch route:** pass the stream URL as router history state (`navigate({ to: '/watch', state: { streamUrl } })`), never as a query param, so it stays out of the address bar.
- **Finish a change:** [change-code-steps.md](change-code-steps.md).
- Do not commit `dist/`, `node_modules/`, or secrets.
