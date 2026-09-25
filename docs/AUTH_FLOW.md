# FASM Authentication & Session Flow

This document describes how the FASM (File Access Security Manager) frontend
authenticates users launched from the IG (Identity Governance) application,
keeps sessions alive, and redirects users back to IG when a session is no
longer valid.

---

## 1. Login / Launch (SSO entry) routes

IG redirects the user to one of two FASM URLs (query params):

| Route | Params | Purpose |
|---|---|---|
| `<FASM-URL>/launch?launch_code=xxx&user=xxx` | `launch_code`, `user` | First-time launch using a one-time launch code |
| `<FASM-URL>/launch?fasm_session_id=xxx&user=xxx` | `fasm_session_id`, `user` | Re-entry using an existing FASM session |
| `<FASM-URL>/login?...` | same params | Same SSO flow (`LoginComponent`) when launched with params; without params it falls back to the manual credential form |

Both `LaunchComponent` (`src/app/pages/launch/launch.component.ts`) and
`LoginComponent` (`src/app/login/login.component.ts`) show a **spinner** while
authenticating.

### validate-user API

`POST /api/auth/validate-user`

```json
// launch_code variant
{ "launch_code": "hskjdhfk", "user": "B1PC" }

// fasm_session_id variant
{ "fasm_session_id": "jskhdf9787", "user": "B1PC" }
```

**Success responses** (both mean the user may proceed):

```json
{ "success": "true", "authenticated": "true", "message": "User authenticated successfully, new session created" }
```

```json
{ "success": "true", "authenticated": "true", "message": "User authenticated successfully, session exists", "IG_URL": "http://ig.bridgesoft.com" }
```

**Failure responses** (expired / consumed / invalid code) — the user is
redirected to `IG_URL`:

```json
{
  "success": "false",
  "authenticated": "false",
  "message": "The Launch Code is Expired, You don't have access to this page.",
  "IG_URL": "http://ig.bridgesoft.com"
}
```

### Launch flow

1. Read `launch_code`/`fasm_session_id` and `user` from the query string.
2. POST `auth/validate-user`.
3. On success:
   - store `IG_URL` as the redirect backup;
   - capture any server-set session cookies (`syncTokensFromCookies`);
   - navigate straight to the FASM dashboard (`/`).
   `validateTokens` is **not** called here — the route guard performs it when
   entering the protected layout (see section 2).
4. On failure (or missing params / API error) → `IG_URL` is captured from the
   response and stored as a backup variable only (`setIgUrl`); the failure
   message is shown on the launch page. The app never navigates to an external
   URL.

---

## 2. validateTokens on every navigation

The `sessionGuard` (`src/app/guard/session.guard.ts`) runs on every protected
route change and calls `SessionService.validateTokenOnRouteChange()`, which
hits `GET /api/tokens/validateTokens`.

- `success: true` → navigation is allowed.
- `success: false` → the "session expired" dialog is shown and waits for user
  input (Continue → refresh, Cancel → login page).
- HTTP `401/403` (dead/expired session) → same expiry dialog. Any other API
  error → clear the session and navigate to the internal `/login` page (the app
  never redirects to an external URL).

---

## 3. After successful authentication → Dashboard + session manager

Once the user reaches the dashboard, `AppComponent`
(`src/app/app.component.ts`) detects navigation into the protected layout and
starts the **session manager** (`src/app/services/session-manager.service.ts`).

The session manager (ported from IG, with the warning/logout dialog code
removed):

- monitors user activity (`mousemove`, `keydown`, `scroll`, `click`, throttled);
- if the user was active, calls `GET /api/tokens/refresh` **every 5 minutes**;
- refreshes tokens when the server says `"Tokens rotated successfully"`,
  slides the activity window on `"Tokens are still valid"`;
- on failure/`success: false` → show the expiry dialog.

---

## 4. Refresh tokens (activity-based)

`GET /api/tokens/refresh` (called from `SessionManagerService.attemptRefresh`).

**Success:**

```json
{ "message": "Tokens are still valid", "success": true }
```

```json
{ "message": "Tokens rotated successfully", "success": true }
```

**Failure:**

```json
{ "success": false, "IG_URL": "http://ig.bridgesoft.com" }
```

On failure (or HTTP `401/403`) the user is shown the expiry dialog; a rotation
is detected from the `"Tokens rotated successfully"` message so rotated cookies
are captured via `syncTokensFromCookies`.

---

## 5. validateTokens fallback on every UI screen

Every FASM business API goes through `HttpClient` and is processed by the
`igtokenInterceptor` (`src/app/interceptors/igtoken.interceptor.ts`). When any
business API call fails (processing error, unauthorized, network, etc.) the
interceptor automatically calls `GET tokens/validateTokens` as a fallback:

