import { Injectable, NgZone, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { IgapiService } from './igapi.service';
import { AuthService } from '../core/services/auth.service';

interface RefreshResult {
  rotated: boolean;
  stillValid: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionManagerService {
  private api = inject(IgapiService);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  private dialog = inject(MatDialog);

  // Sliding activity window: dynamically sized based on INACTIVITY_LIMIT / REFRESH_INTERVAL
  private activityWindow: boolean[] = [];

  // Timers
  private activityTimer!: any;  // inactivity warning
  private warningTimer!: any;   // "stay signed in" countdown
  private refreshTimer: any;

  // Emitted when the refresh attempt reports a dead/expired session so the
  // UI layer can decide whether to prompt the user to continue or log out.
  public readonly sessionExpired$ = new Subject<void>();

  // UI state
  public showWarning$ = new BehaviorSubject<boolean>(false);
  public isRefreshing$ = new BehaviorSubject<boolean>(false);

  // Throttle user events so we only register real activity once per 5 seconds
  private readonly ACTIVITY_THROTTLE = 5_000;
  private lastActivity = 0;

  private activityListener = () => {
    const now = Date.now();

    if (now - this.lastActivity < this.ACTIVITY_THROTTLE) {
      return;
    }

    this.lastActivity = now;

    const lastIndex = Math.max(0, this.activityWindow.length - 1);
    this.activityWindow[lastIndex] = true;
    this.saveActivityWindow();

    // Reset inactivity warning on any real activity
    this.resetInactivityTimer();
  };

  // Configurable timeouts
  private readonly INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 min
  private readonly WARNING_DURATION = 5 * 60 * 1000; // 5 min
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 min

  private readonly ACTIVITY_WINDOW_KEY = 'session-manager.activityWindow';

  constructor() {
    this.initActivityWindow();
  }

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

  /** Start everything: listen for activity, kick off timers */
  public start(): void {
    this.attachListeners();
    this.resetInactivityTimer();    // warning
    this.scheduleNextRefresh();     // auto-refresh loop
  }

  /** Restart the refresh loop after a successful continuation (used after the expiry prompt). */
  public resume(): void {
    this.scheduleNextRefresh();
  }

  private attachListeners(): void {
    ['mousemove', 'keydown', 'scroll', 'click']
      .forEach((evt) => window.addEventListener(evt, this.activityListener));
  }

  /** Clear/Restart the 30-min inactivity → warning countdown */
  private resetInactivityTimer(): void {
    if (this.showWarning$.value) return; // warning already onscreen

    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);
    this.showWarning$.next(false);

    this.activityTimer = setTimeout(() => {
      this.showWarning$.next(true);

      // Start the WARNING_DURATION countdown — when it completes, ask the user
      // whether to continue or log out (single, guarded expiry prompt path).
      this.warningTimer = setTimeout(() => {
        this.showWarning$.next(false);
        this.sessionExpired$.next();
      }, this.WARNING_DURATION);
    }, this.INACTIVITY_LIMIT);
  }

  /** "Continue Session" button was clicked */
  public async staySignedIn(): Promise<void> {
    this.isRefreshing$.next(true);
    const { rotated, stillValid } = await this.attemptRefresh();
    this.isRefreshing$.next(false);

    if (rotated) {
      this.showWarning$.next(false);
      this.dialog.closeAll();
      clearTimeout(this.warningTimer);

      this.resetInactivityTimer();
      this.scheduleNextRefresh();
    } else if (!rotated && stillValid) {
      this.showWarning$.next(false);
      clearTimeout(this.warningTimer);
      this.resetInactivityTimer();
    } else {
      await this.performLogout();
    }
  }

  /** Recursive auto-refresh loop; resets itself after running */
  private scheduleNextRefresh(): void {
    clearTimeout(this.refreshTimer);

    this.refreshTimer = setTimeout(async () => {
      if (this.activityWindow.some((f) => f)) {
        // Attempt refresh only if user was active in the last interval
        const { rotated, stillValid } = await this.attemptRefresh();

        if (!rotated && !stillValid) {
          // Invalid tokens -> let the consumer decide (prompt continue / logout)
          this.showWarning$.next(false);
          this.sessionExpired$.next();
          return;
        }

        if (rotated) {
          this.saveActivityWindow();
        } else {
          // Slide the window forward
          this.activityWindow.shift();
          this.activityWindow.push(false);
          this.saveActivityWindow();
        }
      }

      this.scheduleNextRefresh();
    }, this.REFRESH_INTERVAL);
  }

  /** Calls GET /api/tokens/refresh; returns whether tokens rotated or simply still valid */
  private async attemptRefresh(): Promise<RefreshResult> {
    try {
      const resp: any = await firstValueFrom(this.api.get<any>(`tokens/refresh`));

      if (!resp || !this.authService.isSuccess(resp.success)) {
        return { rotated: false, stillValid: false };
      }

      const message = (resp.message || '').toLowerCase();

      // FASM refresh responses (per backend docs):
      //   - "Tokens rotated successfully"   -> new cookies issued
      //   - "Tokens are still valid"        -> no rotation needed
      // Any other success message defaults to "still valid" so a live session
      // is never mistaken for a dead one.
      const rotated = message.includes('rotated');
      const stillValid = !rotated;

      // Persist whatever tokens the response carries (it may contain all 3),
      // regardless of whether the backend reports "rotated" or "still valid".
      this.authService.persistAuthResponse(resp);

      // Always re-write all 3 cookies so accessToken / idToken / refreshToken
      // all exist after a refresh call, even when the response only carries one.
      this.authService.syncAuthCookies();

      // Capture any rotated cookies the server just set (cookie-based auth).
      this.authService.syncTokensFromCookies();

      return { rotated, stillValid };
    } catch (err) {
      console.error('Refresh API error:', err);
      return { rotated: false, stillValid: false };
    }
  }

  /** Logout flow: calls API, clears local session, then redirects to IG_URL. */
  public async performLogout(): Promise<void> {
    this.dialog.closeAll();
    // Capture the IG URL from localStorage before clearing anything.
    const igUrl = this.authService.getIgUrl();
    this.clearSession();
    this.ngZone.run(async () => {
      try {
        // Log out of the IG backend. The fasm /api/auth/logout call is
        // intentionally not made.
        await firstValueFrom(this.api.igLogout());
      } catch (error) {
        console.error('Logout API error:', error);
      }
      // After logout, redirect the browser to the IG URL stored in localStorage.
      if (igUrl) {
        console.log('🚪 Logged out. Redirecting to IG URL:', igUrl);
        window.location.href = igUrl;
        return;
      }
      console.log('🚪 Logged out. No IG URL in localStorage - staying on the current URL.');
    });
  }

  /** Resume the session after the expired-dialog's checkTokens+refresh succeeded */
  public resumeAfterCheck(): void {
    this.showWarning$.next(false);
    try { this.resetInactivityTimer(); } catch (e) { console.warn(e); }
    try { this.scheduleNextRefresh(); } catch (e) { console.warn(e); }
  }

  /** Teardown all timers & listeners, clear UI flags */
  public clearSession(): void {
    ['mousemove', 'keydown', 'scroll', 'click']
      .forEach((evt) => window.removeEventListener(evt, this.activityListener));

    clearTimeout(this.activityTimer);
    clearTimeout(this.warningTimer);
    clearTimeout(this.refreshTimer);

    this.showWarning$.next(false);
    this.isRefreshing$.next(false);

    sessionStorage.removeItem(this.ACTIVITY_WINDOW_KEY);
    this.activityWindow = [];
  }
}
