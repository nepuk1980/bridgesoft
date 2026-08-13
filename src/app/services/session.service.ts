import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { IgapiService } from '../services/igapi.service';
import { AuthService } from '../core/services/auth.service';
import { PermissionService } from './permission.service';
import { SessionManagerService } from './session-manager.service';
import { SessionExpiredDialogComponent } from '../session-manager/session-expired-dialog/session-expired-dialog.component';
import { Observable, catchError, throwError, map, of, switchMap, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {
  private api = inject(IgapiService);
  private cookie = inject(CookieService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private sessionManager = inject(SessionManagerService);
  private dialog = inject(MatDialog);

  private isLoggingOut = false; // 🔒 Guard flag to prevent duplicate logout calls
  private isPromptingExpiry = false; // 🔒 Guard flag to prevent duplicate expiry prompts

  // Once /api/tokens/validateTokens returns success:true, the session is known
  // valid. The launch flow already validated it, so the route guard can skip
  // re-hitting the endpoint on the immediate navigation to the dashboard.
  private tokenValidated = false;

  /** Mark the session as validated (success:true from /validateTokens). */
  public markTokenValidated(): void {
    this.tokenValidated = true;
  }

  /** Clear the validation flag (logout / session expiry). */
  public resetTokenValidation(): void {
    this.tokenValidated = false;
  }

  constructor() {
    // When the refresh loop reports a dead/expired session, ask the user if
    // they want to continue (refresh) or cancel (go to login page).
    this.sessionManager.sessionExpired$.subscribe(() => {
      this.handleSessionExpiry().subscribe();
    });
  }

  ngOnDestroy(): void {
    this.sessionManager.clearSession();
  }

  private getTokenExpirationTime(token: string): number | null {
    try {
      if (!token || token.indexOf('.') === -1) return null;

      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;

      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decodedJson);

      return payload.exp ? payload.exp * 1000 : null;
    } catch (e) {
      console.warn('Error decoding JWT token:', e);
      return null;
    }
  }

  isTokenValidLocally(): boolean {
    const activeToken = localStorage.getItem('accessToken') ||
      this.cookie.get('accessToken') ||
      this.cookie.get('idToken');

    if (!activeToken || activeToken === 'null' || activeToken === 'undefined') {
      return false;
    }

    const expTime = this.getTokenExpirationTime(activeToken);
    if (!expTime) return true;

    return Date.now() < expTime;
  }

  /**
   * Plain GET /api/tokens/validateTokens call. Used by guards, launch flow and
   * the interceptor fallback. The backend returns HTTP 401 for a dead/expired
   * session (rather than success:false), so callers handle both.
   */
  public validateTokens(): Observable<any> {
    return this.api.get<any>('tokens/validateTokens').pipe(
      catchError((err) => {
        console.warn('⛔ validateTokens API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Check token validity on every route change.
   * success:true  -> allow navigation
   * success:false -> rotate tokens via GET /api/tokens/refresh; if that fails,
   *                  prompt the user: continue (refresh) or cancel (login page)
   */
  public validateTokenOnRouteChange(): Observable<boolean> {
    // Already validated by the launch flow / a previous success - don't re-hit
    // the validateTokens endpoint on every page transition.
    if (this.tokenValidated) {
      return of(true);
    }

    return this.validateTokens().pipe(
      switchMap((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          this.authService.setIgUrl(res.IG_URL);
          if (res.permissionsList) {
            this.permissionService.setPermissions(res.permissionsList);
          }
          this.authService.persistSessionData(res);
          this.authService.setTokensFromValidateResponse(res);
          this.authService.syncTokensFromCookies();
          this.tokenValidated = true;
          return of(true);
        }
        console.warn('⛔ Session is not active. Attempting token refresh...');
        this.authService.setIgUrl(res?.IG_URL);
        // refreshTokens() logs out the session itself when the refresh fails.
        return this.refreshTokens();
      }),
      catchError((err) => {
        console.warn('⛔ Token check failed on route change:', err);
        // 401/403 -> dead/expired session. Prompt the user instead of
        // auto-bouncing to IG so the expiry dialog gets a chance to wait.
        if (err?.status === 401 || err?.status === 403) {
          return this.handleSessionExpiry();
        }
        this.redirectToIg();
        return of(false);
      })
    );
  }

  /**
   * Central fallback used by the interceptor whenever a business API call fails.
   * If the session is still active (success:true) the caller may continue the
   * normal flow; otherwise tokens are rotated via GET /api/tokens/refresh and,
   * if that fails, the user is prompted: continue (refresh) or cancel (login).
   */
  public verifySessionOnApiFailure(): Observable<boolean> {
    return this.validateTokens().pipe(
      switchMap((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          this.authService.setIgUrl(res.IG_URL);
          if (res.permissionsList) {
            this.permissionService.setPermissions(res.permissionsList);
          }
          this.authService.setTokensFromValidateResponse(res);
          this.authService.syncTokensFromCookies();
          return of(true);
        }
        console.warn('⛔ API failed and session is not active. Attempting token refresh...');
        this.authService.setIgUrl(res?.IG_URL);
        // refreshTokens() logs out the session itself when the refresh fails.
        return this.refreshTokens();
      }),
      catchError((err) => {
        console.warn('⛔ Fallback session check failed:', err);
        if (err?.status === 401 || err?.status === 403) {
          return this.handleSessionExpiry();
        }
        this.redirectToIg();
        return of(false);
      })
    );
  }

  /**
   * Calls GET /api/tokens/refresh which validates the current tokens and rotates
   * them when expiry is less than 5 minutes. On success the fresh tokens are
   * persisted and the auto-refresh loop resumes. Resolves to true on success.
   */
  public refreshTokens(): Observable<boolean> {
    return this.api.get<any>(`tokens/refresh`).pipe(
      switchMap((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          console.log('🔄 Tokens refreshed successfully.');
          this.authService.setIgUrl(res.IG_URL);
          this.authService.persistAuthResponse(res);
          this.authService.persistSessionData(res);
          this.authService.syncAuthCookies();
          this.authService.syncTokensFromCookies();
          this.sessionManager.resume();
          this.tokenValidated = true;
          return of(true);
        }
        console.warn('⛔ Token refresh rejected. Logging out the session...', res?.message);
        this.logoutAndRedirect();
        return of(false);
      }),
      catchError((err) => {
        console.warn('⛔ Token refresh failed. Logging out the session...', err);
        this.logoutAndRedirect();
        return of(false);
      })
    );
  }

  /** Navigate the browser to the IG page (fallback to stored / env IG_URL). */
  private redirectToIg(igUrl?: string): void {
    this.tokenValidated = false;
    this.sessionManager.clearSession();
    this.authService.clearSession();
    localStorage.removeItem('basicAuth');
    this.authService.clearTokenCookies();
    this.authService.redirectToIgUrl(igUrl);
  }

  /**
   * Show the "session expired" confirmation dialog.
   * - Continue  -> hit the refresh token API
   * - Cancel    -> clear the session and go to the login page
   * Returns true when the session was successfully refreshed.
   */
  public promptSessionExpiry(): Observable<boolean> {
    if (this.isPromptingExpiry) return of(false); // Prevent duplicate prompts
    this.isPromptingExpiry = true;

    const dialogRef = this.dialog.open(SessionExpiredDialogComponent, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
    });

    return dialogRef.afterClosed().pipe(
      switchMap((continueSession: boolean) => {
        this.isPromptingExpiry = false;
        if (continueSession) {
          return this.refreshTokenAndContinue();
        }
        this.redirectToLoginPage();
        return of(false);
      }),
      catchError((err) => {
        this.isPromptingExpiry = false;
        console.warn('⛔ Session expiry prompt error:', err);
        this.redirectToLoginPage();
        return of(false);
      })
    );
  }

  /** Convenience wrapper used by the session-manager expiry event (fire and forget). */
  public handleSessionExpiry(): Observable<boolean> {
    return this.promptSessionExpiry();
  }

  /**
   * Calls the refresh token API and, on success, re-persists the tokens and
   * resumes the auto-refresh loop. Resolves to true on success, false otherwise.
   */
  public refreshTokenAndContinue(): Observable<boolean> {
    return this.api.get<any>(`tokens/refresh`).pipe(
      switchMap((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          console.log('🔄 Tokens refreshed successfully. Resuming session.');
          this.authService.setIgUrl(res.IG_URL);
          this.authService.persistAuthResponse(res);
          this.authService.persistSessionData(res);
          this.authService.syncAuthCookies();
          this.authService.syncTokensFromCookies();
          this.sessionManager.resume();
          return of(true);
        }
        console.warn('⛔ Token refresh rejected. Redirecting to login...');
        this.redirectToLoginPage();
        return of(false);
      }),
      catchError((err) => {
        console.warn('⛔ Token refresh failed. Redirecting to login...', err);
        this.redirectToLoginPage();
        return of(false);
      })
    );
  }

  /** Clear the local session and navigate to the login page. */
  public redirectToLoginPage(): void {
    this.tokenValidated = false;
    this.sessionManager.clearSession();
    this.authService.clearSession();
    localStorage.removeItem('basicAuth');
    this.authService.clearTokenCookies();
    this.router.navigate(['/login']);
  }

  /**
   * Logout flow:
   * 1. GET /api/auth/logout on BOTH backends (fasm + IG) so both sessions die.
   * 2. On success OR failure, clear the local session and stay on the login page.
   */
  public logoutAndRedirect(): void {
    if (this.isLoggingOut) return; // Prevent duplicate logout calls
    this.isLoggingOut = true;
    this.tokenValidated = false;

    // Fire both logouts in parallel; finish once both settle. Each call is
    // guarded so one backend failing still lets the other one log out.
    const fasmLogout = this.api.get<any>('auth/logout').pipe(
      catchError((err) => {
        console.warn('fasm logout error (continuing):', err);
        return of(null);
      })
    );
    const igLogout = this.api.igLogout().pipe(
      catchError((err) => {
        console.warn('IG logout error (continuing):', err);
        return of(null);
      })
    );

    forkJoin([fasmLogout, igLogout]).subscribe({
      next: ([fasmRes, igRes]) => {
        console.log('✅ Logged out from fasm and IG.');
        const igUrl = (fasmRes as any)?.IG_URL || (igRes as any)?.IG_URL;
        this.authService.setIgUrl(igUrl);
        this.finishLogout(igUrl);
      },
      error: (err) => {
        console.warn('Logout response error (continuing local logout):', err);
        this.finishLogout();
      }
    });
  }

  private finishLogout(igUrl?: string): void {
    this.sessionManager.clearSession();
    this.authService.clearSession();
    localStorage.removeItem('basicAuth');
    this.authService.clearTokenCookies();
    this.isLoggingOut = false;

    // No external redirect after logout - stay inside the SPA on the login page.
    this.authService.redirectToIgUrl(igUrl);

    // ───────────────────────────────────────────────────────────────────────
    // BACKUP: redirect to the IG page after logout. Keep this for future use.
    // ───────────────────────────────────────────────────────────────────────
    // const target = igUrl || this.authService.getIgUrl();
    // if (target && target.trim()) {
    //   console.log('🔙 Logout complete. Redirecting to IG:', target.trim());
    //   window.location.href = target.trim();
    // } else {
    //   this.authService.redirectToIgUrl(igUrl);
    // }
  }
}
