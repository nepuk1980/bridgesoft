import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

export const permissionGuard = (requiredPermission: string): CanActivateFn => {
  return (route, state) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    const hasAccess = permissionService.hasPermission(requiredPermission);

    console.log(`🛡️ [permissionGuard] Path: ${state.url} | Required: "${requiredPermission}" | Allowed: ${hasAccess}`);

    if (hasAccess) {
      return true;
    }

    console.warn(`⛔ Access Denied: Missing '${requiredPermission}' permission.`);

    // 🛑 Prevent Infinite Redirect Loop: Avoid redirecting to '/' if we are already trying to access root
    if (state.url !== '/' && state.url !== '') {
      router.navigate(['/']);
    }

    return false;
  };
};