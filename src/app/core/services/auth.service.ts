import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, filter, take, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

export interface AuthTokens {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private cookie = inject(CookieService);
  private router = inject(Router);

  private API = environment.fasmUrl;
  private username = environment.username;
  private password = environment.password;

  private token: string | null = this.getStoredToken();
  private tokenSubject = new BehaviorSubject<string | null>(this.token);

  private getStoredToken(): string | null {
    const fromLocalStorage = localStorage.getItem('accessToken');
    if (fromLocalStorage && fromLocalStorage !== 'null' && fromLocalStorage !== 'undefined' && fromLocalStorage.trim() !== '') {
      return fromLocalStorage;
    }

    const fromCookie = this.cookie.get('accessToken');
    if (fromCookie && fromCookie !== 'null' && fromCookie !== 'undefined' && fromCookie.trim() !== '') {
      return fromCookie;
    }

    return null;
  }

  private setCookie(name: string, value: string, expiresDays = 1): void {
    this.cookie.set(name, value, expiresDays, '/', undefined, false, 'Lax');
  }

  private clearCookie(name: string): void {
    this.cookie.delete(name, '/');
    document.cookie = `${name}=; Path=/; Max-Age=0`;
  }

  private extractTokenValue(payload: any, keys: string[]): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const lowerToKey: Record<string, string> = {};
    for (const k of Object.keys(payload)) {
      lowerToKey[k.toLowerCase()] = k;
    }

