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

  // 🔁 If token exists AND expired → auto refresh
  if (token && authService.isTokenExpired()) {
    return authService.refreshToken().pipe(
      switchMap((newToken) => {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return next(clonedReq);
      }),
    );
  }

  // ✅ If token exists → attach
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  // 🟡 First time → auto login
  return authService.refreshToken().pipe(
    switchMap((newToken) => {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      return next(clonedReq);
    }),
  );
};
