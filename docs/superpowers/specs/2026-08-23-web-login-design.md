# Web Login UX for the Keira3 Web/Docker Port — Design

**Date:** 2026-08-23
**Status:** Approved design, pending implementation plan

## Problem

The web/docker deployment serves the desktop app's connection window: a full
MySQL credential form (host/port/user/password/database, SSL/SSH) prefilled
with `127.0.0.1`/`root`/`root`, localStorage "recent configs", and a
remember-me auto-connect. In web mode this form is theater — the Node API
server (`docker/api/database-api.js`) builds its connection pool from
environment variables at startup and `/api/database/connect` merely pings that
pool, ignoring the submitted credentials. Worse, the API is unauthenticated:
anyone who can reach the container can query the database through it.

## Goal

Replace the prefilled app-style connection window with a real web login:

- A single app-level account, credentials set in the compose file via
  environment variables. No user database, no user management.
- After login, the user lands directly in the editor. The MySQL connection
  form never appears in web mode; database config lives server-side in env,
  where it already effectively is.
- The `/api/database/*` surface is actually protected.
- The Electron desktop build keeps today's connection window untouched;
  upstream divergence is confined to new files plus a few lines in
  `app.component`.

## Approach (chosen)

Server-checked session with a signed HttpOnly cookie (approach A). The
existing Node API server gains `/api/auth/*` endpoints and a guard middleware;
the Angular app gains a login window, a `connectWeb()` path, and a 401
interceptor. Rejected alternatives: bearer token in localStorage (XSS-readable,
saves little), nginx basic auth (browser popup UX, no logout, protects only
proxied paths).

## Design

### 1. Angular client

**New lib `libs/main/login-window`** — `LoginWindowComponent`:

- Username + password fields, submit button, inline error display, pending
  state. Reuses the connection window's branding/backdrop styling.
- On submit: `POST /api/auth/login { username, password }`.
  - 200 → call `MysqlService.connectWeb()`; on success the app's existing
    `connectionEstablished` binding swaps in the main window.
  - 401 → show "invalid credentials"; other errors → show generic failure
    with detail.

**Window selection** (`apps/keira/src/app/app.component.html`):

```
connectionEstablished        → MainWindowComponent        (unchanged)
else, web-like environment   → LoginWindowComponent       (new)
else                         → ConnectionWindowComponent  (unchanged, Electron)
```

"Web-like" = `appConfig.environment` is `WEB` | `DOCKER` | `DEV_WEB`, or
`databaseApiUrl` is set — the same predicate `MysqlService` now uses. It moves
to a shared helper `isWebLikeEnvironment(config)` in `@keira/shared/config`,
and `MysqlService` consumes the helper instead of duplicating the check.

**`MysqlService.connectWeb()`** — web-mode connect without fake credentials:

- Calls `GET /api/database/state`; if the response reports `CONNECTED`, sets
  `_connectionEstablished = true` (and the dummy `_connection` state object,
  as `connectViaAPI` does today).
- Called after successful login, and once on app startup in web mode to
  restore a still-valid session (valid cookie → editor immediately, no login
  screen; 401 → login screen).
- `connect()`/`connectViaAPI` and the `/api/database/connect` endpoint remain
  unchanged (they back the existing web branch and its tests) but are no
  longer exercised by the web login flow, since the connection window never
  renders in web mode.

**401 interceptor** (functional interceptor, registered in web mode only):

- Any 401 from `/api/database/*` or `/api/auth/*` (except the login request
  itself) → reset `connectionEstablished` to false, which drops the user back
  to the login window. Expired sessions therefore fail safe mid-use.

**Logout** — the existing sidebar disconnect button (`LogoutBtnComponent`)
gains web behavior: in web-like environments it calls `POST /api/auth/logout`
before its existing page reload (the reload lands on the login window since
the cookie is gone). Desktop behavior is unchanged.

**LoginConfigService / recent configs** — untouched. The connection window
simply stops rendering in web mode; its localStorage features become inert
there. No migration needed.

### 2. API server (`docker/api/database-api.js`)

**Environment variables:**

