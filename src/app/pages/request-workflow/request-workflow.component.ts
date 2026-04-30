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

interface TableRowImportant {
  folderFileName: string;
  resourceFullPath: string;
  category: string;
  criticality: string;
  itemType: string;
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
    MatTabsModule,
    NgFor,
    MatTableModule,
    MatButtonModule,
    RouterModule,
    MatRadioModule,
    NgIf,
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
  categoriesImportant: string[] = [];

  // Pagination State
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  showingCount = 0;
  pages: number[] = [];

  displayedColumnsImportant: string[] = [
    'folderFileName',
    'resourceFullPath',
    'category',
    'criticality',
  ];

  selection = new Set<TableRowImportant>();
  private sanitizer = inject(DomSanitizer);
  private api = inject(ApiService);
  private reportService = inject(ReportService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    const nav = this.router.getCurrentNavigation();
    this.selectedUsers =
      nav?.extras?.state?.['selectedUsers'] ??
      history.state?.selectedUsers ??
      [];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.vaultId = Number(params['vaultId']) || 0;
      this.getWorkflowData();
    });
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // --- API CALL (PAGINATED) ---
  getWorkflowData() {
    const filterString = this.selectedFilterIds.join(',');

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
          const data = res?.data || res?.content || res;

          this.dataSourceImportant = data.map((item: any) => ({
            folderFileName: item.itemName,
            resourceFullPath: item.itemUrl,
            category: item.category,
            criticality: 'Open',
            itemType: item.itemType,
          }));

          this.totalElements =
            res?.totalElements || this.dataSourceImportant.length;
          this.totalPages =
            res?.totalPages || Math.ceil(this.totalElements / this.pageSize);
          this.showingCount = this.dataSourceImportant.length;

          if (this.categoriesImportant.length === 0) {
            this.categoriesImportant = [
              ...new Set(this.dataSourceImportant.map((x) => x.category)),
            ];
          }

          this.generatePages();
        },
        error: (err) => console.error('Workflow API error:', err),
      });
  }

  // --- EXPORT LOGIC (FETCH ALL FILTERED DATA) ---
  /**
   * Helper to fetch all records matching current filters regardless of current page
   */
  private fetchExportData(callback: (data: TableRowImportant[]) => void) {
    const filterString = this.selectedFilterIds.join(',');

    // We request a very large page size (e.g. 99999) to ensure we get all records
    // that match the current search/category filters.
    this.api
      .getAllFilesAndFoldersDetails(
        this.searchText,
        this.selectedCategory,
        filterString,
        0, // Reset to first page for full export
        99999, // Large number to bypass pagination limit
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
  onSearch(value: string) {
    this.searchText = value?.trim() || '';
    this.pageIndex = 0;
    this.getWorkflowData();
  }

  filterCategory(value: string) {
    this.selectedCategory = value || '';
    this.pageIndex = 0;
    this.getWorkflowData();
  }

  filterCriticality(value: string) {
    this.selectedCriticality = value || '';
    this.pageIndex = 0;
    this.getWorkflowData();
  }

  filterType(id: number, checked: boolean) {
    if (checked) {
      if (!this.selectedFilterIds.includes(id)) this.selectedFilterIds.push(id);
    } else {
      this.selectedFilterIds = this.selectedFilterIds.filter((x) => x !== id);
    }
    this.pageIndex = 0;
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
      if (i > 0) this.pages.push(i);
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
    const payloads: any[] = [];
    const itemsToSubmit = Array.from(this.selection);

    if (!this.selectedUsers.length || !itemsToSubmit.length) return;

    for (const user of this.selectedUsers) {
      for (const row of itemsToSubmit) {
        payloads.push({
          employeeName: user?.namepass ?? '',
          employeeEmail: user?.emailpass ?? '',
          folderFileName: row.folderFileName,
          resourceFullPath: row.resourceFullPath,
          category: row.category,
          criticality: row.criticality,
          sourceType: row.itemType,
        });
      }
    }

    this.api.saveaccessrequestdetails(payloads).subscribe({
      next: () =>
        this.router.navigate(['../request-access-detail'], {
          relativeTo: this.route,
        }),
      error: (err) => console.error('Submission failed', err),
    });
  }
}
