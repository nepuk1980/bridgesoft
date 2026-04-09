import { Component, inject } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CloudresourcespopupComponent } from '../../shared/components/cloudresourcespopup/cloudresourcespopup.component';
import { MatSelectModule } from '@angular/material/select';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { AdduserdpopupComponent } from '../../shared/components/adduserdpopup/adduserdpopup.component';
import { AddaccessdpopupComponent } from '../../shared/components/addaccessdpopup/addaccessdpopup.component';
import { ResourceeditdpopupComponent } from '../../shared/components/resourceeditdpopup/resourceeditdpopup.component';

export interface sharedData {
  sharedBy: string;
  sharedWith: string;
  fileName: string;
  fileType: string;
  date: string;
  tag: string;
  path: string;
}

export interface externalFilesData {
  name: string;
  type: string;
  serviceType: string;
  service: string;
  lastViewed: string;
  lastViewedRecent: string;
  tags: string[];
}

interface CardData {
  title: string;
  value: number | string;
  file: boolean;
  fileicon: boolean;
  icon: string;
  subtitle?: string;
}

interface TreeNode {
  name: string;
  type: 'department' | 'user' | 'directory' | 'file' | 'folder';
  department?: string;
  children?: TreeNode[];
}
interface TableItem {
  name: string;
  type: 'file' | 'folder';
  permissions: {
    F: boolean;
    M: boolean;
    R: boolean;
    W: boolean;
    X: boolean;
    L: boolean;
  };
  totalHitCount: number;
  size: string;
  classification: string | null;
  category: string | null;
  directory: string;
  directoryname: string;
}

const tabs: { items: TableItem[] }[] = [
  {
    items: [
      {
        name: 'Employee Data.xlsx',
        type: 'file',
        permissions: { F: true, M: true, R: true, W: false, X: true, L: true },
        totalHitCount: 1027,
        size: '1.23 GB',
        classification: 'PCI (38)',
        category: 'Company (Intl)',
        directory: 'Human Resources',
        directoryname: 'Christopher Williams',
      },
      {
        name: 'Employee Perks.xlsx',
        type: 'file',
        permissions: { F: true, M: true, R: true, W: false, X: true, L: true },
        totalHitCount: 363,
        size: '2.82 KB',
        classification: null,
        category: null,
        directory: 'Human Resources',
        directoryname: 'Christopher Williams',
      },
      {
        name: 'Employee Leave Policy.xlsx',
        type: 'file',
        permissions: { F: true, M: true, R: true, W: false, X: true, L: true },
        totalHitCount: 2361,
        size: '4.01 KB',
        classification: 'PIL (6)',
        category: 'Company (Intl)',
        directory: 'Human Resources',
        directoryname: 'Melinda Kite',
      },
      {
        name: 'Employee Travel Policy',
        type: 'file',
        permissions: { F: true, M: true, R: true, W: true, X: true, L: true },
        totalHitCount: 2745,
        size: '10.32 GB',
        classification: null,
        category: null,
        directory: 'Administration',
        directoryname: 'Melinda Kite',
      },
      {
        name: 'Employee Training.xlsx',
        type: 'file',
        permissions: { F: true, M: true, R: true, W: true, X: true, L: true },
        totalHitCount: 392,
        size: '239.00 MB',
        classification: 'PCI (88)',
        category: null,
        directory: 'Administration',
        directoryname: 'Christopher Williams',
      },
      {
        name: 'Employee Device List.xlsx',
        type: 'file',
        permissions: { F: true, M: true, R: false, W: true, X: true, L: true },
        totalHitCount: 237,
        size: '121.21 GB',
        classification: null,
        category: null,
        directory: 'Administration',
        directoryname: 'Christopher Williams',
      },
    ],
  },
];

