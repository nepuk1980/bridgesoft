import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatRadioModule } from '@angular/material/radio';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ApiService } from '../../services/api.service';
import { ReportService } from '../../services/report.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface TableRowImportant {
  folderFileName: string;
  resourceFullPath: string;
  category: string;
  criticality: string;
  itemType: string;
  access: {
    fullControl: boolean;
    modify: boolean;
    readExecute: boolean;
    listFolder: boolean;
    read: boolean;
    write: boolean;
  };
}

@Component({
  selector: 'app-request-workflow',
  standalone: true,
  imports: [
    InnerheaderComponent,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    NgxSkeletonLoaderModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    NgFor,
    MatTableModule,
    MatButtonModule,
    RouterModule,
    MatRadioModule,
    NgIf,
    MatSnackBarModule,
  ],
  templateUrl: './request-workflow.component.html',
  styleUrl: './request-workflow.component.css',
})
export class RequestWorkflowComponent implements OnInit {
  vaultId: number = 0;

  // Filters
  searchText: string = '';
  selectedCategory: string = '';
  selectedCriticality: string = '';
  selectedFilterIds: number[] = [];
  selectedDownload: string = 'download';

  // Data
  dataSourceImportant: TableRowImportant[] = [];
  selectedUsers: any[] = [];
  categoriesImportant: string[] = []; // current dropdown
  allCategoriesImportant: string[] = []; // master list

  // Pagination State
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  showingCount = 0;
  pages: number[] = [];

  // ✅ PAGE CACHE
  pageCache: { [key: string]: any } = {};

  isLoading = false;

  displayedColumnsImportant: string[] = [
    'folderFileName',
    'resourceFullPath',
    'category',
    'access',
    'criticality',
  ];

  selection = new Set<TableRowImportant>();

  private sanitizer = inject(DomSanitizer);
  private api = inject(ApiService);
  private reportService = inject(ReportService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor(private snackBar: MatSnackBar) {
    const nav = this.router.getCurrentNavigation();

    this.selectedUsers =
      nav?.extras?.state?.['selectedUsers'] ??
      history.state?.selectedUsers ??
      [];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.vaultId = Number(params['vaultId']) || 0;

      // ✅ CLEAR CACHE ON PARAM CHANGE
      this.pageCache = {};

      this.getWorkflowData();
    });
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ✅ UNIQUE CACHE KEY
  private getCacheKey(page: number): string {
    return JSON.stringify({
      page,
      pageSize: this.pageSize,
      search: this.searchText,
      category: this.selectedCategory,
      criticality: this.selectedCriticality,
      filters: this.selectedFilterIds,
    });
  }

  // --- API CALL (PAGINATED) ---
  getWorkflowData() {
    const filterString = this.selectedFilterIds.join(',');

    const cacheKey = this.getCacheKey(this.pageIndex);

    // ✅ LOAD FROM CACHE
    if (this.pageCache[cacheKey]) {
      const cached = this.pageCache[cacheKey];

      this.dataSourceImportant = cached.data;
      this.totalElements = cached.totalElements;
      this.totalPages = cached.totalPages;
      this.showingCount = cached.showingCount;

      this.generatePages();
      this.preloadNextPages();

      return;
    }

    // ✅ CLEAR OLD DATA BEFORE API
    this.dataSourceImportant = [];
    this.totalElements = 0;
    this.totalPages = 0;
    this.showingCount = 0;
    this.pages = [];

    this.isLoading = true;

    this.api
      .getAllFilesAndFoldersDetails(
        this.searchText,
        this.selectedCategory,
        filterString,
        this.pageIndex,
        this.pageSize,
      )
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          const data = res?.content || res?.data || [];

          // ✅ HANDLE EMPTY RESULT
          if (!data.length) {
            this.dataSourceImportant = [];
            this.categoriesImportant = [];
            this.totalElements = 0;
            this.totalPages = 0;
            this.showingCount = 0;
            this.pages = [];

            return;
          }

          const mappedData = data.map((item: any) => ({
            folderFileName: item.itemName,
            resourceFullPath: item.itemUrl,
            category: item.category,
            criticality: 'Open',
            access: {
              fullControl: false,
              modify: false,
              readExecute: false,
              listFolder: false,
              read: false,
              write: false,
            },
            itemType: item.itemType,
          }));

          this.dataSourceImportant = mappedData;

          this.totalElements = res?.totalElements || 0;
          this.totalPages = res?.totalPages || 0;
          this.showingCount = mappedData.length;

          // ✅ DYNAMIC CATEGORY UPDATE
          const dynamicCategories = Array.from(
            new Set<string>(
              mappedData
                .map((item: any) => item.category as string)
                .filter((category: string) => !!category),
            ),
          );

          // ✅ store master categories only once
          if (!this.allCategoriesImportant.length) {
            this.allCategoriesImportant = dynamicCategories;
          }

          // ✅ always show full category list
          this.categoriesImportant = [...this.allCategoriesImportant];

          // ✅ SAVE CACHE
          this.pageCache[cacheKey] = {
            data: mappedData,
            totalElements: this.totalElements,
            totalPages: this.totalPages,
            showingCount: this.showingCount,
          };

          this.generatePages();
          this.preloadNextPages();
        },

