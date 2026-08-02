import { Injectable } from '@angular/core';

export interface PagePermissionGroup {
  permission: string;
  pagePermissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  setPermissions(permissionsList: PagePermissionGroup[]): void {
    localStorage.setItem('permissionsList', JSON.stringify(permissionsList));
  }

  getPermissions(): PagePermissionGroup[] {
    const list = localStorage.getItem('permissionsList');
    if (!list) return [];
    try {
      return JSON.parse(list);
    } catch {
      return [];
    }
  }

  hasPermission(moduleName: string): boolean {
    if (!moduleName) return false;
    const list = this.getPermissions();
    return list.some((item) => item.permission?.toLowerCase() === moduleName.toLowerCase());
  }

  hasPagePermission(moduleName: string, pagePermission: string): boolean {
    const list = this.getPermissions();
    const group = list.find((item) => item.permission?.toLowerCase() === moduleName.toLowerCase());

    if (!group || !group.pagePermissions) return false;

    return group.pagePermissions.includes(pagePermission);
  }

  clearPermissions(): void {
    localStorage.removeItem('permissionsList');
  }
}