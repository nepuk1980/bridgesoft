// src/app/interceptors/validate-session.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, throwError } from 'rxjs';

import { SessionManagerService } from '../services/session-manager.service';

const SKIP_ENDPOINTS = [
  'tokens/validateTokens',
  'auth/validate-user',
  'tokens/refresh',
  'token/refresh',
  'auth/logout',
  'auth/login',
  'auth/igLogin',
  'auth/iglogin',
];

/**
 * Gate every secured API call behind GET /api/tokens/validateTokens so the
 * session is always validated BEFORE the request is sent. This guarantees the
 * ordering on route changes, inner-page loads, pagination, filters and action
 * buttons alike: validateTokens first, the actual data call second. On an
 * invalid session the SessionManagerService logs out and redirects to the
 * stored IG URL.
 *
 * Auth/validation endpoints themselves are exempt to avoid recursion, and
 * requests made during the pre-session phases (launch / loading / login) run
 * untouched so we never fight the SSO handshake. NOTE: there is deliberately
 * no readable-token gate - the session may live in HttpOnly cookies that JS
 * cannot read, so the route is used to detect the pre-session phase instead.
 */
export const validateSessionInterceptor: HttpInterceptorFn = (req, next) => {
  if (SKIP_ENDPOINTS.some((s) => req.url.includes(s))) {
    return next(req);
  }

  // Pre-session UI phases perform their own token/SSO handshake.
  const router = inject(Router);
  const currentUrl = router.url;
  if (currentUrl === '/login' || currentUrl.startsWith('/launch') || currentUrl === '/loading') {
    return next(req);
  }

  const sessionManager = inject(SessionManagerService);

  // A logout is already tearing the app down - abort straggler requests.
  if (sessionManager.loggingOut) {
    return throwError(() => new Error('Session is logging out'));
  }

  return sessionManager.validateAndContinue().pipe(
    switchMap((valid) => {
      if (!valid) {
        // Dead session - the logout + IG redirect is already in flight.
        return throwError(() => new Error('Session invalid'));
      }
      return next(req);
    })
  );
};