import { Routes } from '@angular/router';

import { ApplicationsComponent } from './pages/applications/applications.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FileSharePermissionsComponent } from './pages/file-share-permissions/file-share-permissions.component';
import { ApplicationsLayoutComponent } from './layout/applications-layout/applications-layout.component';
import { IdentityvaultLayoutComponent } from './layout/identityvault-layout/identityvault-layout.component';
import { IdentityVaultComponent } from './pages/identity-vault/identity-vault.component';
import { IdentityVaultDetailComponent } from './pages/identity-vault-detail/identity-vault-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { breadcrumb: 'Dashboard',animation: 'DashboardPage' }
  },
  {
    path: 'applications',
    component: ApplicationsLayoutComponent,
    data: { breadcrumb: 'Applications',animation: 'ApplicationsPage' },
    children: [
      {
        path: '',
        component: ApplicationsComponent,
      },
      {
        path: 'file-share-permission',
        component: FileSharePermissionsComponent,
        data: { breadcrumb: 'File Share Permissions',animation: 'FileSharePermissionsPage' }
      }
    ]
  },
  {
    path: 'identity-vault',
    component: IdentityvaultLayoutComponent,
    data: { breadcrumb: 'Identity Vault',animation: 'IdentityvaultPage' },
    children: [
      {
        path: '',
        component: IdentityVaultComponent,
      },
      {
        path: 'identity-vault-details',
        component: IdentityVaultDetailComponent,
        data: { breadcrumb: 'File Share Permissions',animation: 'FileSharePermissionsPage' }
      }
    ]
  }
];