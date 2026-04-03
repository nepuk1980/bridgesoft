import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTabsModule } from '@angular/material/tabs';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EmployeedetailspopupComponent } from '../../shared/components/employeedetailspopup/employeedetailspopup.component';
import { ForwardpopupComponent } from '../../shared/components/forwardpopup/forwardpopup.component';
// TYPES
type Important = {
  policyName: string;
  rule: string;
  folderOrFileNames: {
    type: 'folder' | 'file';
    name: string;
  };
  resourceFullPath: string;
  identity: string;
  warning?: {
    message: string;
    type: 'expired';
  };
  decision: {
    approve: boolean;
    reject: boolean;
    menuAvailable: boolean;
  };
};

interface TableRowImportant {
  policyName: string;
  rule: string;
  folderFileName: string;
  type: 'folder' | 'file';
  resourceFullPath: string;
  identity: string;

  warningType?: string;
  warningMsg?: string;

  approve: boolean;
  reject: boolean;
  menuAvailable: boolean;
}

type Open = {
  employeeName: string;
  folderOrFileNames: {
    type: 'folder' | 'file';
    name: string;
  };
  resourceFullPath: string;
  category: string;
  decision: {
    approve: boolean;
    reject: boolean;
    menuAvailable: boolean;
    message: {
      title: string;
      desc: string;
    };
  };
};

interface TableRowOpen {
  employeename: string;
  folderOrFileNames: {
    type: 'folder' | 'file';
    name: string;
  };
  resourceFullPath: string;
  categories: string;
  decision: {
    approve: boolean;
    reject: boolean;
    message: {
      title: string;
      desc: string;
    };
  };
}

type Review = {
  employeeName: string;
  folderOrFileNames: {
    type: 'folder' | 'file';
    name: string;
  };
  resourceFullPath: string;
  category: string;
  decision: {
    approve: boolean;
    reject: boolean;
    menuAvailable: boolean;
  };
};

interface TableRowReview {
  employeename: string;
  folderOrFileNames: {
    type: 'folder' | 'file';
    name: string;
  };
  resourceFullPath: string;
  categories: string;
  decision: {
    approve: boolean;
    reject: boolean;
  };
}

