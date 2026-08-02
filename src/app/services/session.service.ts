import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { IgapiService } from '../services/igapi.service';
import { Observable, tap, catchError, throwError, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private api = inject(IgapiService);
  private cookie = inject(CookieService);
  private router = inject(Router);

  private sessionTimer: any;
  private isPrompting = false;
  private isLoggingOut = false; // 🔒 Guard flag to prevent duplicate logout calls

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

  private setCookie(name: string, value: string, expiresDays = 1): void {
    this.cookie.set(name, value, expiresDays, '/', undefined, false, 'Lax');
  }

  isTokenValidLocally(): boolean {
    const activeToken = localStorage.getItem('logitoken') ||
      this.cookie.get('accessToken') ||
      this.cookie.get('idToken');

    if (!activeToken || activeToken === 'null' || activeToken === 'undefined') {
      return false;
    }

    const expTime = this.getTokenExpirationTime(activeToken);
    if (!expTime) return true;

    return Date.now() < expTime;
  }

  public startSessionTimer(): void {
    this.clearSessionTimer();
    this.isPrompting = false;
    this.isLoggingOut = false;

    if (!this.isTokenValidLocally()) {
      console.warn('Token is expired or missing. Redirecting to login...');
      this.logoutAndRedirect();
      return;
    }

    const activeToken = localStorage.getItem('logitoken') ||
      this.cookie.get('accessToken') ||
      this.cookie.get('idToken');

    const expTime = this.getTokenExpirationTime(activeToken!);
    const currentTime = Date.now();

    let timeUntilCheck = 13 * 60 * 1000;

    if (expTime) {
      const warningBufferMs = 60 * 1000;
      timeUntilCheck = expTime - currentTime - warningBufferMs;
    }

    if (timeUntilCheck <= 0) {
      this.checkSessionWithApi();
      return;
    }

    this.sessionTimer = setTimeout(() => {
      this.checkSessionWithApi();
    }, timeUntilCheck);
  }

  public clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  public validateTokenOnRouteChange(): Observable<boolean> {
    return this.api.get<any>('token/checkTokens').pipe(
      map((res) => {
        if (res && res.success !== false) {
          return true;
        }
        this.checkSessionWithApi();
        return false;
      }),
      catchError((err) => {
        console.warn('⛔ Token check failed on route change:', err);
        this.checkSessionWithApi();
        return of(false);
      })
    );
  }

  public checkSessionWithApi(): void {
    if (this.isPrompting || this.isLoggingOut) return;
    this.isPrompting = true;
    this.clearSessionTimer();

    setTimeout(() => {
      // const wantsToContinue = window.confirm(
      //   'Your session is about to expire. Click OK to refresh your session or Cancel to log out.'
      // );
      const wantsToContinue = window.alert(
        'Your session is about to expire. Click OK to log out.'
      );
      this.logoutAndRedirect();

      // if (wantsToContinue) {
      //   console.log('✅ User chose to refresh the session. Calling refresh endpoint.');
      //   this.refreshTokenObservable().subscribe({
      //     next: () => {
      //       console.log('Session refreshed successfully via API.');
      //       this.isPrompting = false;
      //     },
      //     error: (err) => {
      //       console.error('API token refresh failed:', err);
      //       this.logoutAndRedirect();
      //     }
      //   });
      // } else {
      //   console.log('❌ User declined extension. Logging out...');
      //   this.logoutAndRedirect();
      // }
    }, 100);
  }

  public refreshTokenObservable(): Observable<any> {
    // Calls GET /api/token/refresh (cookies sent automatically via withCredentials).
    // Do not require JS-accessible refresh token cookie; the backend may use HttpOnly cookies.
    console.log('➡️ Calling token/refresh using cookie-based authentication.');
    return this.api.get<any>('token/refresh').pipe(
      tap((res) => {
        if (res) {
          // 1. Store updated logitoken / Bearer token
          const newToken = res.accessToken || res.token || res.idToken || res.logitoken;
          // if (newToken) {
          //   localStorage.setItem('logitoken', newToken);
          // }

          // 2. Update refreshToken cookie if backend rotated the token
          if (res.refreshToken) {
            this.setCookie('refreshToken', res.refreshToken, 7);
          }
          if (res.accessToken) {
            this.setCookie('accessToken', res.accessToken, 1);
          }
          if (res.idToken) {
            this.setCookie('idToken', res.idToken, 1);
          }

          this.isPrompting = false;
          this.startSessionTimer();
        }
      }),
      catchError((err) => {
        console.error('⛔ Refresh API call failed:', err);
        // Only logout IF the refresh token endpoint explicitly fails from server
        this.logoutAndRedirect();
        return throwError(() => err);
      })
    );
  }

  public logoutAndRedirect(): void {
    if (this.isLoggingOut) return; // Prevent duplicate /logout calls
    this.isLoggingOut = true;

    this.clearSessionTimer();
    this.isPrompting = false;

    this.api.post<any>('auth/logout', {}).subscribe({
      next: () => console.log('Successfully logged out from server.'),
      error: (err) => console.warn('Server logout response:', err),
      complete: () => this.clearStorageAndNavigate()
    });
  }

  private clearStorageAndNavigate(): void {
    this.cookie.deleteAll('/');
    localStorage.clear();
    this.isLoggingOut = false;
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}