@Component({
  selector: 'app-administrative-control',
  imports: [
    BreadcrumbComponent,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatTreeModule,
    MatIconModule,
    NgIf,
    NgFor,
    NgClass,
    MatTableModule,
  ],
  templateUrl: './administrative-control.component.html',
  styleUrl: './administrative-control.component.css',
})
export class AdministrativeControlComponent {
  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'directory',
    'filesystempermissions',
    'totalhitcount',
    'size',
    'classification',
    'category',
    'action',
  ];

  /** FULL DATA */
  allTableData = tabs[0].items;

  /** TABLE DATA */
  tableData = [...this.allTableData];

  /** TREE CONTROL */
  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  usersTreeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  usersDataSource = new MatTreeNestedDataSource<TreeNode>();

  accessTreeControl = new NestedTreeControl<TreeNode>(() => []);
  accessDataSource = new MatTreeNestedDataSource<TreeNode>();

  constructor() {
    this.dataSource.data = this.buildTree();
    this.usersDataSource.data = this.buildUsersTree();

    // ACCESS DIRECTORIES
    this.accessDataSource.data = this.buildAccessTree();

    if (this.dataSource.data.length > 0) {
      const firstNode = this.dataSource.data[0];

      this.treeControl.expand(firstNode);
      this.selectNode(firstNode);
    }
  }

  /** BUILD TREE FROM TABS DATA */
  buildTree(): TreeNode[] {
    const departmentMap = new Map<string, Map<string, TreeNode>>();

    this.allTableData.forEach((item) => {
      if (!departmentMap.has(item.directory)) {
        departmentMap.set(item.directory, new Map());
      }

      const userMap = departmentMap.get(item.directory)!;

      if (!userMap.has(item.directoryname)) {
        userMap.set(item.directoryname, {
          name: item.directoryname,
          type: 'user',
          department: item.directory,
        });
      }
    });

    const tree: TreeNode[] = [];

    departmentMap.forEach((users, department) => {
      tree.push({
        name: department,
        type: 'department',
        children: Array.from(users.values()),
      });
    });

    return tree;
  }

  buildUsersTree(): TreeNode[] {
    const userMap = new Map<string, TreeNode>();

    this.allTableData.forEach((item) => {
      if (!userMap.has(item.directoryname)) {
        userMap.set(item.directoryname, {
          name: item.directoryname,
          type: 'user',
        });
      }
    });

    return Array.from(userMap.values());
  }

  buildAccessTree(): TreeNode[] {
    const directories = new Set<string>();

    this.allTableData.forEach((item) => {
      directories.add(item.directory);
    });

    return Array.from(directories).map((item) => ({
      name: item,
      type: 'directory',
    }));
  }

  /** TREE CHILD CHECK */
  hasChild = (_: number, node: TreeNode) =>
    !!node.children && node.children.length > 0;

  selectedNode: TreeNode | null = null;
  /** TREE CLICK FILTER */
  selectedNodeType:
    | 'department'
    | 'user'
    | 'directory'
    | 'file'
    | 'folder'
    | null = null;
  selectNode(node: TreeNode) {
    this.selectedNode = node;
    this.selectedNodeType = node.type;

    const filtered = this.allTableData.filter((item) => {
      if (node.type === 'department') {
        return item.directory === node.name;
      }

      if (node.type === 'user') {
        if (node.department) {
          return (
            item.directoryname === node.name &&
            item.directory === node.department
          );
        }
        return item.directoryname === node.name;
      }

      if (node.type === 'directory') {
        return item.directory === node.name;
      }

      return false;
    });

    if (filtered.length) {
      const parentRow: TableItem = {
        name: '',
        type: 'folder',
        permissions: {
          F: false,
          M: false,
          R: false,
          W: false,
          X: false,
          L: false,
        },
        totalHitCount: 0,
        size: '',
        classification: null,
        category: null,
        directory: node.type === 'user' ? filtered[0].directory : node.name,
        directoryname:
          node.type === 'user' ? node.name : filtered[0].directoryname,
      };

      this.tableData = [parentRow, ...filtered];
    } else {
      this.tableData = [];
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    this.activeTabIndex = event.index;

    const index = event.index;

    if (index === 0 && this.dataSource.data.length) {
      const first = this.dataSource.data[0];
      this.treeControl.expand(first);
      this.selectNode(first);
    }

    if (index === 1 && this.usersDataSource.data.length) {
      const first = this.usersDataSource.data[0];
      this.selectNode(first);
    }

    if (index === 2 && this.accessDataSource.data.length) {
      const first = this.accessDataSource.data[0];
      this.selectNode(first);
    }
  }
  isAllAccessTrue(access: any): boolean {
    if (!access) return false;
    return Object.values(access).every((val) => val === true);
  }

  activeTabIndex: number = 0;
  onAddClick() {
    if (this.activeTabIndex === 0) {
      this.addGroupUser();
    }

    if (this.activeTabIndex === 1) {
      this.addUser();
    }

    if (this.activeTabIndex === 2) {
      this.addAccess();
    }
  }

  addGroupUser() {
    this.openAddAccessDialog();
    // open dialog / API call
  }

  addUser() {
    this.openAddAccessDialog();
    // open dialog / API call
  }

  addAccess() {
    this.openAddUserDialog();
    // open dialog / API call
  }

  Shared: sharedData[] = [
    {
      sharedBy: 'William Bridges',
      sharedWith: 'Christopher Williams',
      fileName: 'Finance Policy.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Amanda Jones',
      sharedWith: 'Bob Smith',
      fileName: 'Employee Perks.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Peter Biel',
      sharedWith: 'Randy Jefferson',
      fileName: 'Vendor Policy.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Brenda Jenna',
      sharedWith: 'Miroslav L',
      fileName: 'Medical Insurance.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Ashley Smithson',
      sharedWith: 'Christopher Williams',
      fileName: 'Vendor Legal.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Deepak Sharma',
      sharedWith: 'Bob Smith',
      fileName: 'Employee Onboarding.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'William Bridges',
      sharedWith: 'Christopher Williams',
      fileName: 'Finance Policy.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Amanda Jones',
      sharedWith: 'Bob Smith',
      fileName: 'Employee Perks.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Peter Biel',
      sharedWith: 'Randy Jefferson',
      fileName: 'Vendor Policy.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Brenda Jenna',
      sharedWith: 'Miroslav L',
      fileName: 'Medical Insurance.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Ashley Smithson',
      sharedWith: 'Christopher Williams',
      fileName: 'Vendor Legal.xlsx',
      fileType: 'File',
      date: '07/21/2025 02:24 AM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
    {
      sharedBy: 'Deepak Sharma',
      sharedWith: 'Bob Smith',
      fileName: 'Employee Onboarding.xlsx',
      fileType: 'File',
      date: '08/22/2025 12:08 PM',
      tag: 'Private',
      path: '/gsuite/Finance/ William Bridges',
    },
  ];

  ExternalFiles: externalFilesData[] = [
    {
      name: 'Employee DB 2025.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '01/21/2025 02:24 AM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Vendor List Domestic.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 14:08 PM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee Policies.xlsx',
      type: 'File',
      service: 'Test3',
      serviceType: 'amazon',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '02/21/2025 02:24 AM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Medical Policies.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public', 'Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee Device List.xlsx',
      type: 'File',
      service: 'Staging S2',
      serviceType: 'dropbox',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '07/21/2025 02:24 AM',
      tags: ['Sensitive'],
    },
    {
      name: 'Code of Conduct Policy.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Work from home policy.pdf',
      type: 'File',
      service: 'Inbound Enquiries',
      serviceType: 'dropbox',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public'],
    },
    {
      name: 'Uniform & Accessories.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public'],
    },
    {
      name: 'Office Overheads.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public', 'Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee DB 2025.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '01/21/2025 02:24 AM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Vendor List Domestic.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 14:08 PM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee Policies.xlsx',
      type: 'File',
      service: 'Test3',
      serviceType: 'amazon',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '02/21/2025 02:24 AM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Medical Policies.xlsx',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public', 'Sensitive', 'Share Externally'],
    },
    {
      name: 'Employee Device List.xlsx',
      type: 'File',
      service: 'Staging S2',
      serviceType: 'dropbox',
      lastViewed: '07/21/2024 02:24 AM',
      lastViewedRecent: '07/21/2025 02:24 AM',
      tags: ['Sensitive'],
    },
    {
      name: 'Code of Conduct Policy.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Sensitive', 'Share Externally'],
    },
    {
      name: 'Work from home policy.pdf',
      type: 'File',
      service: 'Inbound Enquiries',
      serviceType: 'dropbox',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public'],
    },
    {
      name: 'Uniform & Accessories.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public'],
    },
    {
      name: 'Office Overheads.pdf',
      type: 'File',
      service: 'polyrizeab.com',
      serviceType: 'drive',
      lastViewed: '08/22/2024 12:08 PM',
      lastViewedRecent: '08/22/2025 12:08 PM',
      tags: ['Public', 'Sensitive', 'Share Externally'],
    },
  ];

  /** CLOUD DIALOG */
  openCloudDialog(
    card: CardData,
    shared: sharedData[],
    externalFiles: externalFilesData[],
  ) {
    this.dialog.open(CloudresourcespopupComponent, {
      width: '95%',
      minWidth: '95%',
      maxWidth: '100%',
      data: {
        ...card,
        shared,
        externalFiles,
      },
    });
  }
  openAddUserDialog() {
    this.dialog.open(AdduserdpopupComponent, {
      width: '34.375rem',
      minWidth: '34.375rem',
      maxWidth: '100%',
    });
  }

  openAddAccessDialog() {
    this.dialog.open(AddaccessdpopupComponent, {
      width: '46rem',
      minWidth: '46rem',
      maxWidth: '100%',
    });
  }

  openResourceEditDialog() {
    this.dialog.open(ResourceeditdpopupComponent, {
      width: '58rem',
      minWidth: '58rem',
      maxWidth: '100%',
    });
  }
  ngOnInit(): void {
    // this.openAddUserDialog();
    // this.openAddAccessDialog();
    // this.openResourceEditDialog();
  }
}
