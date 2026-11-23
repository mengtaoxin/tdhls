# Deployment (Vercel + GitHub Actions)

Production will be published from **GitHub Actions** using the Vercel CLI. The app is a **static Vite SPA**; there are no Vercel Functions or server runtime.

| Setting        | Value                                              |
| -------------- | -------------------------------------------------- |
| Framework      | Vite                                               |
| Install        | `npm ci` (Node **24.x**, see `engines`)            |
| Build          | `npm run build` → `dist/`                          |
| Hosting        | Static files + existing `vercel.json` SPA rewrites |
| Production URL | `https://tdhls.smt.sh`                             |
| Vercel project | `tdhls` (team-linked; IDs via secrets)             |

Repo config: [`vercel.json`](../vercel.json) (Vite build/output paths and client-side routing rewrites). Workflow: [`.github/workflows/vercel-production.yml`](../.github/workflows/vercel-production.yml) (`push` to `main`, `workflow_dispatch`).

## Git auto-deploy → Actions (transition)

While Vercel remains **Git-connected**, a push to `main` can trigger **both** Vercel’s Git integration **and** this workflow until you turn off automatic Git deployments in the Vercel project settings. That overlap is expected during migration: keep Git deploys enabled until at least one successful Actions production run, then disable **Production Branch** / automatic Git deployments in the Vercel UI. This PR does **not** change that Vercel setting.

## GitHub secrets

Add these in the repository **Settings → Secrets and variables → Actions** (never commit values).

| Secret              | Purpose                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel token with deploy access for the linked team/project                                             |
| `VERCEL_ORG_ID`     | Team ID (`team_…`) for the Vercel team that owns project **tdhls**                                      |
| `VERCEL_PROJECT_ID` | Project ID (`prj_…`) for **tdhls**                                                                      |
| `NODE_AUTH_TOKEN`   | GitHub PAT with `read:packages` for `@mengtaoxin/*` on GitHub Packages during `vercel build` / `npm ci` |

`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` can be copied from `.vercel/project.json` after `npx vercel link` locally (folder is gitignored).

## One-time checks (outside this repo)

1. Vercel project **tdhls**: framework **Vite**, root `.`, build `npm run build`, output `dist/`.
2. Production custom domain **tdhls.smt.sh** attached on the project (DNS already configured).
3. After Actions is validated: disable automatic Git production deploys in Vercel so only this workflow publishes.

## Workflow behavior

Each run: checkout → `vercel pull` (production) → `vercel build --prod` → `vercel deploy --prebuilt --prod`. Concurrency group `vercel-production` does **not** cancel an in-flight production deploy.

The workflow does **not** run on pull requests, so Vercel production secrets are not exposed to untrusted forks or PRs.
