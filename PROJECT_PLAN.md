# Brain Hive — Project Plan & Status

_Last updated: 2026-11-26 (backlog loaded into Jira)_

## Roles

- **Product Owner (PO):** Yasmin. Sets priorities, accepts or rejects work, and handles anything that needs her accounts (passwords, keys, billing, merging PRs).
- **Full-stack developer:** Claude. Plans and builds features, writes tests, sets up CI/CD and deployment, opens PRs, and reports progress in plain language.

## Goal

Finish the Brain Hive (gp) graduation project and get it deployed as a production-quality full-stack app. That means safe secrets, automated tests, a CI pipeline, a containerized setup, and a live deployment. The same setup should be reusable for the PO's other full-stack projects.

## The product (as found in the code)

A learning platform where students take courses in formats that match their learning style:
- Courses from Contentful (video, audio, PDF), with quizzes, notes and a Pomodoro timer
- To-do list, achievements and badge points, friends and a leaderboard
- Sign-in with email/password or Google (Passport)

## Tech stack

| Part | Tech |
|---|---|
| Frontend ([`Brain-hive-frontend`](https://github.com/Yasmin-Haitham/Brain-hive-frontend)) | React 18 on Create React App (`react-scripts`), Bootstrap/Reactstrap, Formik + Yup, Axios, React Router 6 |
| Backend ([`Brain-hive-backend`](https://github.com/Yasmin-Haitham/Brain-hive-backend), this repo) | Node + Express 4, Mongoose 7, Passport (local + Google OAuth), express-session, Contentful SDK |
| Database | MongoDB Atlas |
| Content | Contentful (course content) |
| Repos | `Brain-hive-backend` and `Brain-hive-frontend` (public), cloned at `~/Documents/`. Split from `Yasmin-Haitham/gp` (fork of `usefhanii/gp`), which is to be archived |

## Done

- [x] GitHub CLI (`gh`) and `git` installed and signed in as `Yasmin-Haitham`
- [x] Node.js 22 and npm 9 installed; server dependencies installed (`server/node_modules`, not committed)
- [x] **Secrets cleanup: [PR #1](https://github.com/Yasmin-Haitham/gp/pull/1), merged** (branch `chore/remove-committed-secrets`)
  - Stopped tracking `server/.env` and `node_modules`; added a root `.gitignore`
  - Added `server/.env.example` listing all required variables
  - Session/cookie secret now read from `SESSION_SECRET` (the server refuses to start in production without it)
  - Stopped logging the Google API key
  - Tested: the server starts locally, and the production guard works
- [x] MongoDB Atlas connector connected in Claude; AI/MCP access enabled on the Atlas org
- [x] Old Atlas cluster (`Project 0` / `Cluster0`, AWS Bahrain) secured: the leaked `admin` password changed and network access limited to the PO's IP. That cluster is paused and couldn't be resumed (Atlas modifications unavailable in `ME_SOUTH_1`). It only holds test data.

## AI team setup (before continuing the roadmap)

How the agent team works is described in [WORKFLOW.md](WORKFLOW.md).

- [x] **Split into two repos** (2026-11-25): `server/` → `Brain-hive-backend`, `client/` → `Brain-hive-frontend`, history kept with `.env` stripped from every commit and a secret scan run before publishing. Each has `main`, `staging`, `dev`.
- [ ] **Agents and branch guard:** six role agents in `.claude/agents/`, the `protect-branches` hook (blocks direct changes to `main`/`staging`/`dev` and unprefixed branches; tested), and `.env` read/edit denied to agents. PR `chore/ai-agent-team` → `dev` in both repos; also adds `.env` to `.gitignore` (the old root `.gitignore` didn't come along in the split).
- [ ] **Archive the old `gp` repo (PO):** GitHub → `gp` → Settings → Danger Zone → Archive this repository, once these PRs are merged.
- [ ] **Branch protection (PO, optional but recommended):** now available because the repos are public. Protect `main`, `staging` and `dev`: require a PR, block force pushes and deletion.
- [x] **Backlog drafted and approved:** [docs/backlog.md](docs/backlog.md): 29 stories in 8 epics, security fixes first. Found while drafting: unauthenticated profile updates, to-dos visible and editable across users, and routes crashing for signed-out users (Jira GP-5 to GP-7).
- [x] **Backlog loaded into Jira** (2026-11-26): [Brain Hive board](https://jassy6700.atlassian.net/jira/software/projects/GP/boards/1), project `GP` (team-managed). 29 stories (GP-5 to GP-33) with acceptance criteria, labels and priorities, under 8 epics (GP-34 to GP-41), with 15 "blocks" links and 1 "relates" link (GP-18 is best done after GP-17). **Jira is now the source of truth; `docs/backlog.md` is a record.**
  - **Keys are offset by 4:** Jira's sample items took GP-1 to GP-4, so backlog GP-N = Jira GP-(N+4). The mapping is at the top of [docs/backlog.md](docs/backlog.md). Always use the Jira key in branches, commits and PRs.
  - `In Review` already exists as a status.
- [ ] **Ready column and first batch (PO, needs Jira sign-in):** add a `Ready` column between To Do and In Progress (board → ⋯ → Configure board → Columns), then move the first batch to Ready: **GP-13** (API test setup), **GP-5, GP-6, GP-7** (security fixes), **GP-24** (backend CI). These are backlog GP-9, GP-1, GP-2, GP-3, GP-20. Claude can do the moves through the connector once the column exists.
- [ ] **Clean up Jira's sample items (PO):** delete GP-1 "Task 1", GP-2 "Task 2", GP-3 "Task 3" and subtask GP-4. They aren't part of the backlog.
- [ ] **Install "GitHub for Jira"** on both repos (PO, tracked as GP-31).
- [ ] **Overnight runs:** a scheduled cloud agent that takes Ready stories, opens PRs and posts a morning summary. Start with 1–2 stories a night, after one supervised daytime trial run.

## In progress (PO action)

- [ ] **New Atlas database:** new project `gp`, a free M0 cluster outside Bahrain (e.g. Frankfurt), user `gp-app`, PO's IP allowed
- [ ] Put the new `CONNECTION_STRING` and a `SESSION_SECRET` in `~/Documents/Brain-hive-backend/.env` (copy the other values from the old `~/Documents/gp/server/.env`; the PO edits this file; never paste secrets in chat)

## Next steps (in order)

1. **Verify the database:** check the new cluster via the Atlas connector, start the server, and confirm sign-up writes data. The new database starts empty, which is fine: users, to-dos and achievements are created during use, and courses sync from Contentful.
2. **Rotate the remaining leaked keys (PO):** Contentful access and management tokens, the Google API key (restrict it by HTTP referrer, since it's sent to the browser), and revoke the unused `BRAINHIVE_ACCESS_TOKEN`.
3. ~~**Merge PR #1** (PO)~~ Done. Each task below gets a branch from `dev` in the repo it belongs to.
4. **Install and run the frontend** (`Brain-hive-frontend`) and check that the app works end to end locally.
5. **Move the frontend from Create React App to Vite.** CRA is no longer maintained.
6. **Tests:** Jest + Supertest for the API routes (`user`, `courses`, `todo`), and Playwright end-to-end tests for the main journeys (sign-up/sign-in, open a course, to-do list).
7. **Config for deployment:** move hard-coded values to env vars (CORS origin `http://localhost:3000` in the backend's `index.js`, the API URL in the frontend); add secure cookie settings for production.
8. **Docker:** a Dockerfile each for client and server, plus `docker-compose.yml` for local dev (with a local MongoDB).
9. **CI (GitHub Actions):** lint, test and build on every PR.
10. **Deploy:** frontend on Vercel or Netlify, backend on Render or Railway, database on Atlas (add the host's IPs to Atlas network access). Add Sentry for error tracking.
11. **Docs:** a README with setup, env vars and deploy steps, reusable for other projects.

## Known issues / tech debt

- **Security (fix before deploying):** `PUT /user/update/:id` has no auth and accepts any field; `/todos` returns and modifies every user's to-dos; routes using `req.user` crash when signed out. Tracked as Jira GP-5 to GP-8 (epic GP-34).

- Old secrets are still in git history (here and in upstream `usefhanii/gp`). Rotating them (step 2) is the fix; we decided not to rewrite history.
- `GOOGLE_API_KEY` is returned to the browser in the single-course API response.
- `express-session` uses the default in-memory store, which isn't suitable for production; switch to `connect-mongo`.
- The CORS origin is hard-coded to `http://localhost:3000`.
- No tests exist yet; the server's `npm test` is a placeholder.
- The commit history before the split still contains old secrets in `Yasmin-Haitham/gp` and upstream `usefhanii/gp`; the new repos don't. Key rotation (step 2) is still required.
- ~~Root `package.json` with only `viewerjs`~~: left behind in the old repo by the split.

## Ground rules

- **Workflow:** one branch and one PR per task. Claude opens the PR and the PO reviews and merges. Claude never merges or force-pushes.
- **Secrets:** never commit them or paste them in chat. `.env` is edited by the PO only, and `.env.example` documents the variables.
- **Accounts:** account sign-ups, passwords, key rotation, billing and enabling access settings are PO actions. Claude gives exact steps.
- **Before starting a task:** Claude states the plan and how "done" will be checked. After the task: what changed, what was tested, and what wasn't.
- **Coding style:** small, focused changes (karpathy-guidelines skill); no unrequested refactors.

## Tools available to Claude

- `gh` CLI signed in to GitHub (repos, PRs, issues)
- Atlassian (Jira) connector for site `jassy6700.atlassian.net`: create, edit, link and transition issues. It can't change board columns; that's done in the Jira UI. The connector uses Atlassian's deprecated V1 endpoint (removed 2027-03-01): reconnect it from Claude's connector directory before then.
- MongoDB Atlas connector (read and write granted; a new chat is needed to load the write tools)
- Skills: `karpathy-guidelines`, the engineering plugin (`code-review`, `testing-strategy`, `deploy-checklist`, `system-design`, `debug`, `documentation`), `/security-review`, `/code-review`, `/run`
- Skills worth adding from mcpmarket: Docker Patterns, Deployment Patterns, E2E Testing Patterns (Playwright), Coding Standards (TypeScript/React/Node), Vite Patterns. Prefer original sources over the copies on that site, and read each skill before installing.
