import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTabsModule } from '@angular/material/tabs';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

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
  userId!: string | null;

  tabs: any[] = [];
  selectedIndex = 0; // ✅ controls active tab

  userData!: {
    attributes: Attributes;
    entitlements: Entitlement[];
    applicationAccounts: ApplicationAccount[];
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.loadUser();
  }

  createSlug(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
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

  loadUser() {
    const allUsers = [
      {
        name: 'Attributes',
        key: 'attributes',
        data: {
          firstName: 'Christopher',
          lastName: 'Williams',
          email: 'christopherwilliams@bridgesoft.com',
          department: 'IT',
          manager: 'Bob Smith',
          employeeId: 'EMP4567853',
          businessUnit: '622 Customer Care Ops',
          location: 'IWA',
          jobTitle: 'Agent, Ground Ops',
          employeeCode: 'Service Provider - Stations',
          company: 'Worldwide',
        },
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
        data: [
          {
            application: 'File share Permission',
            accountName: 'Christopher Williams (987342)',
            status: 'Active',
            lastAccess: '2026-02-12T15:10:00',
          },
        ],
      },
    ];

    this.tabs = allUsers;

    const attributesSection = allUsers.find((s) => s.key === 'attributes');
    const user = attributesSection?.data as Attributes;

    if (!user) return;

    const slug = this.createSlug(user.firstName, user.lastName);

    if (slug === this.userId) {
      this.userData = {
        attributes: user,
        entitlements:
          (allUsers.find((s) => s.key === 'entitlements')
            ?.data as Entitlement[]) || [],
        applicationAccounts:
          (allUsers.find((s) => s.key === 'applicationAccounts')
            ?.data as ApplicationAccount[]) || [],
      };

      this.route.snapshot.data['dynamicBreadcrumb'] =
        `${user.firstName} ${user.lastName}`;
    }
  }
  isAllAccessTrue(access: Record<string, boolean>): boolean {
    return Object.values(access).every((value) => value === true);
  }
}
