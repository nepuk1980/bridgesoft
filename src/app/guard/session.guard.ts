// src/app/guard/session.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { of } from 'rxjs';

import { SessionManagerService } from '../services/session-manager.service';

// Prevents duplicate concurrent validations / double logout when the parent
// and child route guards both fire on the same navigation.
let logoutTriggered = false;

/**
 * Gates entry into the protected shell and (re-)ignites the session
 * lifecycle (activity/inactivity tracking + background refresh loop).
 *
 * The actual validateTokens call on every URL change - including inner-page
 * and param-only navigation where this guard does not re-fire - is handled
 * centrally by SessionManagerService (NavigationEnd listener). Keeping the
 * guard validation-free avoids firing validateTokens twice per navigation.
 */
export const sessionGuard: CanActivateFn = (route, state) => {
  const sessionManager = inject(SessionManagerService);

  if (logoutTriggered) {
    return of(false);
  }

  sessionManager.start();
  return of(true);
};