    for (const key of keys) {
      const actualKey = lowerToKey[key.toLowerCase()];
      const value = actualKey ? payload[actualKey] : null;
      if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
      }
    }

    return null;
  }

  /**
   * Recursively searches the payload (including nested `data` / `result`
   * objects) for the first non-empty value matching any of the given keys.
   * Many backends nest tokens under `data`, `result`, `response`, etc.
   */
  private findTokenValue(payload: any, keys: string[]): string | null {
    const direct = this.extractTokenValue(payload, keys);
    if (direct) return direct;

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    for (const value of Object.values(payload)) {
      if (value && typeof value === 'object') {
        const found = this.findTokenValue(value, keys);
        if (found) return found;
      }
    }

    return null;
  }

  private parseResponsePayload(response: unknown): any {
    if (!response) {
      return null;
    }

    if (typeof response === 'string') {
      const trimmed = response.trim();
      if (!trimmed) {
        return null;
      }

      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          return JSON.parse(trimmed);
        } catch {
          return trimmed;
        }
      }

      return trimmed;
    }

    return response;
  }

  public persistAuthResponse(response: unknown): void {
    const payload = this.parseResponsePayload(response);

    const accessToken = this.findTokenValue(payload, ['accessToken', 'access_token', 'token', 'jwt']);
    const idToken = this.findTokenValue(payload, ['idToken', 'id_token']);
    const refreshToken = this.findTokenValue(payload, ['refreshToken', 'refresh_token']);

    console.log('🔎 persistAuthResponse payload:', payload);
    console.log('🔎 Extracted -> accessToken:', accessToken ? 'FOUND' : 'null', '| idToken:', idToken ? 'FOUND' : 'null', '| refreshToken:', refreshToken ? 'FOUND' : 'null');

    // Fallback if raw text string was returned instead of JSON object
    const primaryToken = accessToken || (typeof payload === 'string' ? payload : null);

    if (primaryToken) {
      this.setAccessToken(primaryToken);
    }

    if (idToken) {
      this.setIdToken(idToken);
    }

    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }

    // Ensure all 3 cookies exist. Any token missing from this response falls
    // back to the currently stored (localStorage / existing cookie) value.
    this.syncAuthCookies();
  }

  login(): Observable<any> {
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
          headers,
          responseType: 'text',
        },
      )
      .pipe(
        tap((response: any) => {
          this.persistAuthResponse(response);
        }),
      );
  }

  /**
   * Explicitly write the idToken / accessToken / refreshToken cookies from a
   * validateTokens response, mirroring the backend's Set-Cookie attributes:
   *
   *   idToken=...; Path=/; Max-Age=2110; SameSite=Strict
   *   accessToken=...; Path=/; Max-Age=2110; SameSite=Strict
   *   refreshToken=...; Path=/; Max-Age=604800; SameSite=Strict
   *
   * (HttpOnly is set by the server only and cannot be set from JS.) The
   * response may carry the tokens at the top level or nested under `data` /
   * `result`; this extracts whatever is present and writes the cookies.
   */
  public setTokensFromValidateResponse(response: unknown): void {
    const payload = this.parseResponsePayload(response);

    const accessToken = this.findTokenValue(payload, ['accessToken', 'access_token', 'token', 'jwt']);
    const idToken = this.findTokenValue(payload, ['idToken', 'id_token']);
    const refreshToken = this.findTokenValue(payload, ['refreshToken', 'refresh_token']);

    console.log('🔎 validateTokens -> accessToken:', accessToken ? 'FOUND' : 'null', '| idToken:', idToken ? 'FOUND' : 'null', '| refreshToken:', refreshToken ? 'FOUND' : 'null');

    if (accessToken) {
      this.setAccessToken(accessToken);
      this.setValidateTokenCookie('accessToken', accessToken, 2110);
    }
    if (idToken) {
      this.setIdToken(idToken);
      this.setValidateTokenCookie('idToken', idToken, 2110);
    }
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
      this.setValidateTokenCookie('refreshToken', refreshToken, 604800);
    }

    // Guarantee all 3 cookies exist after the validate-token call.
    this.syncAuthCookies();
  }

  /**
   * Write one of the validate-token cookies with the backend's attributes:
   * Path=/; Max-Age=<seconds>; SameSite=Strict.
   *
   * If a cookie with the same identifier already exists, it is updated in
   * place (old value overwritten) instead of creating a duplicate cookie.
   */
  private setValidateTokenCookie(name: string, value: string, maxAgeSeconds: number): void {
    this.clearCookie(name);
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Strict`;
  }

  /**
   * Update (or create) a value for an identifier in localStorage + cookie.
   * When the identifier already exists, only its value is refreshed with the
   * current one - a new key/cookie is never created for the same name.
   */
  private upsertToken(identifier: string, value: string, cookieDays?: number): void {
    localStorage.setItem(identifier, value);
    this.clearCookie(identifier);
    this.setCookie(identifier, value, cookieDays);
  }

  // --- Dedicated Token Setters ---

  setAccessToken(token: string): void {
    this.token = token;
    this.upsertToken('accessToken', token);
    this.tokenSubject.next(token);
  }

  setIdToken(token: string): void {
    this.upsertToken('idToken', token);
  }

  setRefreshToken(token: string): void {
    this.upsertToken('refreshToken', token, 7);
  }

  setSession(accessToken: string, idToken?: string, refreshToken?: string): void {
    if (accessToken) this.setAccessToken(accessToken);
    if (idToken) this.setIdToken(idToken);
    if (refreshToken) this.setRefreshToken(refreshToken);
  }

  // --- Token Getters ---

  getAccessToken(): string | null {
    return this.token || this.getStoredToken();
  }

  getIdToken(): string | null {
    const fromStorage = localStorage.getItem('idToken');
    if (fromStorage && fromStorage !== 'null' && fromStorage !== 'undefined') {
      return fromStorage;
    }
    const fromCookie = this.cookie.get('idToken');
    return (fromCookie && fromCookie !== 'null' && fromCookie !== 'undefined') ? fromCookie : null;
  }

  getRefreshToken(): string | null {
    const fromStorage = localStorage.getItem('refreshToken');
    if (fromStorage && fromStorage !== 'null' && fromStorage !== 'undefined') {
      return fromStorage;
    }
    const fromCookie = this.cookie.get('refreshToken');
    return (fromCookie && fromCookie !== 'null' && fromCookie !== 'undefined') ? fromCookie : null;
  }

  // Convenience helper to retrieve all 3 tokens at once
  getAllTokens(): AuthTokens {
    return {
      accessToken: this.getAccessToken(),
      idToken: this.getIdToken(),
      refreshToken: this.getRefreshToken(),
    };
  }

  /**
   * Ensure all 3 tokens are persisted as cookies. The refresh endpoint response
   * may only contain the new access token, so any missing cookie is re-written
   * from the currently stored (localStorage / existing cookie) value.
   */
  public syncAuthCookies(): void {
    const tokens = this.getAllTokens();
    if (tokens.accessToken) this.setAccessToken(tokens.accessToken);
    if (tokens.idToken) this.setIdToken(tokens.idToken);
    if (tokens.refreshToken) this.setRefreshToken(tokens.refreshToken);
  }

  /**
   * Capture any session tokens the server set as JS-readable cookies
   * (e.g. after /validate-user or /validateTokens) into localStorage, so the
   * Bearer JWT flow and refresh query string stay in sync even when the
   * response body does not carry the tokens.
   */
  public syncTokensFromCookies(): void {
    const access = this.cookie.get('accessToken');
    const id = this.cookie.get('idToken');
    const refresh = this.cookie.get('refreshToken');

    if (access && access !== 'null' && access !== 'undefined' && access.trim() !== '') {
      this.setAccessToken(access);
    }
    if (id && id !== 'null' && id !== 'undefined' && id.trim() !== '') {
      this.setIdToken(id);
    }
    if (refresh && refresh !== 'null' && refresh !== 'undefined' && refresh.trim() !== '') {
      this.setRefreshToken(refresh);
    }
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  // --- IG_URL backup helpers ---

  private readonly IG_URL_KEY = 'igUrl';

  /** Normalizes boolean-ish values ("true"/true, "false"/false) from backend responses. */
  isSuccess(value: any): boolean {
    return value === true || value === 'true' || value === 'TRUE';
  }

  setIgUrl(url: string | null | undefined): void {
    const clean = url && url.trim() ? url.trim() : null;
    if (clean) {
      localStorage.setItem(this.IG_URL_KEY, clean);
      this.setCookie(this.IG_URL_KEY, clean);
    }
  }

  getIgUrl(): string {
    let stored = localStorage.getItem(this.IG_URL_KEY);
    if (!stored || stored.trim() === '' || stored === 'null' || stored === 'undefined') {
      stored = this.cookie.get(this.IG_URL_KEY);
    }
    if (stored && stored.trim() !== '' && stored !== 'null' && stored !== 'undefined') {
      return stored.trim();
    }
    // First login / nothing stored yet -> fall back to the env-configured IG URL
    return environment.igUrl || '';
  }

  clearIgUrl(): void {
    localStorage.removeItem(this.IG_URL_KEY);
    this.clearCookie(this.IG_URL_KEY);
  }

  /**
   * Failure fallback. IG_URL is still captured as a backup variable (setIgUrl),
   * but the app never navigates to an external URL - it stays inside the SPA
   * and routes the user to the internal /login page instead.
   */
  redirectToIgUrl(url?: string | null): void {
    if (url && url.trim()) {
      console.warn(`⛔ Authentication/session failed (IG_URL was: ${url.trim()}). Navigating to /login instead.`);
    }
    this.router.navigate(['/login']);
  }

  // --- Browser-storage backup for the login response ---

  private readonly SESSION_DATA_KEY = 'authSessionData';

  /**
   * Store the full login / validate-user response into browser storage
   * (localStorage). The backend response carries success, authenticated,
   * message and IG_URL; keeping it in storage lets later flows read the backup
   * without another API call. Tokens delivered via cookies are captured
   * separately by syncTokensFromCookies().
   */
  public persistSessionData(response: unknown): void {
    if (!response || typeof response !== 'object') {
      return;
    }
    try {
      localStorage.setItem(this.SESSION_DATA_KEY, JSON.stringify(response));
    } catch (err) {
      console.warn('Failed to persist session data:', err);
    }
  }

  public getSessionData(): any {
    try {
      const raw = localStorage.getItem(this.SESSION_DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // --- Cleanup ---

  /**
   * Clear every token/session cookie (localStorage + cookies) on logout.
   * Cookies are deleted through both ngx-cookie-service and document.cookie so
   * the JS-written (SameSite=Strict) cookies are removed as well.
   */
  clearTokenCookies(): void {
    const names = ['accessToken', 'idToken', 'refreshToken', 'basicAuth', this.IG_URL_KEY];
    for (const name of names) {
      this.clearCookie(name);
    }
  }

  clearSession(): void {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('basicAuth');
    localStorage.removeItem('user');
    localStorage.removeItem('launchCode');
    localStorage.removeItem('fasmSessionId');
    localStorage.removeItem(this.SESSION_DATA_KEY);

    this.clearTokenCookies();

    this.tokenSubject.next(null);
  }

  waitForToken(): Observable<string> {
    return this.tokenSubject.pipe(
      filter((t) => t !== null),
      take(1),
    ) as Observable<string>;
  }
}