import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // 🚫 1. For LOGIN and REFRESH calls, explicitly remove any Authorization header
  const isLoginRoute = req.url.includes('/auth/login') || req.url.includes('/login');
  const isRefreshRoute = req.url.includes('token/refresh');

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

  // 🔑 2. Get the latest logitoken directly from localStorage
  const rawToken = localStorage.getItem('logitoken');

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