        error: (err) => {
          console.error('Pagination API Error:', err);

          this.isLoading = false;

          // ✅ ALSO CLEAR ON ERROR
          this.dataSourceImportant = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.showingCount = 0;
        },
      });
  }

  // ✅ PRELOAD NEXT 2 PAGES SILENTLY
  preloadNextPages() {
    const nextPages = [this.pageIndex + 1, this.pageIndex + 2];

    const filterString = this.selectedFilterIds.join(',');

    nextPages.forEach((page) => {
      // skip invalid pages
      if (page >= this.totalPages) return;

      const cacheKey = this.getCacheKey(page);

      // skip cached pages
      if (this.pageCache[cacheKey]) return;

      this.api
        .getAllFilesAndFoldersDetails(
          this.searchText,
          this.selectedCategory,
          filterString,
          page,
          this.pageSize,
        )
        .subscribe({
          next: (res: any) => {
            const data = Array.isArray(res?.content)
              ? res.content
              : Array.isArray(res?.data)
                ? res.data
                : [];

            const mappedData = data.map((item: any) => ({
              folderFileName: item.itemName,
              resourceFullPath: item.itemUrl,
              category: item.category,
              criticality: 'Open',
              access: {
                fullControl: false,
                modify: false,
                readExecute: false,
                listFolder: false,
                read: false,
                write: false,
              },
              itemType: item.itemType,
            }));

            // ✅ STORE PRELOADED DATA
            this.pageCache[cacheKey] = {
              data: mappedData,
              totalElements: res?.totalElements || mappedData.length,
              totalPages:
                res?.totalPages || Math.ceil(mappedData.length / this.pageSize),
              showingCount: mappedData.length,
            };
          },

          error: (err) => {
            console.error('Preload failed', err);
          },
        });
    });
  }

  // --- EXPORT LOGIC (FETCH ALL FILTERED DATA) ---
  private fetchExportData(callback: (data: TableRowImportant[]) => void) {
    const filterString = this.selectedFilterIds.join(',');

    this.api
      .getAllFilesAndFoldersDetails(
        this.searchText,
        this.selectedCategory,
        filterString,
        0,
        99999,
      )
      .subscribe({
        next: (res: any) => {
          const rawData = res?.data || res?.content || res || [];

          const allDataMpped = rawData.map((item: any) => ({
            folderFileName: item.itemName,
            resourceFullPath: item.itemUrl,
            category: item.category,
            criticality: 'Open',
            itemType: item.itemType,
          }));

          callback(allDataMpped);
        },

        error: (err) => console.error('Export fetch failed:', err),
      });
  }

  downloadExcel() {
    this.fetchExportData((allData) => {
      this.reportService.downloadExcel(allData, 'Workflow_Report', 'Workflow');
    });
  }

  downloadCSV() {
    this.fetchExportData((allData) => {
      this.reportService.downloadCSV(allData, 'Workflow_Report', 'Workflow');
    });
  }

  downloadPDF() {
    this.fetchExportData((allData) => {
      this.reportService.downloadPDF(allData, 'Workflow_Report', 'Workflow');
    });
  }

  // --- FILTER ACTIONS ---
  searchTimeout: any;

  onSearch(value: string) {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.searchText = value?.trim() || '';

      console.log('SEARCH VALUE =>', this.searchText);

      // reset everything
      this.pageIndex = 0;
      this.pageCache = {};
      this.dataSourceImportant = [];
      this.totalElements = 0;
      this.totalPages = 0;
      this.showingCount = 0;
      this.allCategoriesImportant = [];

      this.getWorkflowData();
    }, 500);
  }

  filterCategory(value: string) {
    this.selectedCategory = value || '';

    this.pageIndex = 0;

    // ✅ CLEAR CACHE
    this.pageCache = {};

    this.getWorkflowData();
  }

  filterCriticality(value: string) {
    this.selectedCriticality = value || '';

    this.pageIndex = 0;

    // ✅ CLEAR CACHE
    this.pageCache = {};

    this.getWorkflowData();
  }

  filterType(id: number, checked: boolean) {
    if (checked) {
      if (!this.selectedFilterIds.includes(id)) {
        this.selectedFilterIds.push(id);
      }
    } else {
      this.selectedFilterIds = this.selectedFilterIds.filter((x) => x !== id);
    }

    this.pageIndex = 0;

    // ✅ CLEAR CACHE
    this.pageCache = {};

    this.getWorkflowData();
  }

  // --- PAGINATION NAVIGATION ---
  generatePages() {
    const visible = 3;

    this.pages = [];

    if (this.totalPages <= 0) return;

    let start = Math.max(1, this.pageIndex + 1 - Math.floor(visible / 2));

    let end = Math.min(this.totalPages, start + visible - 1);

    if (end - start < visible - 1) {
      start = Math.max(1, end - visible + 1);
    }

    for (let i = start; i <= end; i++) {
      if (i > 0) {
        this.pages.push(i);
      }
    }
  }

  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.getWorkflowData();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.getWorkflowData();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.getWorkflowData();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.getWorkflowData();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.getWorkflowData();
  }

  // --- SELECTION ---
  toggleRow(row: TableRowImportant) {
    this.selection.has(row)
      ? this.selection.delete(row)
      : this.selection.add(row);
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSourceImportant.forEach((row) => this.selection.add(row));
    }
  }

  isAllSelected(): boolean {
    return (
      this.dataSourceImportant.length > 0 &&
      this.selection.size === this.dataSourceImportant.length
    );
  }

  isIndeterminate(): boolean {
    return (
      this.selection.size > 0 &&
      this.selection.size < this.dataSourceImportant.length
    );
  }

  // --- SUBMISSION ---
  submitAccessRequest() {
    const itemsToSubmit = Array.from(this.selection);

    if (!this.selectedUsers.length || !itemsToSubmit.length) {
      this.showMessage('Please select users and items');
      return;
    }

    let totalCalls = this.selectedUsers.length * itemsToSubmit.length;
    let successCount = 0;
    let hasError = false;

    for (const user of this.selectedUsers) {
      for (const row of itemsToSubmit) {
        const accessList: string[] = [];

        if (row.access.fullControl) accessList.push('Full');
        if (row.access.modify) accessList.push('Modify');
        if (row.access.readExecute) accessList.push('Read & Execute');
        if (row.access.listFolder) accessList.push('List Folder Content');
        if (row.access.read) accessList.push('Read');
        if (row.access.write) accessList.push('Write');

        const payload = {
          employeeName: user?.name ?? '',
          employeeEmail: user?.emailpass ?? '',
          folderFileName: row.folderFileName,
          resourceFullPath: row.resourceFullPath,
          category: row.category,
          criticality: row.criticality,
          sourceType: row.itemType,
          accessLevel: accessList.join(', '),
        };

        this.api.saveaccessrequestdetails(payload).subscribe({
          next: () => {
            successCount++;

            // ✅ Show success only once when all calls complete
            if (successCount === totalCalls && !hasError) {
              this.showMessage('Access request submitted successfully');
              this.selection.clear();
            }
          },
          error: (err) => {
            console.error('Error saving:', err);

            // ✅ Show error only once
            if (!hasError) {
              this.showMessage('Failed to submit some requests');
              hasError = true;
            }
          },
        });
      }
    }
  }
  // ✅ SNACKBAR
  showMessage(message: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }
}
