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
import { CanActivateFn } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const sessionService = inject(SessionService);

  const token = localStorage.getItem('accessToken');
  const cookieToken = cookieService.get('accessToken');

  const hasAuth =
    (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') ||
    (cookieToken && cookieToken !== 'null' && cookieToken !== 'undefined' && cookieToken.trim() !== '');

  if (hasAuth || sessionService.isTokenValidated()) return true;

  // No local token found. On page refresh, HttpOnly cookies may still be valid
  // but JS cannot read them. Let the session guard (validateTokens API) decide
  // whether the server-side session is real. If valid the user stays on the
  // current page; if not, the session guard handles the expiry flow.
  return true;
};