// src/app/guard/session.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SessionManagerService } from '../services/session-manager.service';

export const sessionGuard: CanActivateFn = (route, state) => {
  const sessionManager = inject(SessionManagerService);

  // Calls /api/tokens/validateTokens API on every page transition
  return sessionManager.validateTokenOnRouteChange();
};