| Variable | Meaning | Default |
| --- | --- | --- |
| `KEIRA_AUTH_USER` | login username | unset |
| `KEIRA_AUTH_PASSWORD` | login password | unset |
| `KEIRA_SESSION_SECRET` | HMAC secret for session tokens | random per start |
| `KEIRA_SESSION_TTL` | session lifetime, seconds | `86400` (24 h) |

Auth is **enforced when both `KEIRA_AUTH_USER` and `KEIRA_AUTH_PASSWORD` are
set**. When either is missing, auth is disabled and the server logs a loud
startup warning — preserving current behavior for existing deployments.
(Considered fail-closed; rejected to avoid silently breaking existing users of
the image. RealmMaster will set both.)

**Endpoints:**

- `POST /api/auth/login` — body `{ username, password }`. Constant-time
  comparison (`crypto.timingSafeEqual` over hashes of the inputs) against the
  env credentials; a ~500 ms delay on failure blunts brute force. Success sets
  cookie `keira_session` = `expiry.signature` where `signature =
  HMAC-SHA256(secret, expiry)`; flags `HttpOnly; SameSite=Lax; Path=/`
  (`Secure` is the reverse proxy's concern). Returns `{ success: true }`.
  Failure → 401 `{ success: false, error }`.
- `POST /api/auth/logout` — clears the cookie. Always 200.

No session-introspection endpoint: the client's session probe is
`/api/database/state`, which exercises the same guard.

**Guard middleware** on `/api/database/*`: valid, unexpired session cookie
required, else 401 in the standard error envelope. `/health` and
`/api/auth/*` remain open. Cookie parsing is done with a small local helper
(no new npm dependency); the only crypto used is Node's built-in `crypto`.

A `KEIRA_SESSION_SECRET` left unset means sessions do not survive container
restarts (a restart logs everyone out). This is acceptable and the default.

**nginx** (`docker/config/nginx.conf`): add a `location /api/auth/` block
mirroring the existing `/api/database/` proxy to `127.0.0.1:3001`.

### 3. RealmMaster wiring (separate repo, follow-up commit)

- `docker-compose.yml` `ac-keira3` service: pass `KEIRA_AUTH_USER` and
  `KEIRA_AUTH_PASSWORD` from `.env`.
- `.env.template` / `.env.prebuilt`: `KEIRA_AUTH_USER=admin` and
  `KEIRA_AUTH_PASSWORD=` (empty — auth stays off until the operator sets it;
  the template comment says so explicitly).

### 4. Error handling summary

| Failure | Behavior |
| --- | --- |
| Bad credentials | 401 + inline "invalid credentials", ~500 ms server delay |
| Session expires mid-use | next API call 401s → interceptor returns user to login |
| API server down at login | login form shows generic connection error, stays usable |
| DB pool down after login | `connectWeb()` state check fails → error surfaced on login screen |
| Auth env vars unset | auth disabled, loud server log warning, login screen skipped entirely (client sees state endpoint succeed without a session — treated as connected) |

Note the last row: when auth is disabled the guard middleware admits requests
with no cookie, so the startup `connectWeb()` probe succeeds and the user
lands straight in the editor — the pre-change behavior, minus the theater
form.

### 5. Testing

**Vitest (Angular):**

- `LoginWindowComponent`: success path, 401 path, server-error path, pending
  state.
- `MysqlService.connectWeb()`: CONNECTED → established; 401/other → not
  established.
- 401 interceptor: resets connection state; ignores the login request itself.
- `app.component` window selection across the three environment shapes.
- `isWebLikeEnvironment` helper: unit tests in `@keira/shared/config`.

**Jest (`docker/tests`):**

- Login: correct creds → cookie; wrong creds → 401 (and measurably delayed);
  malformed body → 400.
- Guard: no/invalid/expired cookie → 401 on `/api/database/*`; valid cookie
  passes; `/health` open.
- Logout clears the session.
- Auth-disabled mode: warning logged, all routes open.
- Existing integration tests (`database-api.integration.spec.js`) gain a
  login step in setup when auth env vars are present.

### 6. Out of scope

- Multiple users, roles, password hashing at rest (creds are env vars).
- HTTPS / TLS (reverse proxy's job).
- Any change to the Electron connection window or its SSL/SSH features.
- Removing `LoginConfigService`'s now-inert web branches.
- Rate limiting beyond the fixed failure delay.
