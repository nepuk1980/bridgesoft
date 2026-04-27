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
import { ReviewAccessInterface } from '../../models/type';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatTabChangeEvent } from '@angular/material/tabs';
import { ReportService } from '../../services/report.service';

// TYPES

interface TableRowImportant {
  id: number;
  folderFileName: string;
  resourceFullPath: string;
  category: string;
  identityEmployeeName: string;
  decision: boolean;
  sourceType: string;
  approve?: boolean;
  reject?: boolean;
}

interface TableRowOpen {
  id: number;
  folderFileName: string;
  resourceFullPath: string;
  category: string;
  identityEmployeeName: string;
  decision: boolean;
  sourceType: string;
  approve?: boolean;
  reject?: boolean;
}

interface TableRowReview {
  id: number;
  folderFileName: string;
  resourceFullPath: string;
  category: string;
  identityEmployeeName: string;
  decision: boolean;
  sourceType: string;
  approve?: boolean;
  reject?: boolean;
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
  bulkdecisions = '';
  selectedDownloadImportant = 'download';
  selectedDownloadOpen = 'download';
  selectedDownloadReview = 'download';

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
          // identity: 'Amanda James',
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
          // identity: 'Jonas Jilton',
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
    { key: 'folderFileName', label: 'Folder / File Name', visible: true },
    { key: 'resourceFullPath', label: 'Resource Full Path', visible: true },
    { key: 'category', label: 'Categories', visible: true },
    {
      key: 'identityEmployeeName',
      label: 'Identity Employee Name',
      visible: true,
    },
    { key: 'decision', label: 'Decision', visible: true },
  ];

  columnConfigOpen = [
    {
      key: 'identityEmployeeName',
      label: 'Identity Employee Name',
      visible: true,
    },
    { key: 'folderFileName', label: 'Folder / File Name', visible: true },
    { key: 'resourceFullPath', label: 'Resource Full Path', visible: true },
    { key: 'category', label: 'Categories', visible: true },

    { key: 'decision', label: 'Decision', visible: true },
  ];

  columnConfigReview = [
    {
      key: 'identityEmployeeName',
      label: 'Identity Employee Name',
      visible: true,
    },
    { key: 'folderFileName', label: 'Folder / File Name', visible: true },
    { key: 'resourceFullPath', label: 'Resource Full Path', visible: true },
    { key: 'category', label: 'Categories', visible: true },

    { key: 'decision', label: 'Decision', visible: true },
  ];

  allColumnsImportant: string[] = [
    'folderFileName',
    'resourceFullPath',
    'category',
    'identityEmployeeName',
    'decision',
  ];

  allColumnsOpen: string[] = [
    'identityEmployeeName',
    'folderFileName',
    'resourceFullPath',
    'category',
    'decision',
  ];
  allColumnsReview: string[] = [
    'identityEmployeeName',
    'folderFileName',
    'resourceFullPath',
    'category',
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

  totalCountImportant = 0;
  showingCountImportant = 0;

  totalCountOpen = 0;
  showingCountOpen = 0;

  totalCountReview = 0;
  showingCountReview = 0;

  selection = new Set<TableRowImportant>();

  categoriesImportant: string[] = [];
  categoriesOpen: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private reportService: ReportService,
  ) {}
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  // APPLY ALL FILTERS
  applyFiltersImportant(resetPage: boolean = false) {
    let filtered = [...this.originalData];

    if (this.searchText) {
      filtered = filtered.filter(
        (row) =>
          row.folderFileName.toLowerCase().includes(this.searchText) ||
          row.resourceFullPath.toLowerCase().includes(this.searchText) ||
          row.category.toLowerCase().includes(this.searchText) ||
          row.identityEmployeeName.toLowerCase().includes(this.searchText),
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(
        (row) => row.category === this.selectedCategory,
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter((row) => row.sourceType === this.selectedType);
    }

    this.showingCountImportant = filtered.length;

    // ✅ FIX
    if (resetPage) {
      this.pagination.important.pageIndex = 0;
    }

    this.paginate('important', filtered);
  }

  // SEARCH
  onSearchImportant(value: string) {
    this.searchText = value.toLowerCase();
    this.applyFiltersImportant();
  }

  // CATEGORY FILTER
  filterCategoryImportant(value: string = '') {
    this.selectedCategory = value;
    this.applyFiltersImportant();
  }

  // TYPE FILTER
  filterTypeImportant(type: string) {
    this.selectedType = type;
    this.applyFiltersImportant();
  }

  // APPLY ALL FILTERS
  applyFiltersOpen(resetPage: boolean = false) {
    let filtered = [...this.originalDataOpen];

    if (this.searchText) {
      filtered = filtered.filter(
        (row) =>
          row.folderFileName.toLowerCase().includes(this.searchText) ||
          row.resourceFullPath.toLowerCase().includes(this.searchText) ||
          row.category.toLowerCase().includes(this.searchText) ||
          row.identityEmployeeName.toLowerCase().includes(this.searchText),
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(
        (row) => row.category === this.selectedCategory,
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter((row) => row.sourceType === this.selectedType);
    }

    this.showingCountOpen = filtered.length;

    // ✅ FIX
    if (resetPage) {
      this.pagination.open.pageIndex = 0;
    }

    this.paginate('open', filtered);
  }
  // SEARCH
  onSearchOpen(value: string) {
    this.searchText = value.toLowerCase();
    this.applyFiltersOpen();
  }

  // CATEGORY FILTER
  filterCategoryOpen(value: string = '') {
    this.selectedCategory = value;
    this.applyFiltersOpen();
  }

  // TYPE FILTER
  filterTypeOpen(type: string) {
    this.selectedType = type;
    this.applyFiltersOpen();
  }

  // APPLY ALL FILTERS
  applyFiltersReview(resetPage: boolean = false) {
    let filtered = [...this.originalDataReview];

    if (this.searchText) {
      filtered = filtered.filter(
        (row) =>
          row.folderFileName.toLowerCase().includes(this.searchText) ||
          row.resourceFullPath.toLowerCase().includes(this.searchText) ||
          row.category.toLowerCase().includes(this.searchText) ||
          row.identityEmployeeName.toLowerCase().includes(this.searchText),
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter((row) => row.sourceType === this.selectedType);
    }

    this.showingCountReview = filtered.length;

    // ✅ FIX
    if (resetPage) {
      this.pagination.review.pageIndex = 0;
    }

    this.paginate('review', filtered);
  }

  // SEARCH
  onSearchReview(value: string) {
    this.searchText = value.toLowerCase();
    this.applyFiltersReview();
  }

  // TYPE FILTER
  filterTypeReview(type: string) {
    this.selectedType = type;
    this.applyFiltersReview();
  }

  showMessage(message: string) {
    this.snackBar.open(message, '', {
      duration: 1000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  // BULK DECISION
  applyBulkDecisionImportantToAll(action: 'approve' | 'reject') {
    if (this.dataSourceImportant.length === 0) {
      console.warn('⚠️ No data available');
      return;
    }

    // ✅ collect ALL ids (not just selected)
    const ids = this.dataSourceImportant.map((row) => row.id);

    const status: 'Approved' | 'Rejected' =
      action === 'approve' ? 'Approved' : 'Rejected';

    console.log('🚀 BULK ALL API:', { ids, status });

    this.api.updateAccessRequestDetails(ids, status).subscribe({
      next: () => {
        console.log('✅ All rows updated');

        this.dataSourceImportant.forEach((row) => {
          const isApproved = status === 'Approved';

          row.decision = isApproved;
          row.approve = isApproved;
          row.reject = !isApproved;
        });

        this.selection.clear();
        this.dataSourceImportant = [...this.dataSourceImportant];

        // ✅ snackbar
        this.showMessage(`All access ${status}`);
      },
      error: (err) => {
        console.error('❌ Bulk ALL failed:', err);

        // ❌ snackbar
        this.showMessage('Bulk update failed');
      },
    });
  }

  applyBulkDecisionOpenToAll(action: 'approve' | 'reject') {
    if (this.dataSourceOpen.length === 0) {
      console.warn('⚠️ No data available');
      return;
    }

    // ✅ collect ALL ids (not just selected)
    const ids = this.dataSourceOpen.map((row) => row.id);

    const status: 'Approved' | 'Rejected' =
      action === 'approve' ? 'Approved' : 'Rejected';

    console.log('🚀 BULK ALL API:', { ids, status });

    this.api.updateAccessRequestDetails(ids, status).subscribe({
      next: () => {
        console.log('✅ All rows updated');

        this.dataSourceOpen.forEach((row) => {
          const isApproved = status === 'Approved';

          row.decision = isApproved;
          row.approve = isApproved;
          row.reject = !isApproved;
        });

        this.selection.clear();
        this.dataSourceOpen = [...this.dataSourceOpen];

        // ✅ snackbar
        this.showMessage(`All access ${status}`);
      },
      error: (err) => {
        console.error('❌ Bulk ALL failed:', err);

        // ❌ snackbar
        this.showMessage('Bulk update failed');
      },
    });
  }

  onDecisionClick(row: TableRowImportant, action: 'approve' | 'reject') {
    const isApprove = action === 'approve';

    // ✅ update UI state immediately (optimistic UI)
    row.approve = isApprove;
    row.reject = !isApprove;
    row.decision = isApprove;

    const status: 'Approved' | 'Rejected' = isApprove ? 'Approved' : 'Rejected';

    this.api.updateAccessRequestDetails([row.id], status).subscribe({
      next: () => {
        console.log('✅ Row updated');

        // ✅ snackbar success
        this.showMessage(`Access ${status}`);
      },
      error: (err) => {
        console.error('❌ Update failed', err);

        // ❗ revert UI (important for consistency)
        row.approve = !isApprove;
        row.reject = isApprove;
        row.decision = !isApprove;

        // ❌ snackbar error
        this.showMessage('Update failed');
      },
    });
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
  onColumnChange(cols: string[]) {
    // 🔥 prevent 'ALL' pollution (safety)
    this.displayedColumnsImportant = cols.filter((c) => c !== 'ALL');
  }
  toggleAllColumns(event: any) {
    event.stopPropagation();

    if (this.isAllColumnsSelected()) {
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
  isAllColumnsSelected(): boolean {
    return (
      this.displayedColumnsImportant.length === this.allColumnsImportant.length
    );
  }
  isAllSelected(): boolean {
    return this.selection.size === this.dataSourceImportant.length;
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

  onTabChange(event: MatTabChangeEvent) {
    const tabKey = this.tabs[event.index]?.key;

    console.log('Switched to:', tabKey);

    if (tabKey === 'important') this.loadImportant();
    else if (tabKey === 'open') this.loadOpen();
    else if (tabKey === 'review') this.loadReview();
  }

  ngOnInit(): void {
    this.loadImportant(); // load first tab only
  }

  loadImportant() {
    this.isLoading = true;

    this.api.getlistofimportantaccessrequests('', '').subscribe({
      next: (res: ReviewAccessInterface[]) => {
        this.originalData = res.map((item) => {
          const isApproved = item.decision === 'Approved';
          const isRejected = item.decision === 'Rejected';

          return {
            id: item.id,
            folderFileName: item.folderFileName,
            resourceFullPath: item.resourceFullPath,
            category: item.category,
            identityEmployeeName: item.employeeName,
            decision: isApproved,
            sourceType: item.sourceType,
            approve: isApproved,
            reject: isRejected,
          };
        });

        this.dataSourceImportant = [...this.originalData];
        this.totalCountImportant = this.originalData.length;
        this.showingCountImportant = this.dataSourceImportant.length;

        this.categoriesImportant = [
          ...new Set(this.originalData.map((row) => row.category)),
        ];

        this.pagination.important.pageIndex = 0;
        this.paginate('important', this.originalData);
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  loadOpen() {
    this.isLoading = true;

    this.api.getlistofopenaccessrequests('', '').subscribe({
      next: (res: ReviewAccessInterface[]) => {
        this.originalDataOpen = res.map((item) => {
          const isApproved = item.decision === 'Approved';
          const isRejected = item.decision === 'Rejected';

          return {
            id: item.id,
            folderFileName: item.folderFileName,
            resourceFullPath: item.resourceFullPath,
            category: item.category,
            identityEmployeeName: item.employeeName,
            decision: isApproved,
            sourceType: item.sourceType,
            approve: isApproved,
            reject: isRejected,
          };
        });

        this.dataSourceOpen = [...this.originalDataOpen];
        this.totalCountOpen = this.originalDataOpen.length;
        this.showingCountOpen = this.dataSourceOpen.length;

        this.categoriesOpen = [
          ...new Set(this.originalDataOpen.map((row) => row.category)),
        ];
        this.pagination.open.pageIndex = 0;
        this.paginate('open', this.originalDataOpen);
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  loadReview() {
    this.isLoading = true;

    this.api.getlistofreviewaccessrequests('', '').subscribe({
      next: (res: ReviewAccessInterface[]) => {
        this.originalDataReview = res.map((item) => {
          const isApproved = item.decision === 'Approved';
          const isRejected = item.decision === 'Rejected';

          return {
            id: item.id,
            folderFileName: item.folderFileName,
            resourceFullPath: item.resourceFullPath,
            category: item.category,
            identityEmployeeName: item.employeeName,
            decision: isApproved,
            sourceType: item.sourceType,
            approve: isApproved,
            reject: isRejected,
          };
        });

        this.dataSourceReview = [...this.originalDataReview];
        this.totalCountReview = this.originalDataReview.length;
        this.showingCountReview = this.dataSourceReview.length;

        this.pagination.review.pageIndex = 0;
        this.paginate('review', this.originalDataReview);

        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
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

  private getExportDataImportant() {
    return this.originalData.map((item) => ({
      'Folder File Name': item.folderFileName,
      'Resource Full Path': item.resourceFullPath,
      Category: item.category,
      'Employee Name': item.identityEmployeeName,
      Decision: item.decision ? 'Approved' : 'Rejected',
    }));
  }
  downloadExcelImportant() {
    const data = this.getExportDataImportant();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `review-access-important-report_${timestamp}`,
      'Review Access Important',
    );
  }

  downloadCSVImportant() {
    const data = this.getExportDataImportant();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `review-access-important-report_${timestamp}`,
      'Review Access Important',
    );
  }

  downloadPDFImportant() {
    const data = this.getExportDataImportant();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `review-access-important-report_${timestamp}`,
      'Review Access Important',
    );
  }

  private getExportDataOpen() {
    return this.originalDataOpen.map((item) => ({
      'Employee Name': item.identityEmployeeName,
      'Folder File Name': item.folderFileName,
      'Resource Full Path': item.resourceFullPath,
      Category: item.category,
      Decision: item.decision ? 'Approved' : 'Rejected',
    }));
  }
  downloadExcelOpen() {
    const data = this.getExportDataOpen();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `review-access-open-report_${timestamp}`,
      'Review Access Open',
    );
  }

  downloadCSVOpen() {
    const data = this.getExportDataOpen();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `review-access-open-report_${timestamp}`,
      'Review Access Open',
    );
  }

  downloadPDFOpen() {
    const data = this.getExportDataOpen();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `review-access-open-report_${timestamp}`,
      'Review Access Open',
    );
  }

  private getExportDataReview() {
    return this.originalDataReview.map((item) => ({
      'Employee Name': item.identityEmployeeName,
      'Folder File Name': item.folderFileName,
      'Resource Full Path': item.resourceFullPath,
      Category: item.category,
      Decision: item.decision ? 'Approved' : 'Rejected',
    }));
  }
  downloadExcelReview() {
    const data = this.getExportDataReview();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `review-access-review-report_${timestamp}`,
      'Review Access Review',
    );
  }

  downloadCSVReview() {
    const data = this.getExportDataReview();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `review-access-review-report_${timestamp}`,
      'Review Access Review',
    );
  }

  downloadPDFReview() {
    const data = this.getExportDataReview();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `review-access-review-report_${timestamp}`,
      'Review Access Review',
    );
  }

  // ✅ PAGINATION PER TAB
  pagination = {
    important: {
      pageSize: 10,
      pageIndex: 0,
      totalPages: 0,
      totalElements: 0,
      pages: [] as number[],
      paginatedData: [] as TableRowImportant[],
    },
    open: {
      pageSize: 10,
      pageIndex: 0,
      totalPages: 0,
      totalElements: 0,
      pages: [] as number[],
      paginatedData: [] as TableRowOpen[],
    },
    review: {
      pageSize: 10,
      pageIndex: 0,
      totalPages: 0,
      totalElements: 0,
      pages: [] as number[],
      paginatedData: [] as TableRowReview[],
    },
  };

  private paginate(tab: 'important' | 'open' | 'review', data: any[]) {
    const p = this.pagination[tab];

    p.totalElements = data.length;
    p.totalPages = Math.ceil(p.totalElements / p.pageSize) || 1;

    // ✅ FIX: reset page if overflow after filter
    if (p.pageIndex >= p.totalPages) {
      p.pageIndex = 0;
    }

    const start = p.pageIndex * p.pageSize;
    const end = start + p.pageSize;

    p.paginatedData = data.slice(start, end);

    this.generatePages(tab);
  }

  generatePages(tab: 'important' | 'open' | 'review') {
    const p = this.pagination[tab];
    const visible = 3;

    if (p.totalPages <= 0) {
      p.pages = [];
      return;
    }

    let start = Math.max(1, p.pageIndex + 1);
    let end = Math.min(p.totalPages, start + visible - 1);

    if (end - start < visible - 1) {
      start = Math.max(1, end - visible + 1);
    }

    p.pages = [];
    for (let i = start; i <= end; i++) {
      p.pages.push(i);
    }
  }
  goToPage(tab: 'important' | 'open' | 'review', page: number) {
    this.pagination[tab].pageIndex = page - 1;
    this.applyTabFilters(tab);
  }

  nextPage(tab: 'important' | 'open' | 'review') {
    const p = this.pagination[tab];
    if (p.pageIndex < p.totalPages - 1) {
      p.pageIndex++;
      this.applyTabFilters(tab);
    }
  }

  prevPage(tab: 'important' | 'open' | 'review') {
    const p = this.pagination[tab];
    if (p.pageIndex > 0) {
      p.pageIndex--;
      this.applyTabFilters(tab);
    }
  }

  firstPage(tab: 'important' | 'open' | 'review') {
    this.pagination[tab].pageIndex = 0;
    this.applyTabFilters(tab);
  }

  lastPage(tab: 'important' | 'open' | 'review') {
    const p = this.pagination[tab];
    p.pageIndex = p.totalPages - 1;
    this.applyTabFilters(tab);
  }

  applyTabFilters(tab: 'important' | 'open' | 'review') {
    if (tab === 'important') this.applyFiltersImportant();
    if (tab === 'open') this.applyFiltersOpen();
    if (tab === 'review') this.applyFiltersReview();
  }
}
