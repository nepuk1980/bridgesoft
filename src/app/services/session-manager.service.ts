import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject, Subject, Observable, catchError, throwError, map, of, switchMap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { IgapiService } from './igapi.service';
import { AuthService } from '../core/services/auth.service';
import { SessionExpiredDialogComponent } from '../session-manager/session-expired-dialog/session-expired-dialog.component';

interface RefreshResult {
  rotated: boolean;
  stillValid: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionManagerService implements OnDestroy {
  private api = inject(IgapiService);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  private dialog = inject(MatDialog);
  private cookie = inject(CookieService);
  private router = inject(Router);

  // --- Session expiry flags ---
  private isLoggingOut = false;
  private isPromptingExpiry = false;
  private tokenValidated = false;

  // --- Activity / timer state ---
  private activityWindow: boolean[] = [];
  private activityTimer!: any;
  private warningTimer!: any;
  private refreshTimer: any;

  public readonly sessionExpired$ = new Subject<void>();
  public showWarning$ = new BehaviorSubject<boolean>(false);
  public isRefreshing$ = new BehaviorSubject<boolean>(false);

  private expiryPromptActive = false;
  private readonly ACTIVITY_THROTTLE = 5_000;
  private lastActivity = 0;

  private activityListener = () => {
    const now = Date.now();
    if (now - this.lastActivity < this.ACTIVITY_THROTTLE) return;
    this.lastActivity = now;
    const lastIndex = Math.max(0, this.activityWindow.length - 1);
    this.activityWindow[lastIndex] = true;
    this.saveActivityWindow();
    this.resetInactivityTimer();
  };

  private readonly INACTIVITY_LIMIT = 30 * 60 * 1000;
  private readonly WARNING_DURATION = 5 * 60 * 1000;
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000;
  private readonly ACTIVITY_WINDOW_KEY = 'session-manager.activityWindow';

  constructor() {
    this.initActivityWindow();
    this.sessionExpired$.subscribe(() => {
      this.handleSessionExpiry().subscribe();
    });
  }

  ngOnDestroy(): void {
    this.clearSession();
  }

  // ─── Token validation helpers ────────────────────────────────────────

  public markTokenValidated(): void {
    this.tokenValidated = true;
  }

  public isTokenValidated(): boolean {
    return this.tokenValidated;
  }

  public resetTokenValidation(): void {
    this.tokenValidated = false;
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

  public isTokenValidLocally(): boolean {
    const activeToken = localStorage.getItem('accessToken') ||
      this.cookie.get('accessToken') ||
      this.cookie.get('idToken');
    if (!activeToken || activeToken === 'null' || activeToken === 'undefined') return false;
    const expTime = this.getTokenExpirationTime(activeToken);
    if (!expTime) return true;
    return Date.now() < expTime;
  }

  // ─── API wrappers ────────────────────────────────────────────────────

  public validateTokens(): Observable<any> {
    return this.api.get<any>('tokens/validateTokens').pipe(
      catchError((err) => {
        console.warn('⛔ validateTokens API call failed:', err);
        return throwError(() => err);
      })
    );
  }

  public validateTokenOnRouteChange(): Observable<boolean> {
    return this.validateTokens().pipe(
      switchMap((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          this.authService.setIgUrl(res.IG_URL);
          this.authService.persistSessionData(res);
          this.authService.setTokensFromValidateResponse(res);
          this.authService.syncTokensFromCookies();
          this.tokenValidated = true;
          return of(true);
        }
        console.warn('⛔ validateTokens success:false. Attempting token refresh...');
        this.authService.setIgUrl(res?.IG_URL);
        return this.refreshTokens();
      }),
      catchError((err) => {
        console.warn('⛔ validateTokens error on route change:', err);
        if (err?.status === 401 || err?.status === 403) {
          return this.handleSessionExpiry();
        }
        return of(false);
      })
    );
  }

  public verifySessionOnApiFailure(): Observable<boolean> {
    return this.validateTokens().pipe(
      switchMap((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          this.authService.setIgUrl(res.IG_URL);
          this.authService.setTokensFromValidateResponse(res);
          this.authService.syncTokensFromCookies();
          return of(true);
        }
        console.warn('⛔ API failed and session is not active. Attempting token refresh...');
        this.authService.setIgUrl(res?.IG_URL);
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

  public refreshTokens(): Observable<boolean> {
    return this.api.get<any>(`tokens/refresh`).pipe(
      switchMap((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          console.log('🔄 Tokens refreshed successfully.');
          this.authService.persistAuthResponse(res);
          this.authService.persistSessionData(res);
          this.authService.syncAuthCookies();
          this.authService.syncTokensFromCookies();
          this.resume();
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

  public promptSessionExpiry(): Observable<boolean> {
    if (this.isPromptingExpiry) return of(false);
    this.isPromptingExpiry = true;
    this.dialog.closeAll();
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

  public handleSessionExpiry(): Observable<boolean> {
    return this.promptSessionExpiry();
  }

  public refreshTokenAndContinue(): Observable<boolean> {
    return this.api.get<any>(`tokens/refresh`).pipe(
      switchMap((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          console.log('🔄 Tokens refreshed successfully. Resuming session.');
          this.authService.persistAuthResponse(res);
          this.authService.persistSessionData(res);
          this.authService.syncAuthCookies();
          this.authService.syncTokensFromCookies();
          this.resume();
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

  // ─── Redirect / logout ───────────────────────────────────────────────

  public redirectToLoginPage(): void {
    this.tokenValidated = false;
    this.clearSession();
    this.authService.clearSession();
    localStorage.removeItem('basicAuth');
    this.authService.clearTokenCookies();
    this.router.navigate(['/']);
  }

  public logoutAndRedirect(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    this.tokenValidated = false;
    const igLogout = this.api.igLogout().pipe(
      catchError((err) => {
        console.warn('IG logout error (continuing):', err);
        return of(null);
      })
    );
    igLogout.subscribe({
      next: () => {
        console.log('✅ Logged out from Fasm.');
        this.finishLogout();
      },
      error: () => {
        this.finishLogout();
      }
    });
  }

  private redirectToIg(igUrl?: string): void {
    this.tokenValidated = false;
    this.clearSession();
    this.authService.clearSession();
    localStorage.removeItem('basicAuth');
    this.authService.clearTokenCookies();
    this.authService.redirectToIgUrl(igUrl);
  }

  private finishLogout(): void {
    this.clearSession();
    this.authService.clearSession();
    localStorage.removeItem('basicAuth');
    this.authService.clearTokenCookies();
    this.isLoggingOut = false;
    const igUrl = this.authService.getIgUrl();
    if (igUrl) {
      console.log('🚪 Logged out. Redirecting to IG URL:', igUrl);
      window.location.href = igUrl;
      return;
    }
    console.log('🚪 Logged out. No IG URL in localStorage - staying on the current URL.');
  }

  // ─── Activity / session-manager lifecycle ────────────────────────────

  private getWindowSize(): number {
    return Math.max(1, Math.ceil(this.INACTIVITY_LIMIT / this.REFRESH_INTERVAL));
  }

  private loadActivityWindow(): boolean[] | null {
    try {
      const raw = sessionStorage.getItem(this.ACTIVITY_WINDOW_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      const size = this.getWindowSize();
      if (parsed.length !== size) return null;
      return parsed.map((v) => v === true);
    } catch {
      return null;
    }
  }

  private saveActivityWindow(): void {
    sessionStorage.setItem(this.ACTIVITY_WINDOW_KEY, JSON.stringify(this.activityWindow));
  }

  private initActivityWindow(): void {
    const restored = this.loadActivityWindow();
    if (restored) {
      this.activityWindow = restored;
      return;
    }
    this.activityWindow = new Array(this.getWindowSize()).fill(false);
    this.saveActivityWindow();
  }

  public start(): void {
    this.expiryPromptActive = false;
    this.attachListeners();
    this.resetInactivityTimer();
    this.scheduleNextRefresh();
  }

  public resume(): void {
    this.expiryPromptActive = false;
    this.scheduleNextRefresh();
  }

  private attachListeners(): void {
    ['mousemove', 'keydown', 'scroll', 'click']
      .forEach((evt) => window.addEventListener(evt, this.activityListener));
  }

  private resetInactivityTimer(): void {
    if (this.showWarning$.value) return;
    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);
    this.showWarning$.next(false);
    this.activityTimer = setTimeout(() => this.startWarning(), this.INACTIVITY_LIMIT);
  }

  private startWarning(): void {
    if (this.expiryPromptActive) return;
    if (this.showWarning$.value) return;
    if (this.warningTimer) clearTimeout(this.warningTimer);
    this.showWarning$.next(true);
    this.warningTimer = setTimeout(() => {
      this.showWarning$.next(false);
      this.expiryPromptActive = true;
      this.sessionExpired$.next();
    }, this.WARNING_DURATION);
  }

  public async staySignedIn(): Promise<void> {
    if (this.isRefreshing$.value) return;
    this.isRefreshing$.next(true);
    try {
      const resp: any = await firstValueFrom(this.api.get('tokens/validateTokens'));
      if (resp && this.authService.isSuccess(resp.success)) {
        this.authService.setIgUrl(resp.IG_URL);
        this.authService.persistSessionData(resp);
        this.authService.setTokensFromValidateResponse(resp);
        this.authService.syncTokensFromCookies();
        this.showWarning$.next(false);
        this.dialog.closeAll();
        clearTimeout(this.warningTimer);
        this.resetInactivityTimer();
        this.scheduleNextRefresh();
        this.isRefreshing$.next(false);
        return;
      }
      this.isRefreshing$.next(false);
      await this.performLogout();
    } catch (err) {
      console.error('validateTokens API error:', err);
      this.isRefreshing$.next(false);
      await this.performLogout();
    }
  }

  private scheduleNextRefresh(): void {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(async () => {
      if (this.activityWindow.some((f) => f)) {
        const { rotated, stillValid } = await this.attemptRefresh();
        if (!rotated && !stillValid) {
          this.showWarning$.next(false);
          this.expiryPromptActive = true;
          this.sessionExpired$.next();
          return;
        }
        if (rotated) {
          this.saveActivityWindow();
        } else {
          this.activityWindow.shift();
          this.activityWindow.push(false);
          this.saveActivityWindow();
        }
      }
      this.scheduleNextRefresh();
    }, this.REFRESH_INTERVAL);
  }

  private async attemptRefresh(): Promise<RefreshResult> {
    try {
      const resp: any = await firstValueFrom(this.api.get<any>(`tokens/refresh`));
      if (!resp || !this.authService.isSuccess(resp.success)) {
        if (resp?.IG_URL) {
          this.authService.setIgUrl(resp.IG_URL);
        }
        return { rotated: false, stillValid: false };
      }
      const message = (resp.message || '').toLowerCase();
      const rotated = message.includes('rotated');
      const stillValid = !rotated;
      this.authService.persistAuthResponse(resp);
      this.authService.syncAuthCookies();
      this.authService.syncTokensFromCookies();
      return { rotated, stillValid };
    } catch (err) {
      console.error('Refresh API error:', err);
      return { rotated: false, stillValid: false };
    }
  }

  public async performLogout(): Promise<void> {
    this.dialog.closeAll();
    const igUrl = this.authService.getIgUrl();
    this.clearSession();
    this.ngZone.run(async () => {
      try {
        await firstValueFrom(this.api.igLogout());
      } catch (error) {
        console.error('Logout API error:', error);
      }
      if (igUrl) {
        console.log('🚪 Logged out. Redirecting to IG URL:', igUrl);
        window.location.href = igUrl;
        return;
      }
      console.log('🚪 Logged out. No IG URL in localStorage - staying on the current URL.');
    });
  }

  public resumeAfterCheck(): void {
    this.expiryPromptActive = false;
    this.showWarning$.next(false);
    try { this.resetInactivityTimer(); } catch (e) { console.warn(e); }
    try { this.scheduleNextRefresh(); } catch (e) { console.warn(e); }
  }

  public clearSession(): void {
    ['mousemove', 'keydown', 'scroll', 'click']
      .forEach((evt) => window.removeEventListener(evt, this.activityListener));
    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);
    clearTimeout(this.refreshTimer);
    this.expiryPromptActive = false;
    this.showWarning$.next(false);
    this.isRefreshing$.next(false);
    sessionStorage.removeItem(this.ACTIVITY_WINDOW_KEY);
    this.activityWindow = [];
  }
}
