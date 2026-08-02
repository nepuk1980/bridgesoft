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

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('logitoken');

  console.log('🔍 authGuard checking path:', state.url);
  console.log('🔑 Stored logitoken:', token);

  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    return true; // Token exists -> Allow access
  }

  console.warn('⛔ Access denied: logitoken missing! Redirecting to /login');
  return router.createUrlTree(['/login']);
};