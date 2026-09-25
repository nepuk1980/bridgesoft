import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, throwError } from 'rxjs';

export const igtokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);

  const logitoken = localStorage.getItem('accessToken');
  const accessTokenCookie = cookieService.get('accessToken');
  const basicAuthCookie = cookieService.get('basicAuth');
  const basicAuthStorage = localStorage.getItem('basicAuth');
  const basicAuth = basicAuthStorage && basicAuthStorage !== 'null' && basicAuthStorage !== 'undefined'
    ? basicAuthStorage
    : basicAuthCookie;

  const headers: Record<string, string> = {};

  // 🛑 Do NOT attach Authorization header when calling refresh endpoints
  const isRefreshEndpoint = req.url.includes('token/refresh') || req.url.includes('tokens/refresh');

  // 🍪 validate-user authenticates via the session cookies only - never send
  // an Authorization header for it.
  const isValidateUserEndpoint = req.url.includes('auth/validate-user');

  // 🍪 validateTokens authenticates via the session cookies only - the cookie is
  // attached by the browser (withCredentials) and no Authorization header is used.
  const isValidateTokensEndpoint = req.url.includes('tokens/validateTokens');

  // Respect an explicitly supplied Authorization header (e.g. the access token
  // passed on validate-user) instead of overriding it.
  const existingAuth = req.headers.get('Authorization');

  const hasLogitoken = logitoken && logitoken !== 'null' && logitoken !== 'undefined' && logitoken.trim() !== '';
  const hasAccessCookie = accessTokenCookie && accessTokenCookie !== 'null' && accessTokenCookie !== 'undefined' && accessTokenCookie.trim() !== '';

  let authReq = req;
  if (isValidateUserEndpoint) {
    // Cookie-only authentication - strip any Authorization header.
    const cleanHeaders = req.headers.delete('Authorization');
    authReq = req.clone({ withCredentials: true, headers: cleanHeaders });
  } else if (isValidateTokensEndpoint) {
    // Cookie-only authentication - no Authorization header. The browser attaches
    // the session cookies automatically via withCredentials.
    authReq = req.clone({ withCredentials: true });
  } else if (!isRefreshEndpoint) {
    if (!existingAuth && hasLogitoken) {
      headers['Authorization'] = `Bearer ${logitoken}`;
    } else if (!existingAuth && hasAccessCookie) {
      // Fall back to the accessToken cookie (as requested for validate-user).
      headers['Authorization'] = `Bearer ${accessTokenCookie}`;
    } else if (!existingAuth && basicAuth && basicAuth !== 'null' && basicAuth !== 'undefined') {
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
      const url = req.url;

      // 🔁 A refresh endpoint failure is handled by the caller (session manager /
      // expiry dialog). Do NOT hard-redirect here, otherwise the expiry dialog is
      // closed mid-flight and the user is bounced to IG without a chance to respond.
      if (url.includes('token/refresh') || url.includes('tokens/refresh')) {
        console.error('⛔ token refresh failed:', error.status, url);
        return throwError(() => error);
      }

      // Session lifecycle (dead/expired session detection) is handled by the
      // SessionManagerService background refresh loop - no fallback here.
      return throwError(() => error);
    })
  );
};
