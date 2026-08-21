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
import { ReviewAccessComponent } from './pages/review-access/review-access.component';
import { AdministrativecontrolsLayoutComponent } from './layout/administrativecontrols-layout/administrativecontrols-layout.component';
import { AdministrativeControlComponent } from './pages/administrative-control/administrative-control.component';
import { AlertLayoutComponent } from './layout/alert-layout/alert-layout.component';
import { AlertComponent } from './pages/alert/alert.component';
import { AlertConfigurationComponent } from './pages/alert-configuration/alert-configuration.component';
import { RulesLayoutComponent } from './layout/rules-layout/rules-layout.component';
import { RulesComponent } from './pages/rules/rules.component';
import { RequestWorkflowComponent } from './pages/request-workflow/request-workflow.component';
import { ReportsLayoutComponent } from './layout/reports-layout/reports-layout.component';
import { ReportComponent } from './pages/report/report.component';
import { ExecutiveAuditReportComponent } from './pages/executive-audit-report/executive-audit-report.component';
import { AgentLayoutComponent } from './layout/agent-layout/agent-layout.component';
import { AgentComponent } from './pages/agent/agent.component';
import { ReportListComponent } from './pages/report-list/report-list.component';
import { LayoutComponent } from './layout/layout.component';
import { LoadingComponent } from './pages/loading/loading.component';

import { authGuard } from './guard/auth.guard';
import { sessionGuard } from './guard/session.guard';

export const routes: Routes = [
  {
    path: 'launch',
    component: LoadingComponent,
  },
  {
    // SSO entry: /launch/launch_code=...+user=... (values arrive in the path)
    path: 'launch/:payload',
    component: LoadingComponent,
  },
  {
    // Fallback used by the auth guard when there is no session yet: shows the
    // loading/validation screen instead of the dashboard shell.
    path: 'loading',
    component: LoadingComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard, sessionGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [authGuard, sessionGuard],
        data: { breadcrumb: 'Dashboard', animation: 'DashboardPage' }
      },
      {
        path: 'applications',
        component: ApplicationsLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: { breadcrumb: 'Applications', animation: 'ApplicationsPage' },
        children: [
          {
            path: '',
            component: ApplicationsComponent
          },
          {
            path: ':id',
            component: FileSharePermissionsComponent,
            data: {
              breadcrumb: 'File Share Permissions',
              animation: 'FileSharePermissionsPage',
            }
          },
        ],
      },
      {
        path: 'identity-vault',
        component: IdentityvaultLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: { breadcrumb: 'Identity Vault', animation: 'IdentityvaultPage' },
        children: [
          {
            path: '',
            component: IdentityVaultComponent
          },
          {
            path: ':id',
            component: IdentityVaultDetailComponent,
            data: {
              breadcrumb: '',
              animation: 'IdentityVaultDetailsPage',
              dynamic: true,
              showPrefix: false,
            }
          },
        ],
      },
      {
        path: 'request-access',
        component: RequestaccessLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: { breadcrumb: 'Request Access', animation: 'ReaquestAccessPage' },
        children: [
          {
            path: '',
            component: RequestAccessComponent
          },
          {
            path: 'request-access-workflow',
            component: RequestWorkflowComponent,
            data: {
              breadcrumb: 'Request Access workflow',
              animation: 'RequestAccessworkflowPage',
            }
          },
          {
            path: 'request-access-detail',
            component: RequestAccessDetailComponent,
            data: {
              breadcrumb: 'Request Access Detail',
              animation: 'RequestAccessDetailPage',
            }
          },
          {
            path: 'request-review-access',
            component: RequestReviewAccessComponent,
            data: {
              breadcrumb: 'Request Review Access',
              animation: 'RequestReviewAccessPage',
            }
          },
        ],
      },
      {
        path: 'audit-trail',
        component: AudittrailLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: { breadcrumb: 'Audit Trail', animation: 'AudittrailPage' },
        children: [
          {
            path: '',
            component: AuditTrailComponent
          },
          {
            path: ':id',
            component: AuditTrailDetailComponent,
            data: {
              breadcrumb: 'Request Access',
              dynamic: true,
              animation: 'AuditDetailPage',
              showPrefix: true,
            }
          },
        ],
      },
      {
        path: 'review-access',
        component: RequestaccessLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: { breadcrumb: 'Review Access', animation: 'ReviewAccessPage' },
        children: [
          {
            path: '',
            component: ReviewAccessComponent
          }
        ],
      },
      {
        path: 'administrative-control',
        component: AdministrativecontrolsLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: {
          breadcrumb: 'Administrative Control',
          animation: 'AdministrativeControlPage',
        },
        children: [
          {
            path: '',
            component: AdministrativeControlComponent
          },
        ],
      },
      {
        path: 'alerts',
        component: AlertLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: { breadcrumb: 'Alert', animation: 'AlertPage' },
        children: [
          {
            path: '',
            component: AlertComponent
          },
          {
            path: 'alerts-configuration',
            component: AlertConfigurationComponent,
            data: {
              breadcrumb: 'Alert',
              animation: 'AlertConfigurationPage',
            }
          },
        ],
      },
      {
        path: 'rules',
        component: RulesLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: {
          breadcrumb: 'Rules Control',
          animation: 'RulesPage',
        },
        children: [
          {
            path: '',
            component: RulesComponent
          },
        ],
      },
      {
        path: 'reports',
        component: ReportsLayoutComponent,
        canActivate: [authGuard, sessionGuard],
        data: { breadcrumb: 'Reports', animation: 'ReportPage' },
        children: [
          {
            path: '',
            component: ReportComponent
          },
          {
            path: 'executive-audit-report-list',
            component: ReportListComponent,
            data: {
              breadcrumb: 'Executive Audit Report',
              animation: 'ReportListPage',
            }
          },
          {
            path: 'executive-audit-report',
            component: ExecutiveAuditReportComponent,
            data: {
              breadcrumb: 'Executive Audit Report',
              animation: 'ExecutiveAuditReportPage',
            }
          },
        ],
      },
      // {
      //   path: 'agent',
      //   component: AgentLayoutComponent,
      //   canActivate: [authGuard, sessionGuard],
      //   data: { breadcrumb: 'Agent', animation: 'AgentPage' },
      //   children: [
      //     {
      //       path: '',
      //       component: AgentComponent
      //     },
      //   ],
      // },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];