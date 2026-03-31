import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTabsModule } from '@angular/material/tabs';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';

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

type Entitlement = {
  name: string;
  type: string;
  resourcePath: string;
  access: Record<string, boolean>;
  accountName: string;
};

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
  ],
  templateUrl: './identity-vault-detail.component.html',
  styleUrl: './identity-vault-detail.component.css',
})
export class IdentityVaultDetailComponent implements OnInit {
  appId!: number;
  selectedIndex = 0;
  isLoading = true;

  // ✅ Keep existing static data for other tabs
  tabs: any[] = [
    {
      name: 'Attributes',
      key: 'attributes',
      data: {}, // 👈 will come from API
    },
    {
      name: 'Entitlements',
      key: 'entitlements',
      data: [
        {
          name: 'Human Resources',
          type: 'Folder',
          resourcePath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/folder/humanresources',
          access: {
            F: true,
            M: false,
            R: true,
            W: false,
            X: false,
            L: false,
          },
          accountName: 'Christopher Williams (987342)',
        },
        {
          name: 'Employee Perks',
          type: 'File',
          resourcePath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/folder/humanresources',
          access: { F: true, M: true, R: true, W: true, X: true, L: true },
          accountName: 'Christopher Williams (987342)',
        },
        {
          name: 'Employee Reimbursements',
          type: 'File',
          resourcePath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/folder/humanresources',
          access: {
            F: true,
            M: false,
            R: true,
            W: false,
            X: false,
            L: false,
          },
          accountName: 'Christopher Williams (987342)',
        },
        {
          name: 'Employee Travel Policy',
          type: 'File',
          resourcePath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/folder/humanresources',
          access: { F: true, M: true, R: true, W: true, X: false, L: false },
          accountName: 'Christopher Williams (987342)',
        },
        {
          name: 'Employee Medical Policy',
          type: 'File',
          resourcePath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/folder/humanresources',
          access: { F: true, M: false, R: true, W: false, X: false, L: true },
          accountName: 'Christopher Williams (987342)',
        },
      ],
    },
    {
      name: 'Application Accounts',
      key: 'applicationAccounts',
      data: [],
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
  ) {}

  ngOnInit(): void {
    this.appId = history.state.id;
    if (this.appId) {
      this.getAttributes();
      this.getApplicationAccounts();
      console.log('id.  ==', this.appId);
    } else {
      console.error('No ID found');
    }
  }

  // ✅ ONLY ATTRIBUTES API CALL
  getAttributes(): void {
    this.api.getidentityvaultdetails(this.appId).subscribe({
      next: (res: any) => {
        const data = res?.content || res;

        // ✅ Bind ONLY attributes tab
        this.tabs[0].data = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          department: data.department,
          manager: data.manager,
          employeeId: data.manager_employee_id,
          businessUnit: data.manager_department,
          location: data.location,
          jobTitle: data.job_title,
          employeeCode: data.employee_code,
          company: data.company,
        };

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  getApplicationAccounts(): void {
    console.log('this id', this.appId);
    this.api.getapplicationaccount(this.appId).subscribe({
      next: (res: any) => {
        const data = res?.content || res;

        // ✅ HANDLE BOTH OBJECT & ARRAY
        const list = Array.isArray(data) ? data : [data];

        // 🔹 FILTER BY ID (only include items matching this.appId)
        const filteredList = list.filter((item: any) => item.id === this.appId);

        this.tabs[2].data = filteredList.map((item: any) => ({
          application: item.applicationName || '-',
          accountName: item.accountName || '-',
          status: item.status || 'Inactive',
          lastAccess: item.lastAccess || '-',
        }));
      },
      error: (err) => {
        console.error('Application Accounts Error:', err);
      },
    });
  }

  // ✅ existing function (no change)
  isAllAccessTrue(access: any): boolean {
    if (!access) return false;
    return Object.values(access).every((val) => val === true);
  }
}
