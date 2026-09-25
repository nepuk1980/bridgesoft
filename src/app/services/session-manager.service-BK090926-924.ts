// src/app/services/session-manager.service.ts
import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, from, map, of, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { NavigationStart, Router } from '@angular/router';
// import { ApiService } from '../api.service';

import { MatDialog } from '@angular/material/dialog';
import { SessionExpiredDialogComponent } from '../session-manager/session-expired-dialog/session-expired-dialog.component';
import { AuthService } from '../core/services/auth.service';
import { IgapiService } from './igapi.service';

interface RefreshResult {
  rotated: boolean;        // true only when tokens were actually rotated
  stillValid: boolean;     // true when server reports "still valid"
  transientError?: boolean; // true when the call failed for network/5xx reasons
  // (i.e. we could NOT determine session validity - don't punish the user for it)
}

export type SessionState = 'active' | 'warning' | 'expired';

@Injectable({ providedIn: 'root' })
export class SessionManagerService {


  // ────────────────────────────────────────────────────────────────
  // GUARD AGAINST DOUBLE-START.
  // start() is invoked from a CanActivate route guard. Angular re-runs
  // canActivate on every navigation into a matching route. The original
  // implementation called scheduleNextRefresh() (clearTimeout + a brand
  // new 5-minute setTimeout) unconditionally inside start(). If the user
  // navigates between protected pages more often than every 5 minutes -
  // completely normal for an "active" user clicking around a dashboard -
  // the refresh timer is cancelled and restarted before it ever fires.
  // That is the root cause of "no refresh calls after ~30 minutes even
  // though the user is active": it is not that activity isn't detected,
  // it's that the countdown to the API call never gets to finish.
  // `started` makes start() idempotent so navigation can never do this.
  // ────────────────────────────────────────────────────────────────
  private started = false;
  private authService = inject(AuthService);
  private api = inject(IgapiService);
  private activityWindow: boolean[] = [];

  private activityTimer!: any;  // inactivity -> warning countdown
  private warningTimer!: any;   // warning -> expired countdown
  private refreshTimer!: any;   // recurring auto-refresh tick

  private readonly ACTIVITY_THROTTLE = 5_000; // register at most 1 activity event / 5s
  private lastActivityTick = 0;

  // Latches so an in-progress warning/expired dialog only triggers ONE
  // background "extend + refresh" per episode (use cases 12 & 13):
  // the first bit of activity resuscitates the window, further activity
  // while the same dialog is open is a no-op until the user explicitly
  // clicks Continue / Login (or the dialog times out).
  private autoExtendedDuringWarning = false;
  private autoExtendedDuringExpired = false;
  private isExpiredDialogOpen = false;
  private logoutInProgress = false;

  // De-dupe overlapping refresh calls (e.g. a manual "Stay signed in"
  // click landing at the same moment as the background 5-min tick).
  private refreshInFlight: Promise<RefreshResult> | null = null;

  // De-dupe overlapping validateTokens calls. Route-start validation, the
  // pre-request interceptor gate and pagination hooks can all fire at once;
  // they should share one network call instead of spamming the endpoint.
  // A Promise (not a cold Observable) is stored so every concurrent AND late
  // caller awaits the SAME single execution - with an Observable, each
  // subscription to it would re-execute the HTTP call.
  private validateInFlight: Promise<boolean> | null = null;

  // Fresh successful result cache. A single user action triggers validateTokens
  // from several places (NavigationStart listener + per-request interceptor
  // gate). Those land milliseconds apart and don't overlap in flight, so the
  // in-flight dedupe alone doesn't collapse them - reuse a just-finished
  // successful result within a short window instead of re-hitting the API.
  // The cache is also cleared on every NavigationStart so each route change is
  // validated exactly once (and pagination clicks >1s apart validate too).
  private lastValidate: { at: number; valid: boolean } | null = null;
  private readonly VALIDATE_CACHE_MS = 1000;

  /** True while performLogout() is tearing the session down. */
  public get loggingOut(): boolean {
    return this.logoutInProgress;
  }

  private syncChannel: BroadcastChannel | null = null;

  public sessionState$ = new BehaviorSubject<SessionState>('active');
  public showWarning$ = new BehaviorSubject<boolean>(false); // kept for existing template binding
  public isRefreshing$ = new BehaviorSubject<boolean>(false);

