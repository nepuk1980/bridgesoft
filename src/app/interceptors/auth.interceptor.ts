import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 🚫 1. For LOGIN and REFRESH calls, explicitly remove any Authorization header
  const isLoginRoute = req.url.includes('/auth/login') || req.url.includes('/login');
  const isRefreshRoute = req.url.includes('token/refresh') || req.url.includes('tokens/refresh');

  // 🍪 validate-user authenticates via the session cookies only - never send an
  // Authorization header for it.
  const isValidateUserRoute = req.url.includes('auth/validate-user');

  // 🍪 validateTokens authenticates via the session cookies only - the cookie is
  // attached by the browser (withCredentials) and no Authorization header is used.
  const isValidateTokensRoute = req.url.includes('tokens/validateTokens') || req.url.includes('token/checkTokens');

  if (isValidateUserRoute) {
    const cleanHeaders = req.headers
      .delete('Authorization')
      .set('X-Requested-With', 'XMLHttpRequest');

    const cleanReq = req.clone({
      headers: cleanHeaders,
      withCredentials: true
    });

    return next(cleanReq);
  }

  if (isValidateTokensRoute) {
    const cleanHeaders = req.headers
      .delete('Authorization')
      .set('X-Requested-With', 'XMLHttpRequest');

    const cleanReq = req.clone({
      headers: cleanHeaders,
      withCredentials: true
    });

    return next(cleanReq);
  }

  if (isRefreshRoute) {
    const cleanHeaders = req.headers
      .delete('Authorization')
      .set('X-Requested-With', 'XMLHttpRequest');

    const cleanReq = req.clone({
      headers: cleanHeaders,
      withCredentials: true
    });

    return next(cleanReq);
  }

  if (isLoginRoute) {
    const hasAuth = req.headers.has('Authorization');
    const headers = hasAuth
      ? req.headers.set('X-Requested-With', 'XMLHttpRequest')
      : req.headers.delete('Authorization').set('X-Requested-With', 'XMLHttpRequest');

    const cleanReq = req.clone({
      headers,
      withCredentials: true
    });

    return next(cleanReq);
  }

  // 🔑 2. Get the latest accessToken directly from localStorage
  const rawToken = localStorage.getItem('accessToken');

  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (!isRefreshRoute && rawToken) {
    // Clean token string to ensure 'Bearer ' is not duplicated if already included in localStorage
    const cleanToken = rawToken.replace(/^Bearer\s+/i, '').trim();

    // Set the new Bearer Authorization header
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }

  const authorizedReq = req.clone({ setHeaders: headers });
  return next(authorizedReq);
};