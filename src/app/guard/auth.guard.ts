// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { CookieService } from 'ngx-cookie-service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const cookieService = inject(CookieService);
//   const router = inject(Router);

//   // 1. Retrieve raw cookie values
//   const accessToken = cookieService.get('accessToken');
//   const roleCookie = cookieService.get('role');

//   // 2. Parse JSON cookies safely if needed
//   let role = null;
//   if (roleCookie) {
//     try {
//       role = JSON.parse(roleCookie);
//     } catch (e) {
//       console.error('Failed to parse role cookie', e);
//     }
//   }

//   // 3. Perform your authentication / authorization check
//   if (accessToken) {
//     return true; // Token exists, grant access
//   }

//   // 4. Redirect to login if unauthenticated
//   return router.createUrlTree(['/login']);
// };

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);

  // Fast local gate. Authentication is cookie/JWT based (FASM sets cookies in
  // the /validate-user response), so accept either the stored accessToken or the
  // server-set accessToken cookie. The real check happens in the session guard
  // (GET /api/tokens/validateTokens).
  const token = localStorage.getItem('accessToken');
  const cookieToken = cookieService.get('accessToken');

  const hasAuth =
    (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') ||
    (cookieToken && cookieToken !== 'null' && cookieToken !== 'undefined' && cookieToken.trim() !== '');

  if (hasAuth) return true; // Auth signal present -> allow access (session guard validates)

  console.warn('⛔ Access denied: no accessToken / accessToken cookie! Redirecting to /login');
  return router.createUrlTree(['/login']);
};