  private readonly INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 min
  private readonly WARNING_DURATION = 5 * 60 * 1000;  // 5 min
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000;  // 5 min

  private readonly ACTIVITY_WINDOW_KEY = 'session-manager.activityWindow';
  private readonly LAST_ACTIVITY_KEY = 'session-manager.lastActivityAt';
  private readonly WARNING_STARTED_KEY = 'session-manager.warningStartedAt';
  private readonly STATE_KEY = 'session-manager.state';

  private activityListener = () => this.onActivity();
  private visibilityListener = () => this.recomputeFromElapsedTime();

  constructor(
    // private api: ApiService,
    private router: Router,
    private ngZone: NgZone,
    private dialog: MatDialog
  ) {
    this.initActivityWindow();
    this.initCrossTabSync();
    this.trackRouteChanges();
  }

  /**
   * Validate the session on EVERY URL change - not just top-level (side-nav)
   * route changes. The route guard may not re-fire when only the child segment
   * changes (e.g. /applications -> /applications/123), so a global listener is
   * the only way to guarantee validateTokens is hit on inner-page navigation
   * too. We hook NavigationStart (not NavigationEnd) so the validateTokens call
   * fires BEFORE the route change; on failure the logout flow cancels/redirects
   * the navigation. The guard still gates the initial entry into the shell.
   */
  private trackRouteChanges(): void {
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        // Every route change (side nav, inner page, breadcrumb...) is a distinct
        // user action and must validate again - drop the previous result cache.
        this.lastValidate = null;
        this.validateOnNavigation(event.url);
      });
  }

  private validateOnNavigation(url: string): void {
    if (this.logoutInProgress) return;

    // Phases that perform their own token/SSO handshake - do not validate here
    // or we'd fight the login flow / double up on the loading-screen check.
    // NOTE: no readable-token gate - the session may live in HttpOnly cookies
    // which JS cannot read, so we gate on the route, not on getToken().
    if (url === '/login' || url.startsWith('/launch') || url === '/loading') return;

    this.validateAndContinue().subscribe();
  }

  // ───────────────────────── activity window (5-min bucket queue) ─────────────────────────

  private getWindowSize(): number {
    return Math.max(1, Math.ceil(this.INACTIVITY_LIMIT / this.REFRESH_INTERVAL));
  }

  private saveActivityWindow(): void {
    sessionStorage.setItem(this.ACTIVITY_WINDOW_KEY, JSON.stringify(this.activityWindow));
  }

  private initActivityWindow(): void {
    // Wipe everything currently in sessionStorage - not just our own keys -
    // before writing the fresh window, so every service load starts from a
    // completely clean slate.
    sessionStorage.clear();

    this.activityWindow = new Array(this.getWindowSize()).fill(false);
    this.saveActivityWindow();
  }

  // ───────────────────────── lifecycle entry points ─────────────────────────

  /** Called by the route guard. Safe to call repeatedly / on every navigation. */
  public start(): void {
    if (this.started) {
      // Not a fresh boot - just make sure our state still matches how
      // much time has actually elapsed (handles the guard firing again,
      // and is a no-op the vast majority of the time).
      this.recomputeFromElapsedTime();
      return;
    }
    this.started = true;

    this.attachListeners();

    if (!sessionStorage.getItem(this.LAST_ACTIVITY_KEY)) {
      sessionStorage.setItem(this.LAST_ACTIVITY_KEY, String(Date.now()));
    }

    if (sessionStorage.getItem(this.STATE_KEY)) {
      // Resuming after a page reload / new tab - figure out where we
      // actually are instead of blindly granting a fresh 30 minutes.
      this.recomputeFromElapsedTime();
    } else {
      this.resetInactivityTimer();
    }

    this.scheduleNextRefresh();
  }

  private attachListeners(): void {
    ['mousemove', 'keydown', 'scroll', 'click']
      .forEach(evt => window.addEventListener(evt, this.activityListener));
    document.addEventListener('visibilitychange', this.visibilityListener);
  }

  private initCrossTabSync(): void {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      this.syncChannel = new BroadcastChannel('session-manager-sync');
      this.syncChannel.onmessage = (event) => {
        if (event.data?.type === 'logout') {
          // Cookies are shared across tabs, so another tab logging out
          // means this tab's session is gone too - follow it instead of
          // continuing to poll a dead session.
          this.clearSession();
          this.router.navigate(['/login']);
        }
      };
    } catch {
      this.syncChannel = null;
    }
  }

  // ───────────────────────── activity handling ─────────────────────────

  private onActivity(): void {
    const now = Date.now();
    if (now - this.lastActivityTick < this.ACTIVITY_THROTTLE) return;
    this.lastActivityTick = now;

    sessionStorage.setItem(this.LAST_ACTIVITY_KEY, String(now));

    const lastIndex = Math.max(0, this.activityWindow.length - 1);
    this.activityWindow[lastIndex] = true;
    this.saveActivityWindow();

    switch (this.sessionState$.value) {
      case 'active':
        this.resetInactivityTimer();
        break;

      case 'warning':
        // Use case 8/12: keep the dialog open, but the first bit of
        // activity should quietly hit refresh and revive the window.
        // Further activity in the SAME warning episode is a no-op -
        // only the explicit "Continue" click restarts things again.
        if (!this.autoExtendedDuringWarning) {
          this.autoExtendedDuringWarning = true;
          void this.extendWindowDuringDialog();
        }
        break;

      case 'expired':
        // Use case 13: same pattern for the expired dialog.
        if (!this.autoExtendedDuringExpired) {
          this.autoExtendedDuringExpired = true;
          void this.extendWindowDuringDialog();
        }
        break;
    }
  }

  private async extendWindowDuringDialog(): Promise<void> {
    this.activityWindow = new Array(this.getWindowSize()).fill(false);
    this.activityWindow[this.activityWindow.length - 1] = true;
    this.saveActivityWindow();

    const { rotated, stillValid, transientError } = await this.attemptRefresh();
    if (!rotated && !stillValid && !transientError) {
      // Server has confirmed the session is actually gone - stop
      // pretending otherwise, regardless of which dialog is open.
      this.performLogout();
    }
  }

  // ───────────────────────── state machine: active / warning / expired ─────────────────────────

  private resetInactivityTimer(): void {
    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);

    this.sessionState$.next('active');
    this.showWarning$.next(false);
    sessionStorage.setItem(this.STATE_KEY, 'active');

    this.activityTimer = setTimeout(() => this.enterWarning(), this.INACTIVITY_LIMIT);
  }

  private enterWarning(remainingDuration: number = this.WARNING_DURATION): void {
    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);

    this.autoExtendedDuringWarning = false;
    this.sessionState$.next('warning');
    this.showWarning$.next(true);
    sessionStorage.setItem(this.STATE_KEY, 'warning');

    // Back-date WARNING_STARTED_KEY so that a resumed (post-reload) warning
    // still expires at the correct absolute time, not 5 fresh minutes from now.
    const elapsedAlready = this.WARNING_DURATION - remainingDuration;
    sessionStorage.setItem(this.WARNING_STARTED_KEY, String(Date.now() - elapsedAlready));

    this.warningTimer = setTimeout(() => this.enterExpired(), Math.max(0, remainingDuration));
  }

  private enterExpired(): void {
    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);

    this.autoExtendedDuringExpired = false;
    this.sessionState$.next('expired');
    this.showWarning$.next(false);
    sessionStorage.setItem(this.STATE_KEY, 'expired');

    this.openExpiredDialog();
  }

  /**
   * Single source of truth for "where should we actually be right now".
   * Called on first start(), on every subsequent guard/start() call, and
   * on visibilitychange (tabs get throttled in the background, so a
   * setTimeout scheduled for 30 minutes can easily fire late - this
   * recomputes from real timestamps instead of trusting timer drift).
   */
  private recomputeFromElapsedTime(): void {
    const persisted = (sessionStorage.getItem(this.STATE_KEY) as SessionState | null) ?? 'active';

    if (persisted === 'expired') {
      if (this.sessionState$.value !== 'expired') {
        this.sessionState$.next('expired');
      }
      this.openExpiredDialog();
      return;
    }

    if (persisted === 'warning') {
      const warningStarted = Number(sessionStorage.getItem(this.WARNING_STARTED_KEY)) || Date.now();
      const remaining = this.WARNING_DURATION - (Date.now() - warningStarted);
      if (remaining <= 0) {
        this.enterExpired();
      } else if (this.sessionState$.value !== 'warning') {
        this.enterWarning(remaining);
      }
      return;
    }

    // persisted === 'active'
    const lastActivity = Number(sessionStorage.getItem(this.LAST_ACTIVITY_KEY)) || Date.now();
    const elapsedSinceActivity = Date.now() - lastActivity;

    if (elapsedSinceActivity >= this.INACTIVITY_LIMIT) {
      const remaining = this.INACTIVITY_LIMIT + this.WARNING_DURATION - elapsedSinceActivity;
      if (remaining <= 0) {
        this.enterExpired();
      } else {
        this.enterWarning(remaining);
      }
    } else if (this.sessionState$.value !== 'active') {
      this.resetInactivityTimer();
    }
  }

  // ───────────────────────── user-initiated actions ─────────────────────────

  /** "Continue Session" button on the warning dialog. */
  public async staySignedIn(): Promise<void> {
    this.isRefreshing$.next(true);
    const { rotated, stillValid, transientError } = await this.attemptRefresh();
    this.isRefreshing$.next(false);

    if (rotated || stillValid) {
      this.dialog.closeAll();
      this.isExpiredDialogOpen = false;
      this.restartSessionLifecycle();
    } else if (transientError) {
      // Couldn't reach the server - leave the dialog open, let the
      // background refresh loop keep retrying rather than logging out
      // on a network blip.
      this.isRefreshing$.next(false);
    } else {
      this.performLogout();
    }
  }

  /** Called by SessionExpiredDialogComponent after a successful checkTokens + refresh. */
  public resumeAfterCheck(): void {
    this.isExpiredDialogOpen = false;
    this.restartSessionLifecycle();
  }

  /**
   * Validate the session (GET /api/tokens/validateTokens) on user actions such
   * as route or pagination changes.
   * - success:true  -> persist the fresh session data and keep the session alive.
   * - success:false -> session is dead/expired: logout + redirect to IG URL.
   * - HTTP 401/403  -> the server explicitly rejected the session: logout.
   * - network/5xx   -> transient error: keep the session, allow the action.
   */
  public validateAndContinue(): Observable<boolean> {
    if (this.validateInFlight) {
      return from(this.validateInFlight);
    }
    const now = Date.now();
    if (this.lastValidate && this.lastValidate.valid && now - this.lastValidate.at < this.VALIDATE_CACHE_MS) {
      return of(true);
    }
    this.validateInFlight = firstValueFrom(
      this.runValidateAndContinue().pipe(
        tap((valid) => {
          if (valid) {
            this.lastValidate = { at: Date.now(), valid: true };
          }
        })
      )
    ).then((valid) => {
      this.validateInFlight = null;
      return valid;
    });
    return from(this.validateInFlight);
  }

  private runValidateAndContinue(): Observable<boolean> {
    return this.api.get<any>('tokens/validateTokens').pipe(
      map((res) => {
        if (res && this.authService.isSuccess(res.success)) {
          this.authService.setIgUrl(res.IG_URL);
          this.authService.persistSessionData(res);
          this.authService.setTokensFromValidateResponse(res);
          this.authService.syncTokensFromCookies();
          this.start();
          return true;
        }
        console.warn('⛔ validateTokens success:false. Logging out and redirecting to IG.');
        this.authService.setIgUrl(res.IG_URL);
        void this.performLogout();

        return false;
      }),
      catchError((err) => {
        console.warn('⛔ validateTokens error on action:', err?.status, err);
        if (err?.status === 401 || err?.status === 403) {
          void this.performLogout();
          return of(false);
        }
        this.start();
        return of(true);
      })
    );
  }

  private restartSessionLifecycle(): void {
    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);
    clearTimeout(this.refreshTimer);

    this.autoExtendedDuringWarning = false;
    this.autoExtendedDuringExpired = false;
    this.isRefreshing$.next(false);

    this.activityWindow = new Array(this.getWindowSize()).fill(false);
    this.saveActivityWindow();
    sessionStorage.setItem(this.LAST_ACTIVITY_KEY, String(Date.now()));

    this.resetInactivityTimer();
    this.scheduleNextRefresh();
  }

  // ───────────────────────── background refresh loop ─────────────────────────

  private scheduleNextRefresh(): void {
    clearTimeout(this.refreshTimer);

    this.refreshTimer = setTimeout(async () => {
      if (this.activityWindow.some(f => f)) {
        const { rotated, stillValid, transientError } = await this.attemptRefresh();
        // console.log('Background refresh result:', { rotated, stillValid, transientError });
        if (!rotated && !stillValid && !transientError) {
          this.performLogout();
          return;
        }

        if (rotated) {
          this.activityWindow = new Array(this.getWindowSize()).fill(false);
          this.saveActivityWindow();
          // IMPORTANT: only touch the inactivity/warning timers if we are
          // actually in the 'active' state. If a warning or expired dialog
          // is open, a quiet background token rotation must NOT silently
          // dismiss it - only an explicit user click should do that
          // (use cases 10 & 14).
          if (this.sessionState$.value === 'active') {
            this.resetInactivityTimer();
          }
        } else if (!transientError) {
          this.activityWindow.shift();
          this.activityWindow.push(false);
          this.saveActivityWindow();
        }
        // on transientError: leave the window untouched, just try again
        // on the next tick rather than penalizing a network blip.
      }
      this.scheduleNextRefresh();
    }, this.REFRESH_INTERVAL);
  }

  private attemptRefresh(): Promise<RefreshResult> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }
    this.refreshInFlight = this.doRefresh().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private async doRefresh(): Promise<RefreshResult> {
    try {
      const resp: any = await firstValueFrom(this.api.get('tokens/refresh'));
      const rotated = resp.success === true
        && resp.message?.includes('Tokens refreshed successfully');
      const stillValid = resp.success === true
        && resp.message?.includes('Tokens are still valid');

      // console.log('Refresh API response:', resp, { rotated, stillValid });

      if (resp?.IG_URL) {
        this.authService.setIgUrl(resp.IG_URL);
      }



      return { rotated, stillValid };
    } catch (err: any) {
      console.error('Refresh API error:', err);
      const status = err?.status;
      // 401/403 = server explicitly says the session is invalid.
      // 0 / undefined / 5xx = we simply couldn't reach it - don't treat
      // a dropped wifi connection or a restarting server as a logout.
      const transientError = status === 0 || status === undefined || status >= 500;
      return { rotated: false, stillValid: false, transientError };
    }
  }

  // ───────────────────────── dialogs ─────────────────────────

  private openExpiredDialog(): void {
    if (this.isExpiredDialogOpen) return; // never stack a second copy
    try {
      const ref = this.dialog.open(
        SessionExpiredDialogComponent as any,
        {
          disableClose: true,
          autoFocus: false,
          restoreFocus: false,
        }
      );
      this.isExpiredDialogOpen = true;
      ref.afterClosed().subscribe(() => {
        this.isExpiredDialogOpen = false;
      });
    } catch (err) {
      console.error('Error opening session-expired dialog:', err);
    }
  }

  // ───────────────────────── logout / teardown ─────────────────────────

  public async performLogout(): Promise<void> {
    if (this.logoutInProgress) return;
    this.logoutInProgress = true;

    this.dialog.closeAll();
    this.isExpiredDialogOpen = false;

    // Capture the IG URL from localStorage BEFORE clearing anything.
    const igUrl = this.authService.getIgUrl();

    this.clearSession();
    this.syncChannel?.postMessage({ type: 'logout' });

    this.ngZone.run(async () => {
      try {
        await firstValueFrom(this.api.igLogout());
      } catch (error) {
        console.error('Logout API error:', error);
      } finally {
        // Always clear local storage and redirect, even if the logout
        // API call itself failed - a user should never get stuck unable
        // to leave a dead session because the network hiccupped.
        sessionStorage.clear();
        localStorage.clear();
        if (igUrl) {
          console.log('🚪 Logged out. Redirecting to IG URL:', igUrl);
          window.location.href = igUrl;
        } else {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /** Teardown all timers & listeners, clear UI flags. */
  public clearSession(): void {
    ['mousemove', 'keydown', 'scroll', 'click']
      .forEach(evt => window.removeEventListener(evt, this.activityListener));
    document.removeEventListener('visibilitychange', this.visibilityListener);

    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);
    clearTimeout(this.refreshTimer);

    sessionStorage.removeItem(this.ACTIVITY_WINDOW_KEY);
    sessionStorage.removeItem(this.LAST_ACTIVITY_KEY);
    sessionStorage.removeItem(this.WARNING_STARTED_KEY);
    sessionStorage.removeItem(this.STATE_KEY);

    this.sessionState$.next('active');
    this.showWarning$.next(false);
    this.isRefreshing$.next(false);
    this.autoExtendedDuringWarning = false;
    this.autoExtendedDuringExpired = false;

    // Allow a future login (without a hard page reload) to re-init cleanly.
    this.started = false;
  }
}