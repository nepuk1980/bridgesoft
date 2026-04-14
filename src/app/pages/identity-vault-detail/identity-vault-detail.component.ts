import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTabsModule } from '@angular/material/tabs';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';

// ✅ TYPES
type Attributes = {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  manager: string;
  employeeId: string;
  businessUnit: string;
  location: string;
  jobTitle: string;
  employeeCode: string;
  company: string;
};

interface Entitlement {
  name: string;
  type: string;
  resourcePath: string;
  access: {
    F: boolean;
    M: boolean;
    R: boolean;
    W: boolean;
    X: boolean;
    L: boolean;
  };
  accountName: string;
}

type ApplicationAccount = {
  application: string;
  accountName: string;
  status: string;
  lastAccess: string;
};

@Component({
  selector: 'app-identity-vault-detail',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MatSelectModule,
    NgxSkeletonLoaderModule,
    MatTabsModule,
    NgFor,
    NgIf,
    MatTableModule,
    NgClass,
    FormsModule,
  ],
  templateUrl: './identity-vault-detail.component.html',
  styleUrl: './identity-vault-detail.component.css',
})
export class IdentityVaultDetailComponent implements OnInit {
  appId!: number;
  selectedIndex = 0;
  isLoading = true;
  selectedEntitlementsDownload: string = 'Download';
  selectedApplicationDownload: string = 'Download';

  // ✅ Static tab structure
  tabs: any[] = [
    {
      name: 'Attributes',
      key: 'attributes',
      data: {} as Attributes,
    },
    {
      name: 'Entitlements',
      key: 'entitlements',
      data: [] as Entitlement[],
    },
    {
      name: 'Application Accounts',
      key: 'applicationAccounts',
      data: [] as ApplicationAccount[],
    },
  ];

  displayedColumns: string[] = [
    'name',
    'resourcePath',
    'type',
    'access',
    'accountName',
  ];

  displayedAppColumns: string[] = [
    'application',
    'accountName',
    'status',
    'lastAccess',
  ];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private reportService: ReportService,
  ) {}

  ngOnInit(): void {
    this.appId = history.state?.id;

    if (this.appId) {
      this.getAttributes();
      this.getApplicationAccounts();
      this.getEntitlements(); // ✅ missing call added
      console.log('id ==', this.appId);
    } else {
      console.error('No ID found');
      this.isLoading = false;
    }
  }

  // ✅ ATTRIBUTES API
  getAttributes(): void {
    this.api.getidentityvaultdetails(this.appId).subscribe({
      next: (res: any) => {
        const data = res?.content || res;

        this.tabs[0].data = {
          firstName: data?.firstName || '-',
          lastName: data?.lastName || '-',
          email: data?.email || '-',
          department: data?.department || '-',
          manager: data?.manager || '-',
          employeeId: data?.manager_employee_id || '-',
          businessUnit: data?.manager_department || '-',
          location: data?.location || '-',
          jobTitle: data?.job_title || '-',
          employeeCode: data?.employee_code || '-',
          company: data?.company || '-',
        };

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Attributes Error:', err);
        this.isLoading = false;
      },
    });
  }

  // ✅ APPLICATION ACCOUNTS API
  getApplicationAccounts(): void {
    console.log('this id', this.appId);

    this.api.getapplicationaccount(this.appId).subscribe({
      next: (res: any) => {
        const data = res?.content || res;
        const list = Array.isArray(data) ? data : [data];

        this.tabs[2].data = list.map((item: any) => ({
          application: item?.applicationName || '-',
          accountName: item?.accountName || '-',
          status: item?.status || 'Inactive',
          lastAccess: item?.lastAccess || '-',
        }));
      },
      error: (err) => {
        console.error('Application Accounts Error:', err);
      },
    });
  }

  // ✅ ENTITLEMENTS API
  getEntitlements(): void {
    console.log('this id', this.appId);

    this.api.getidentityentitlementlist(this.appId).subscribe({
      next: (res: any) => {
        const data = res?.content || res;
        const list = Array.isArray(data) ? data : [data];

        this.tabs[1].data = list.map((item: any) => {
          const codes: string[] = (item?.accessCodes || '').split(',');

          return {
            name: item?.itemName || '-',
            type: item?.itemType || '-',
            resourcePath: item?.resourcePath || '-',

            access: {
              F: codes.includes('F'),
              M: codes.includes('M'),
              R: codes.includes('R'),
              W: codes.includes('W'),
              X: codes.includes('X'),
              L: codes.includes('L'),
            },

            accountName: item?.accountName || '-',
          };
        });

        console.log('Entitlements:', this.tabs[1].data);
      },
      error: (err) => {
        console.error('Entitlements Error:', err);
      },
    });
  }

  // ✅ CHECK FULL ACCESS
  isAllAccessTrue(access: any): boolean {
    if (!access) return false;
    return Object.values(access).every((val) => val === true);
  }

  private getFormattedDateTime(): string {
    const now = new Date();

    const date = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
    const time = now
      .toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/:/g, '-'); // HH-MM-SS

    return `${date}_${time}`;
  }

  private getExportApplicationData() {
    const appData = this.tabs[2].data as ApplicationAccount[];

    return appData.map((item) => ({
      Application: item.application || '-',
      'Account Name': item.accountName || '-',
      Status: item.status || '-',
      'Last Access': item.lastAccess || '-',
    }));
  }
  downloadApplicationExcel() {
    const data = this.getExportApplicationData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `application-accounts-application-accounts-report_${timestamp}`,
      'Application Accounts - Application Accounts',
    );
  }

  downloadApplicationCSV() {
    const data = this.getExportApplicationData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `application-accounts-application-accounts-report_${timestamp}`,
      'Application Accounts - Application Accounts',
    );
  }

  downloadApplicationPDF() {
    const data = this.getExportApplicationData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `application-accounts-application-accounts-report_${timestamp}`,
      'Application Accounts - Application Accounts',
    );
  }

  private getExportEntitlementsData() {
    const entitlements = this.tabs[1].data as Entitlement[];

    return entitlements.map((item) => {
      const accessList =
        Object.entries(item.access)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(', ') || '-';

      return {
        'Folder / File Names': item.name || '-',
        'Resource Path': item.resourcePath || '-',
        Type: item.type || '-',
        'File Share Access': accessList,
        'Account Name': item.accountName || '-',
      };
    });
  }
  downloadEntitlementsExcel() {
    const data = this.getExportEntitlementsData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `application-accounts-entitlements-report_${timestamp}`,
      'Application Accounts - Entitlements',
    );
  }

  downloadEntitlementsCSV() {
    const data = this.getExportEntitlementsData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `application-accounts-entitlements-report_${timestamp}`,
      'Application Accounts - Entitlements',
    );
  }

  downloadEntitlementsPDF() {
    const data = this.getExportEntitlementsData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `application-accounts-entitlements-report_${timestamp}`,
      'Application Accounts - Entitlements',
    );
  }
}
