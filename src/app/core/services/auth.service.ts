import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private API = environment.apiUrl;
  private username = environment.username;
  private password = environment.password;

  // Auto-load token from localStorage on app startup
  private token: string | null = localStorage.getItem('logitoken');
  private tokenSubject = new BehaviorSubject<string | null>(this.token);

  // 🔐 Secondary LOGIN (Clean request - NO Authorization header sent)
  login(): Observable<string> {
    const headers = new HttpHeaders({
      'X-Requested-With': 'XMLHttpRequest',
    });

    return this.http
      .post(
        `${this.API}/auth/login`,
        {
          username: this.username,
          password: this.password,
        },
        {
          headers: headers,
          responseType: 'text',
        },
      )
      .pipe(
        tap((newToken: string) => {
          // 💾 Save new token as 'logitoken'
          this.setSession(newToken);
          localStorage.setItem('logitoken', newToken);
        }),
      );
  }

  // Save token into memory and localStorage, then notify listeners
  setSession(token: string): void {
    this.token = token;
    localStorage.setItem('logitoken', token);
    this.tokenSubject.next(token);
  }

  // Retrieve current token
  getToken(): string | null {
    return this.token || localStorage.getItem('logitoken');
  }

  // Clear session on logout
  // clearSession(): void {
  //   this.token = null;
  //   localStorage.removeItem('logitoken');
  //   this.tokenSubject.next(null);
  // }

  waitForToken(): Observable<string> {
    return this.tokenSubject.pipe(
      filter((t) => t !== null),
      take(1),
    ) as Observable<string>;
  }
}