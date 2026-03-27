import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  filter,
  take,
  tap,
  catchError,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private API = environment.apiUrl;
  private username = environment.username;
  private password = environment.password;

  // ✅ ADDED (in-memory token)
  private token: string | null = null;

  // ✅ ADDED (for waiting requests)
  private tokenSubject = new BehaviorSubject<string | null>(null);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // 🔐 LOGIN
  login(): Observable<string> {
    return this.http
      .post(
        `${this.API}/auth/login`,
        {
          username: this.username,
          password: this.password,
        },
        {
          responseType: 'text',
        },
      )
      .pipe(
        tap((token: string) => {
          this.setSession(token); // ✅ IMPORTANT FIX
        }),
      );
  }

  // 💾 Save token
  setSession(token: string) {
    this.token = token;

    // ✅ notify waiting requests
    this.tokenSubject.next(token);
  }

  // ✅ ADDED
  getToken(): string | null {
    return this.token;
  }

  // ⏱ Expiry check (keep if you want)
  isTokenExpired(): boolean {
    return false; // optional (you can customize)
  }

  // 🔁 Refresh token
  refreshToken(): Observable<string> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.login().pipe(
        tap((token: string) => {
          this.isRefreshing = false;

          this.setSession(token);
          this.refreshTokenSubject.next(token);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          return throwError(() => err);
        }),
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
      ) as Observable<string>;
    }
  }

  // ✅ ADDED (fix for interceptor)
  waitForToken(): Observable<string> {
    return this.tokenSubject.pipe(
      filter((t) => t !== null),
      take(1),
    ) as Observable<string>;
  }
}
