# Brain Hive: backlog draft for Jira

_Approved by the PO on 2026-11-25 (order included). Claude loads these into Jira once the Atlassian connector is authorized; after that, Jira is the source of truth and this file is a record._

> **Loaded into Jira on 2026-11-26.** Jira is now the source of truth. Jira's sample items took GP-1 to GP-4, so **every story key below is 4 lower than its Jira key: backlog GP-N = Jira GP-(N+4)** (GP-1 → GP-5, …, GP-29 → GP-33). Epics 1–8 are Jira GP-34 to GP-41. Use the Jira key in branches, commits and PRs.

**Proposed Jira setup:** one project, key **GP** (matches the branch and commit examples in WORKFLOW.md), **Kanban** board with columns **Backlog → Ready → In Progress → In Review → Done**. The night shift only takes stories from **Ready**, so that column is how you choose what gets built.

**Labels:** `backend` / `frontend` (which repo), `po-action` (needs you: accounts, keys, settings), `security`.
**Priority:** Highest / High / Medium / Low. **Size:** S (< 2 h agent work), M (half a day), L (split it).

Order below = suggested priority. ⛔ = blocked on a PO action.

---

## Epic 1: Security hardening (before any deploy)

Found while reviewing the API for this backlog. Not exploitable today because nothing is deployed, but the repos are public, so these are visible.

**GP-1 · Protect API routes that need a signed-in user** · `backend` `security` · Highest · M
As a user, I want my data reachable only when I'm signed in, so strangers can't read or change it.
- An `requireAuth` middleware returns **401** JSON when there's no session user
- Applied to every route that uses `req.user` (`/courses/enroll`, `/profileCourses`, `/recommended`, `/badges`, `/addBadge`, `/todoToggled`, `/user/addFriend`, `/getFriends`, `/profile`) and to all `/todos` routes
- Signed-out requests to those routes get 401, not a 500 crash
- Supertest tests cover signed-in and signed-out for each route

**GP-2 · Lock down user profile updates** · `backend` `security` · Highest · S
As a user, I want only myself to be able to edit my profile.
- `PUT /user/update/:id` returns **403** unless `:id` is the signed-in user
- Only an allow-list of fields can change (e.g. name, learning style, field). Password, email, badge points, friends and enrolments cannot be set this way
- Request bodies with Mongo operators (`$set`, `$where`, …) are rejected
- Tests for: own update OK, other user's id → 403, forbidden field ignored or rejected

**GP-3 · Make to-dos private to their owner** · `backend` `security` · Highest · S
As a user, I want to see and change only my own to-dos.
- `GET /todos` returns only the signed-in user's to-dos
- `createdBy` is set from the session, never from the request body
- Toggle, edit and delete on another user's to-do → **404**
- Missing to-do id → 404 instead of a crash
- Tests for each case

**GP-4 · Stop exposing sensitive data in responses and logs** · `backend` `security` · High · S
- `/user/profile` and every user response omit the password hash and other internal fields
- Remove `console.log` of user objects (`routes/user.js`, `routes/courses.js`)
- `GOOGLE_API_KEY` is no longer returned in the single-course response (known issue); if the browser needs it, the frontend reads its own restricted key
- Tests assert the password hash is never in a response

**GP-5 · Rotate leaked keys** ⛔ · `po-action` `security` · Highest
Exact steps from Claude; you do them.
- Contentful access and management tokens regenerated, old ones revoked
- Google API key rotated and restricted by HTTP referrer
- `BRAINHIVE_ACCESS_TOKEN` revoked and removed from `.env`
- New values in `~/Documents/Brain-hive-backend/.env` only

---

## Epic 2: Local environment working end to end

**GP-6 · New Atlas database** ⛔ · `po-action` · Highest
- Atlas project `gp`, free M0 cluster outside Bahrain, user `gp-app`, your IP allowed
- `CONNECTION_STRING` and `SESSION_SECRET` in `~/Documents/Brain-hive-backend/.env`

**GP-7 · Verify the backend against the new database** · `backend` · High · S · depends on GP-6
- Claude checks the cluster via the Atlas connector
- Server starts from `Brain-hive-backend`, and sign-up creates a user document
- Findings recorded in the project plan

**GP-8 · Run the frontend locally against the API** · `frontend` · High · S · depends on GP-7
- `npm install && npm start` works on Node 22
- Sign-up, sign-in, course list, open a course, to-do list checked in the browser
- Any breakages filed as bug stories

---

## Epic 3: Tests (the safety net for unattended work)

**GP-9 · API test setup** · `backend` · High · S
- Jest + Supertest + in-memory MongoDB (`mongodb-memory-server`); `npm test` runs them
- The app is exportable without calling `listen()` (split `app.js` from the server start)
- Contentful is mocked; the tests need no `.env`

