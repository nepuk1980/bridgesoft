// src/app/guard/session.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';

export const sessionGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);

  // Calls token/checkTokens API on every page transition
  return sessionService.validateTokenOnRouteChange();
};