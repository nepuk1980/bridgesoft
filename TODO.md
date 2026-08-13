# TODO - Fix refresh token API not called after session end

- [x] Analyze relevant files (session.service.ts, auth.service.ts, interceptors, igapi.service.ts, login.component.ts)
- [x] Identify root cause: `refreshTokenObservable()` reads tokens ONLY from cookies; missing/empty cookie values cause logout without calling refresh API
- [x] Modify `refreshTokenObservable()` in `src/app/services/session.service.ts` to source tokens from `authService.getAllTokens()` (localStorage-first, cookies fallback)
- [x] Keep validation guard and payload structure `{ accessToken, idToken, refreshToken }` unchanged
- [x] Keep existing success/error handling intact
- [x] After refresh success, re-persist accessToken & idToken cookies from existing stored values so all 3 cookies exist in the browser (fix for: only refreshToken cookie was set)
- [x] Verify build passes (`ng build`)
