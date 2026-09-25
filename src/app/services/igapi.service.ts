import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IgapiService {
  private http = inject(HttpClient);
  private cookie = inject(CookieService);
  private fasmBase = `${environment.fasmUrl}/api`;

  post<T>(endpoint: string, body?: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.fasmBase}/${endpoint}`;
    console.log('IG API POST ->', url);
    return this.http.post<T>(url, body, {
      headers,
      withCredentials: true
    });
  }

  get<T>(endpoint: string): Observable<T> {
    const url = `${this.fasmBase}/${endpoint}`;
    console.log('IG API GET ->', url);
    return this.http.get<T>(url, {
      withCredentials: true
    });
  }

  /** Logout: GET {fasmUrl}/api/auth/logout - the base URL is igUrl, not fasm. */
  igLogout(): Observable<any> {
    const url = `${environment.fasmUrl}/api/auth/logout`;

    // Pass the session cookie along in the request header. The browser cookie
    // (e.g. basicAuth / accessToken set by the IG backend) is read from the
    // CookieService and attached as a request header. withCredentials also
    // sends the cookies themselves automatically.
    const basicAuth = this.cookie.get('basicAuth');
    const accessToken = this.cookie.get('accessToken');
    const headers = new HttpHeaders({
      ...(basicAuth ? { Authorization: `Basic ${basicAuth}` } : {}),
      ...(accessToken ? { 'X-Access-Token': accessToken } : {}),
    });

    console.log('IG API GET ->', url);
    return this.http.get<any>(url, {
      headers,
      withCredentials: true
    });
  }
}