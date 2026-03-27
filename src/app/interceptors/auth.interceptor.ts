import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // ❌ Skip login API
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = authService.getToken();

  // ✅ If token exists
  if (token) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }

  // 🔁 Wait for token
  return authService.waitForToken().pipe(
    switchMap((newToken) => {
      return next(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        }),
      );
    }),
  );
};
