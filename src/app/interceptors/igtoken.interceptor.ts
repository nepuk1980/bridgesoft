import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { SessionService } from '../services/session.service';
import { catchError, throwError } from 'rxjs';

export const igtokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const sessionService = inject(SessionService);

  const logitoken = localStorage.getItem('logitoken');
  const basicAuthCookie = cookieService.get('basicAuth');
  const basicAuthStorage = localStorage.getItem('basicAuth');
  const basicAuth = basicAuthStorage && basicAuthStorage !== 'null' && basicAuthStorage !== 'undefined'
    ? basicAuthStorage
    : basicAuthCookie;

  const headers: Record<string, string> = {};

  // 🛑 Do NOT attach Authorization header if calling /token/refresh
  const isRefreshEndpoint = req.url.includes('token/refresh');

  let authReq = req;
  if (!isRefreshEndpoint) {
    if (logitoken && logitoken !== 'null' && logitoken !== 'undefined' && logitoken.trim() !== '') {
      headers['Authorization'] = `Bearer ${logitoken}`;
    } else if (basicAuth && basicAuth !== 'null' && basicAuth !== 'undefined') {
      headers['Authorization'] = `Basic ${basicAuth}`;
    }

    authReq = req.clone({
      withCredentials: true,
      setHeaders: headers
    });
  } else {
    const cleanHeaders = req.headers
      .delete('Authorization');

    authReq = req.clone({
      withCredentials: true,
      headers: cleanHeaders
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. If non-refresh endpoint returns 401, trigger prompt
      if (
        error.status === 401 &&
        !req.url.includes('token/refresh') &&
        !req.url.includes('auth/login') &&
        !req.url.includes('auth/logout')
      ) {
        console.warn('⛔ 401 Unauthorized encountered on endpoint:', req.url);
        sessionService.checkSessionWithApi();
        return throwError(() => error);
      }

      // 2. If /token/refresh itself fails with 401, force logout
      if (error.status === 401 && req.url.includes('token/refresh')) {
        console.error('⛔ token/refresh failed on server. Logging out...');
        sessionService.logoutAndRedirect();
      }

      return throwError(() => error);
    })
  );
};