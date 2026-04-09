import { Routes } from '@angular/router';

import { ApplicationsComponent } from './pages/applications/applications.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FileSharePermissionsComponent } from './pages/file-share-permissions/file-share-permissions.component';
import { ApplicationsLayoutComponent } from './layout/applications-layout/applications-layout.component';
import { IdentityvaultLayoutComponent } from './layout/identityvault-layout/identityvault-layout.component';
import { IdentityVaultComponent } from './pages/identity-vault/identity-vault.component';
import { IdentityVaultDetailComponent } from './pages/identity-vault-detail/identity-vault-detail.component';
import { RequestaccessLayoutComponent } from './layout/requestaccess-layout/requestaccess-layout.component';
import { RequestAccessComponent } from './pages/request-access/request-access.component';
import { RequestAccessDetailComponent } from './pages/request-access-detail/request-access-detail.component';
import { RequestReviewAccessComponent } from './pages/request-review-access/request-review-access.component';
import { AudittrailLayoutComponent } from './layout/audittrail-layout/audittrail-layout.component';
import { AuditTrailComponent } from './pages/audit-trail/audit-trail.component';
import { AuditTrailDetailComponent } from './pages/audit-trail-detail/audit-trail-detail.component';
import { ReviewaccessLayoutComponent } from './layout/reviewaccess-layout/reviewaccess-layout.component';
import { ReviewAccessComponent } from './pages/review-access/review-access.component';
import { ReviewAccessDetailComponent } from './pages/review-access-detail/review-access-detail.component';
import { SodDetailComponent } from './pages/sod-detail/sod-detail.component';
import { AdministrativecontrolsLayoutComponent } from './layout/administrativecontrols-layout/administrativecontrols-layout.component';
import { AdministrativeControlComponent } from './pages/administrative-control/administrative-control.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { breadcrumb: 'Dashboard', animation: 'DashboardPage' },
  },
  {
    path: 'applications',
    component: ApplicationsLayoutComponent,
    data: { breadcrumb: 'Applications', animation: 'ApplicationsPage' },
    children: [
      {
        path: '',
        component: ApplicationsComponent,
      },
      {
        path: 'file-share-permission',
        component: FileSharePermissionsComponent,
        data: {
          breadcrumb: 'File Share Permissions',
          animation: 'FileSharePermissionsPage',
        },
      },
    ],
  },
  {
    path: 'identity-vault',
    component: IdentityvaultLayoutComponent,
    data: { breadcrumb: 'Identity Vault', animation: 'IdentityvaultPage' },
    children: [
      {
        path: '',
        component: IdentityVaultComponent,
      },
      {
        path: ':id', // ✅ ADD PARAM
        component: IdentityVaultDetailComponent,
        data: {
          breadcrumb: '',
          animation: 'IdentityVaultDetailsPage',
          dynamic: true,
          showPrefix: false,
        },
      },
    ],
  },
  {
    path: 'request-access',
    component: RequestaccessLayoutComponent,
    data: { breadcrumb: 'Request Access', animation: 'ReaquestAccessPage' },
    children: [
      {
        path: '',
        component: RequestAccessComponent,
      },
      {
        path: 'request-access-detail',
        component: RequestAccessDetailComponent,
        data: {
          breadcrumb: 'Request Access Detail',
          animation: 'RequestAccessDetailPage',
        },
      },
      {
        path: 'request-review-access',
        component: RequestReviewAccessComponent,
        data: {
          breadcrumb: 'Request Review Access',
          animation: 'RequestReviewAccessPage',
        },
      },
    ],
  },
  {
    path: 'audit-trail',
    component: AudittrailLayoutComponent,
    data: { breadcrumb: 'Audit Trail', animation: 'AudittrailPage' },
    children: [
      {
        path: '',
        component: AuditTrailComponent,
      },
      {
        path: ':id', // ✅ ADD PARAM
        component: AuditTrailDetailComponent,
        data: {
          breadcrumb: 'Request Access',
          dynamic: true,
          animation: 'AuditDetailPage',
          showPrefix: true,
        },
      },
    ],
  },
  {
    path: 'review-access',
    component: RequestaccessLayoutComponent,
    data: { breadcrumb: 'Review Access', animation: 'ReviewAccessPage' },
    children: [
      {
        path: '',
        component: ReviewAccessComponent,
      },
      {
        path: 'review-access-detail',
        component: ReviewAccessDetailComponent,
        data: {
          breadcrumb: 'Review Access',
          animation: 'ReviewAccessDetailPage',
        },
      },
      {
        path: 'sod-detail',
        component: SodDetailComponent,
        data: {
          breadcrumb: 'Review Access',
          animation: 'SodDetailPage',
        },
      },
    ],
  },
  {
    path: 'administrative-control',
    component: AdministrativecontrolsLayoutComponent,
    data: {
      breadcrumb: 'Administrative Control',
      animation: 'AdministrativeControlPage',
    },
    children: [
      {
        path: '',
        component: AdministrativeControlComponent,
      },
      // {
      //   path: 'review-access-detail',
      //   component: ReviewAccessDetailComponent,
      //   data: {
      //     breadcrumb: 'Review Access',
      //     animation: 'ReviewAccessDetailPage',
      //   },
      // },
      // {
      //   path: 'sod-detail',
      //   component: SodDetailComponent,
      //   data: {
      //     breadcrumb: 'Review Access',
      //     animation: 'SodDetailPage',
      //   },
      // },
    ],
  },
];