- `success: true` → the session is still active, so the normal flow continues
  (the original error is still surfaced to the calling component);
- `success: false` / `401/403` → the user is prompted with the expiry dialog;
  only a hard redirect to `IG_URL` happens on other (network/server) errors.

Endpoints that manage their own session flow (`checkTokens`, `validateTokens`,
`auth/login`, `auth/logout`, `auth/validate-user`, `token/refresh`,
`tokens/refresh`) are excluded from this fallback to avoid loops.

This centralizes the "checkTokens fallback on all UI screens" requirement — no
per-component code was needed.

---

## 6. Logout

A logout menu (IG-style dropdown, top-right of the header) is present in
`src/app/layout/layout.component.html`.

`GET /api/auth/logout`

**Response:**

```json
{ "success": true, "message": "User logged out successfully", "IG_URL": "http://ig.bridgesoft.com" }
```

Flow (`SessionService.logoutAndRedirect`):

1. Call `GET auth/logout`.
2. On success **or** failure:
   - stop the session manager;
   - clear tokens / cookies / basic auth;
   - navigate to the internal `/login` page (no external URL redirect).

---

## 7. IG_URL backup (variables in the UI)

The `IG_URL` is stored as a backup variable in the UI (never used to navigate
outside the app):

1. **Environment default** — `src/environments/environment.ts` and
   `environment.prod.ts`:

   ```ts
   igUrl: "http://ig.bridgesoft.com"
   ```

2. **Runtime backup** — `AuthService` (`setIgUrl` / `getIgUrl`) stores the
   last known `IG_URL` from `validate-user`, `validateTokens`, `tokens/refresh`
   and `auth/logout` responses in `localStorage['igUrl']`.

`AuthService.redirectToIgUrl(url?)` logs the `IG_URL` (from the response,
otherwise the stored `localStorage['igUrl']` / `environment.igUrl`) but always
navigates **inside** the SPA to `/login` — the browser is never pointed at an
external URL.

---

## End-to-End Flow

Maps the backend's documented E2E flow to the frontend code:

| # | Flow | Frontend |
|---|---|---|
| 1 | **Login**: UI → `/validate-user` → FASM introspect → FASM DB → cookies → UI | `LaunchComponent` posts `auth/validate-user` with `launch_code`/`fasm_session_id` + `user`; on success it captures the server-set cookies (`syncTokensFromCookies`), verifies with `tokens/validateTokens`, then navigates to the dashboard |
| 2 | **Token validation**: UI → `/validateTokens` → FASM → IG validateTokens → UI | `sessionGuard` runs on every protected route → `SessionService.validateTokenOnRouteChange()` → `GET tokens/validateTokens` |
| 3 | **Token refresh**: UI → `/refresh` → FASM → IG validateTokens → rotate if needed → UI | `SessionManagerService` calls `GET tokens/refresh` every 5 min when the user is active; also on expiry-dialog "Continue" |
| 4 | **Logout**: UI → `/logout` → FASM DB terminate → FASM → IG logout → IG DB terminate → FASM → UI | Logout menu → `SessionService.logoutAndRedirect()` → `GET auth/logout` → clear local session → navigate to internal `/login` |
| 5 | **IG-initiated logout**: IG → `/api/auth/FASM/logout` → FASM DB terminate → IG | Server-to-server only; no UI call. The FASM session is terminated server-side, so the next `validateTokens`/`refresh` fails and the UI shows the expiry dialog |

The `authGuard` is only a fast local gate (accepts `logitoken` **or** the
server-set `accessToken` cookie); the authoritative check is `sessionGuard` →
`/validateTokens`.

---

## Endpoint reference

| Method | Path | Used by |
|---|---|---|
| POST | `/api/auth/validate-user` | Launch component |
| GET | `/api/tokens/validateTokens` | Session guard, launch, login, interceptor fallback |
| GET | `/api/tokens/refresh` | Session manager (5 min, activity-based), expiry dialog |
| GET | `/api/auth/logout` | Logout menu, session service |

---

## Redirect decision matrix

No external URL is ever navigated to. `IG_URL` is only stored as a backup
variable; every failure path clears the local session and routes **inside** the
SPA to `/login`.

| Condition | Result |
|---|---|
| validate-user `authenticated: false` | failure message shown on launch page (`IG_URL` stored as backup only) |
| validate-user API error / missing params | failure message shown on launch page |
| validateTokens `success: false` on navigation | → expiry dialog (Continue/Cancel) |
| validateTokens `401/403` on navigation | → expiry dialog (Continue/Cancel) |
| validateTokens API error on navigation | → `/login` |
| business API fails + validateTokens `success: true` | continue normal flow |
| business API fails + validateTokens `success: false` / `401/403` | → expiry dialog |
| tokens/refresh `success: false` / error | → expiry dialog |
| auth/logout success or failure | → `/login` |