@Component({
  selector: 'app-review-access',
  imports: [
    BreadcrumbComponent,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    NgxSkeletonLoaderModule,
    MatTabsModule,
    NgFor,
    NgIf,
    MatTableModule,
    NgClass,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './review-access.component.html',
  styleUrl: './review-access.component.css',
})
export class ReviewAccessComponent implements OnInit {
  selectedIndex = 0;
  isLoading = true;

  // FILTER STATES
  searchText = '';
  selectedCategory = '';
  selectedType = '';

  tabs: any[] = [
    {
      name: 'Important',
      key: 'important',
      data: [
        {
          policyName: 'File share business SOD Policy',
          rule: 'Any person having access to Legal should not have access to Human Resources',
          folderOrFileNames: {
            type: 'folder',
            name: 'Legal',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/legal/Folder/Legal',
          identity: 'Amanda James',
          decision: {
            approve: false,
            reject: true,
            message: {
              title: 'Recommended',
              desc: '100% of similar users has this access<br/>100% f users reporting to this Manager have this access<br/>100% of users with this Cost Center have this access',
            },
          },
        },
        {
          policyName:
            'SOD Policy Internal Auditor Access - Windows Administrator Access',
          rule: 'Internal Auditor Access - Windows Administrator Access Constraint',
          folderOrFileNames: {
            type: 'file',
            name: 'Human Resources.xls',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
          identity: 'Jonas Jilton',
          warning: {
            message: 'Allow expired on 11/12/2024',
            type: 'expired',
          },
          decision: {
            approve: false,
            reject: false,
            message: {
              title: 'Recommended',
              desc: '100% of similar users has this access<br/>100% of users reporting to this Manager have this access<br/>100% of users with this Cost Center have this access',
            },
          },
        },
      ],
    },
    {
      name: 'Open',
      key: 'open',
      data: [
        {
          employeeName: 'Amanda James',
          folderOrFileNames: {
            type: 'folder',
            name: 'Legal',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/Legal/Folder/legal',
          category: 'PIL',
          decision: {
            approve: false,
            reject: false,
            message: {
              title: 'Recommended',
              desc: '100% of similar users has this access<br/>100% of users reporting to this Manager have this access<br/>100% of users with this Cost Center have this access',
            },
          },
        },
        {
          employeeName: 'Amanda James',
          folderOrFileNames: {
            type: 'file',
            name: 'Human Resources.xls',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
          category: 'HIPAA',
          decision: {
            approve: false,
            reject: false,
            message: {
              title: 'Recommended',
              desc: '100% of similar users has this access<br/>100% of users reporting to this Manager have this access<br/>100% of users with this Cost Center have this access',
            },
          },
        },
        {
          employeeName: 'James Smith',
          folderOrFileNames: {
            type: 'file',
            name: 'Mediclaims.xls',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/Mediclaim',
          category: 'PDPB',
          decision: {
            approve: false,
            reject: false,
            message: {
              title: 'Recommended',
              desc: '100% of similar users has this access<br/>100% of users reporting to this Manager have this access<br/>100% of users with this Cost Center have this access',
            },
          },
        },
        {
          employeeName: 'Amjad Ali Khan',
          folderOrFileNames: {
            type: 'folder',
            name: 'Insurance Data',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/Insurance',
          category: 'GDPR',
          decision: {
            approve: false,
            reject: false,
            message: {
              title: 'Recommended',
              desc: '100% of similar users has this access<br/>100% of users reporting to this Manager have this access<br/>100% of users with this Cost Center have this access',
            },
          },
        },
        {
          employeeName: 'Gaurav Sharma',
          folderOrFileNames: {
            type: 'folder',
            name: 'Travel Data',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/Travel Data',
          category: 'SOC 2',
          decision: {
            approve: false,
            reject: false,
            message: {
              title: 'Recommended',
              desc: '100% of similar users has this access<br/>100% of users reporting to this Manager have this access<br/>100% of users with this Cost Center have this access',
            },
          },
        },
        {
          employeeName: 'Christopher Williams',
          folderOrFileNames: {
            type: 'file',
            name: 'Medical Reimbursements.xls',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/Medical Reimbursements',
          category: 'GDPR',
          decision: {
            approve: false,
            reject: false,
            message: {
              title: 'Recommended',
              desc: '100% of similar users has this access<br/>100% of users reporting to this Manager have this access<br/>100% of users with this Cost Center have this access',
            },
          },
        },
      ],
    },
    {
      name: 'Review',
      key: 'review',
      data: [
        {
          employeeName: 'Amanda James',
          folderOrFileNames: {
            type: 'folder',
            name: 'Legal',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/Legal/Folder/legal',
          category: 'PIL',
          decision: {
            approve: true,
            reject: false,
          },
        },
        {
          employeeName: 'Amanda James',
          folderOrFileNames: {
            type: 'file',
            name: 'Human Resources.xls',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
          category: 'HIPAA',
          decision: {
            approve: true,
            reject: false,
          },
        },
        {
          employeeName: 'James Smith',
          folderOrFileNames: {
            type: 'file',
            name: 'Mediclaims.xls',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/Mediclaim',
          category: 'PDPB',
          decision: {
            approve: false,
            reject: true,
          },
        },
        {
          employeeName: 'Amjad Ali Khan',
          folderOrFileNames: {
            type: 'folder',
            name: 'Insurance Data',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/Insurance',
          category: 'GDPR',
          decision: {
            approve: true,
            reject: false,
          },
        },
        {
          employeeName: 'Gaurav Sharma',
          folderOrFileNames: {
            type: 'folder',
            name: 'Travel Data',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/Travel Data',
          category: 'SOC 2',
          decision: {
            approve: true,
            reject: false,
          },
        },
        {
          employeeName: 'Christopher Williams',
          folderOrFileNames: {
            type: 'file',
            name: 'Medical Reimbursements.xls',
          },
          resourceFullPath:
            'https://bridgesoft.sharepoint.com/sites/humanresources/documents/Medical Reimbursements',
          category: 'GDPR',
          decision: {
            approve: false,
            reject: true,
          },
        },
      ],
    },
  ];

  columnConfigImportant = [
    { key: 'policyName', label: 'Policy Name', visible: true },
    { key: 'rule', label: 'Rule', visible: true },
    { key: 'folderFileName', label: 'Folder / File Name', visible: true },
    { key: 'resourceFullPath', label: 'Resource Full Path', visible: true },
    { key: 'identity', label: 'Identity', visible: true },
    { key: 'decision', label: 'Decision', visible: true },
  ];

  columnConfigOpen = [
    { key: 'policyName', label: 'Policy Name', visible: true },
    { key: 'folderFileName', label: 'Folder / File Name', visible: true },
    { key: 'resourceFullPath', label: 'Resource Full Path', visible: true },
    { key: 'categories', label: 'Categories', visible: true },
    { key: 'decision', label: 'Decision', visible: true },
  ];

  columnConfigReview = [
    { key: 'policyName', label: 'Policy Name', visible: true },
    { key: 'folderFileName', label: 'Folder / File Name', visible: true },
    { key: 'resourceFullPath', label: 'Resource Full Path', visible: true },
    { key: 'categories', label: 'Categories', visible: true },
    { key: 'decision', label: 'Decision', visible: true },
  ];

  allColumnsImportant: string[] = [
    'policyName',
    'rule',
    'folderFileName',
    'resourceFullPath',
    'identity',
    'decision',
  ];

  allColumnsOpen: string[] = [
    'employeename',
    'folderFileName',
    'resourceFullPath',
    'categories',
    'decision',
  ];
  allColumnsReview: string[] = [
    'employeename',
    'folderFileName',
    'resourceFullPath',
    'categories',
    'decision',
  ];

  displayedColumnsImportant: string[] = [...this.allColumnsImportant];

  displayedColumnsOpen: string[] = [...this.allColumnsOpen];
  displayedColumnsReview: string[] = [...this.allColumnsReview];

  dataSourceImportant: TableRowImportant[] = [];
  originalData: TableRowImportant[] = [];

  dataSourceOpen: TableRowOpen[] = [];
  originalDataOpen: TableRowOpen[] = [];

  dataSourceReview: TableRowReview[] = [];
  originalDataReview: TableRowReview[] = [];

  totalCount = 0;
  showingCount = 0;

  selection = new Set<TableRowImportant>();

  categoriesImportant: string[] = [];
  categoriesOpen: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private sanitizer: DomSanitizer,
  ) {}
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  // APPLY ALL FILTERS
  applyFilters() {
    let filtered = [...this.originalData];

    // SEARCH
    if (this.searchText) {
      filtered = filtered.filter(
        (row) =>
          row.policyName.toLowerCase().includes(this.searchText) ||
          row.rule.toLowerCase().includes(this.searchText) ||
          row.folderFileName.toLowerCase().includes(this.searchText) ||
          row.identity.toLowerCase().includes(this.searchText),
      );
    }

    // CATEGORY
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (row) => row.policyName === this.selectedCategory,
      );
    }

    // TYPE
    if (this.selectedType) {
      filtered = filtered.filter((row) => row.type === this.selectedType);
    }

    this.dataSourceImportant = filtered;
    this.showingCount = filtered.length;
  }

  // SEARCH
  onSearch(value: string) {
    this.searchText = value.toLowerCase();
    this.applyFilters();
  }

  // CATEGORY FILTER
  filterCategory(value: string) {
    this.selectedCategory = value;
    this.applyFilters();
  }

  // TYPE FILTER
  filterType(type: string) {
    this.selectedType = type;
    this.applyFilters();
  }

  // BULK DECISION
  applyBulkDecision(action: string) {
    this.selection.forEach((row) => {
      if (action === 'approve') {
        row.approve = true;
        row.reject = false;
      }

      if (action === 'reject') {
        row.approve = false;
        row.reject = true;
      }
    });

    this.selection.clear();

    // refresh table
    this.dataSourceImportant = [...this.dataSourceImportant];
  }
  updateColumns(cols: string[]) {
    this.displayedColumnsImportant = cols;
  }
  // COLUMN VISIBILITY
  updateDisplayedColumnsImportant() {
    this.displayedColumnsImportant = this.columnConfigImportant
      .filter((col) => col.visible)
      .map((col) => col.key);
  }
  toggleColumn(column: string, event: any) {
    event.stopPropagation();

    const index = this.displayedColumnsImportant.indexOf(column);

    if (index >= 0) {
      this.displayedColumnsImportant.splice(index, 1);
    } else {
      this.displayedColumnsImportant.push(column);
    }

    this.displayedColumnsImportant = [...this.displayedColumnsImportant];
  }

  // ROW SELECTION
  toggleRow(row: TableRowImportant) {
    if (this.selection.has(row)) {
      this.selection.delete(row);
    } else {
      this.selection.add(row);
    }
  }
  toggleAllColumns(event: any) {
    event.stopPropagation();

    if (
      this.displayedColumnsImportant.length === this.allColumnsImportant.length
    ) {
      this.displayedColumnsImportant = [];
    } else {
      this.displayedColumnsImportant = [...this.allColumnsImportant];
    }
  }
  toggleAllRows() {
    if (this.selection.size === this.dataSourceImportant.length) {
      this.selection.clear();
    } else {
      this.dataSourceImportant.forEach((row) => this.selection.add(row));
    }
  }
  isallColumnsSelected(): boolean {
    return (
      this.displayedColumnsImportant.length === this.allColumnsImportant.length
    );
  }
  isAllSelected(): boolean {
    return (
      this.displayedColumnsImportant.length === this.allColumnsImportant.length
    );
  }

  isIndeterminate(): boolean {
    return (
      this.selection.size > 0 &&
      this.selection.size < this.dataSourceImportant.length
    );
  }
  private dialog = inject(MatDialog);
  openEmployeeDialog() {
    this.dialog.open(EmployeedetailspopupComponent, {
      width: '46rem',
      minWidth: '46rem',
      maxWidth: '100%',
    });
  }
  openForwoardDialog() {
    this.dialog.open(ForwardpopupComponent, {
      width: '46rem',
      minWidth: '46rem',
      maxWidth: '100%',
    });
  }
  ngOnInit(): void {
    const importantTab = this.tabs.find((t) => t.key === 'important');
    const openTab = this.tabs.find((t) => t.key === 'open');
    const reviewTab = this.tabs.find((t) => t.key === 'review');

    if (importantTab) {
      this.originalData = importantTab.data.map((item: Important) => ({
        policyName: item.policyName,
        rule: item.rule,
        folderFileName: item.folderOrFileNames.name,
        type: item.folderOrFileNames.type,
        resourceFullPath: item.resourceFullPath,
        identity: item.identity,

        warningType: item.warning?.type,
        warningMsg: item.warning?.message,

        approve: item.decision.approve,
        reject: item.decision.reject,
        menuAvailable: item.decision.menuAvailable,
      }));

      this.dataSourceImportant = [...this.originalData];

      this.totalCount = this.originalData.length;
      this.showingCount = this.dataSourceImportant.length;

      // AUTO CATEGORY LIST
      this.categoriesImportant = [
        ...new Set(this.originalData.map((row) => row.policyName)),
      ];

      this.isLoading = false;
    }

    if (openTab) {
      this.originalDataOpen = openTab.data.map((item: Open) => ({
        employeename: item.employeeName,
        folderFileName: item.folderOrFileNames.name,
        type: item.folderOrFileNames.type,
        resourceFullPath: item.resourceFullPath,
        categories: item.category,

        approve: item.decision.approve,
        reject: item.decision.reject,
        messagetitle: item.decision.message.title,
        messagedesc: item.decision.message.desc,
      }));

      this.dataSourceOpen = [...this.originalDataOpen];

      // this.totalCount = this.originalData.length;
      // this.showingCount = this.dataSourceImportant.length;

      // AUTO CATEGORY LIST
      this.categoriesOpen = [
        ...new Set(this.originalDataOpen.map((row) => row.categories)),
      ];

      this.isLoading = false;
    }

    if (reviewTab) {
      this.originalDataReview = reviewTab.data.map((item: Review) => ({
        employeename: item.employeeName,
        folderFileName: item.folderOrFileNames.name,
        type: item.folderOrFileNames.type,
        resourceFullPath: item.resourceFullPath,
        categories: item.category,

        approve: item.decision.approve,
        reject: item.decision.reject,
      }));

      this.dataSourceReview = [...this.originalDataReview];

      // this.totalCount = this.originalData.length;
      // this.showingCount = this.dataSourceImportant.length;

      // AUTO CATEGORY LIST

      this.isLoading = false;
    }
  }
}