**GP-10 · API tests: user and auth** · `backend` · High · M · depends on GP-9
- Sign-up (valid, duplicate email, invalid input), sign-in (right and wrong password), logout, profile

**GP-11 · API tests: courses and to-dos** · `backend` · High · M · depends on GP-9
- Every `/courses` and `/todos` route: happy path plus signed-out and not-found cases

**GP-12 · End-to-end tests for the main journeys** · `frontend` · Medium · M · depends on GP-8, GP-15
- Playwright: sign up → sign in → open a course → add, complete and delete a to-do
- Runs against a local backend with a test database

---

## Epic 4: Frontend modernisation

**GP-13 · Move from Create React App to Vite** · `frontend` · High · M
- `npm run dev`, `npm run build` and `npm run preview` work; `react-scripts` removed
- `REACT_APP_*` variables renamed to `VITE_*` and documented
- Every existing route still renders, checked in the browser

**GP-14 · Configurable API URL** · `frontend` · High · S · best after GP-13
- `http://localhost:3030` (hard-coded in `API.js` in 3 places) replaced by one `VITE_API_URL`
- `.env.example` added to the frontend repo

---

## Epic 5: Deployment-ready configuration

**GP-15 · Configurable CORS and production cookies** · `backend` · High · S
- CORS origin from `CLIENT_ORIGIN` (comma-separated list allowed)
- In production: `secure`, `httpOnly`, `sameSite` cookie settings and `trust proxy`

**GP-16 · Production session store** · `backend` · High · S
- `express-session` uses `connect-mongo` instead of the in-memory store
- Sessions survive a server restart (tested)

**GP-17 · Health check endpoint** · `backend` · Medium · S
- `GET /health` returns 200 with the app version and the database connection state (for the hosting platform)

---

## Epic 6: Docker and CI

**GP-18 · Backend Dockerfile and docker-compose** · `backend` · Medium · M
- Multi-stage image running as a non-root user; `docker compose up` starts the API and a local MongoDB

**GP-19 · Frontend Dockerfile** · `frontend` · Low · S
- Static build served by a small web server (optional if the frontend deploys to Vercel/Netlify)

**GP-20 · CI on every PR (backend)** · `backend` · High · S · depends on GP-9
- A GitHub Actions workflow runs lint, test and build on PRs into `dev`, `staging` and `main`
- Passes on a fresh clone with no `.env`

**GP-21 · CI on every PR (frontend)** · `frontend` · High · S · depends on GP-13
- Same as GP-20 for the frontend: lint, unit tests, build

**GP-22 · Branch protection on GitHub** ⛔ · `po-action` · High
- In both repos, `main`, `staging` and `dev` require a PR plus passing CI and block force pushes and deletion (Claude gives the exact settings)

---

## Epic 7: Deploy staging and production

**GP-23 · Hosting accounts and projects** ⛔ · `po-action` · Medium
- Render (or Railway) for the API, Vercel (or Netlify) for the frontend. You create the accounts and connect the repos; Claude writes the steps

**GP-24 · Staging environment from the `staging` branch** · `backend` `frontend` · Medium · M · depends on GP-15, GP-16, GP-23
- Merging into `staging` deploys both apps to a staging URL, with its own Atlas database
- Atlas network access allows the host's IPs (PO action)

**GP-25 · Production from `main`** · `backend` `frontend` · Medium · M · depends on GP-24
- Merging into `main` deploys production; a rollback is documented

**GP-26 · Error tracking with Sentry** · `backend` `frontend` · Low · S · depends on GP-23
- Errors from both apps reach Sentry, tagged by environment; no personal data sent

---

## Epic 8: AI team operations

**GP-27 · Connect Jira and GitHub** ⛔ · `po-action` · Highest · first
- Jira site created, Atlassian connector authorized, "GitHub for Jira" app installed on both repos

**GP-28 · Night-shift routine** · High · M · depends on GP-20, GP-27
- A scheduled cloud agent picks up to 2 **Ready** stories, follows WORKFLOW.md, opens PRs into `dev`, and moves the Jira issues to In Review
- Morning summary: PRs opened, what's blocked, decisions needed
- One supervised daytime trial run before the first night

**GP-29 · README for both repos** · Low · S
- Setup, env vars, scripts, branch model and deploy steps, reusable for other projects

---

### Suggested first "Ready" batch (no PO blockers, safe for the first night)

GP-9 (test setup) → GP-1, GP-2, GP-3 (security fixes, each with tests) → GP-20 (backend CI).
All backend, none needs the real database or secrets, and each is small enough to review in one sitting.
