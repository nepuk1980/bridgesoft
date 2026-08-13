import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

export interface FasmLaunchResponse {
  newSession: boolean;
  success: boolean;
  launch_code: string;
  fasm_session_id?: string;
  fasm_url: string;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class IgapiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private fasmBase = `${environment.fasmUrl}/api`;
  private igBase = `${environment.igUrl}/api`;

  private resolveBase(endpoint: string): string {
    if (endpoint === 'auth/login' || endpoint === 'auth/fasm/launch') {
      return this.igBase;
    }
    return this.fasmBase;
  }

  /**
   * After login, request a fresh launch_code from IG. Authenticated with the
   * access token as a Bearer header and the target user in the body.
   */
  fasmLaunch<T = FasmLaunchResponse>(user: string): Observable<T> {
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    return this.post<T>('auth/fasm/launch', { user }, headers);
  }

  post<T>(endpoint: string, body?: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.resolveBase(endpoint)}/${endpoint}`;
    console.log('IG API POST ->', url);
    return this.http.post<T>(url, body, {
      headers,
      withCredentials: true
    });
  }

  get<T>(endpoint: string): Observable<T> {
    const url = `${this.resolveBase(endpoint)}/${endpoint}`;
    console.log('IG API GET ->', url);
    return this.http.get<T>(url, {
      withCredentials: true
    });
  }

  /** Logout against the IG base (http://18.145.144.177:8080/api/auth/logout). */
  igLogout(): Observable<any> {
    const url = `${this.igBase}/auth/logout`;
    const basicAuth = localStorage.getItem('basicAuth');
    const headers = new HttpHeaders(
      basicAuth && basicAuth !== 'null' && basicAuth !== 'undefined'
        ? { Authorization: `Basic ${basicAuth}` }
        : {}
    );
    console.log('IG API POST ->', url);
    return this.http.post<any>(url, {}, {
      headers,
      withCredentials: true
    });
  }
}