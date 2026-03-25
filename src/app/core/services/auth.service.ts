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

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // 🔐 LOGIN → API returns plain text token
  login(): Observable<string> {
    return this.http.post(
      `${this.API}/auth/login`,
      {
        username: this.username,
        password: this.password,
      },
      {
        responseType: 'text', // 🔥 VERY IMPORTANT FIX
      },
    );
  }

  // 💾 Save token + expiry
  setSession(token: string) {
    localStorage.setItem('token', token);

    // ⏱ 2 hours expiry
    localStorage.setItem(
      'token_expiry',
      (Date.now() + 2 * 60 * 60 * 1000).toString(),
    );
  }

  // 🔍 Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ⏱ Expiry check (refresh 1 min early)
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('token_expiry');
    return !expiry || Date.now() > +expiry - 60000;
  }

  // 🔁 Refresh token (single call, queue safe)
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

          console.error('❌ Refresh token failed', err);

          // Optional cleanup
          localStorage.removeItem('token');
          localStorage.removeItem('token_expiry');

          return throwError(() => err);
        }),
      );
    } else {
      // ⏳ Wait for ongoing refresh
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
      ) as Observable<string>;
    }
  }
}
