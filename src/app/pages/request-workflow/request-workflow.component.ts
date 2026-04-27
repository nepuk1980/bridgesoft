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
import { MatDialog } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ApiService } from '../../services/api.service';
import { RequestAccessWorkflowInterface } from '../../models/type';
import { ReportService } from '../../services/report.service';
import { forkJoin } from 'rxjs';
interface TableRowImportant {
  folderFileName: string;
  resourceFullPath: string;
  category: string;
  criticality: string;
  itemtype: string;
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

  searchText: string = '';
  selectedCategory: string = '';
  selectedCriticality: string = '';
  selectedFilterIds: number[] = [];
  selectedDownload: string = 'download';

  originalData: TableRowImportant[] = [];
  dataSourceImportant: TableRowImportant[] = [];

  selectedUsers: any[] = [];

  totalCount = 0;
  showingCount = 0;

  categoriesImportant: string[] = [];

  displayedColumnsImportant: string[] = [
    'folderFileName',
    'resourceFullPath',
    'category',
    'criticality',
  ];

  selection = new Set<TableRowImportant>();

  private dialog = inject(MatDialog);

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private api: ApiService,
    private reportService: ReportService,
    private router: Router,
  ) {
    const nav = this.router.getCurrentNavigation();

    this.selectedUsers =
      nav?.extras?.state?.['selectedUsers'] ??
      history.state?.selectedUsers ??
      [];

    console.log('Selected Users:', this.selectedUsers);
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // SEARCH
  onSearch(value: string) {
    this.searchText = value?.trim() || '';
    this.applyFilters();
  }

  // CATEGORY FILTER
  filterCategory(value: string) {
    this.selectedCategory = value || '';
    this.applyFilters();
  }

  // CRITICALITY FILTER
  filterCriticality(value: string) {
    this.selectedCriticality = value || '';
    this.applyFilters();
  }

  // FILE/FOLDER FILTER (API SIDE)
  filterType(id: number, checked: boolean) {
    if (checked) {
      if (!this.selectedFilterIds.includes(id)) {
        this.selectedFilterIds.push(id);
      }
    } else {
      this.selectedFilterIds = this.selectedFilterIds.filter((x) => x !== id);
    }

    this.getWorkflowData();
  }

  // RADIO CHANGE
  onCriticalityChange(row: TableRowImportant) {
    row.criticality = row.criticality;
  }

  // APPLY LOCAL FILTERS
  applyFilters() {
    let filtered = [...this.originalData];

    if (this.searchText) {
      const search = this.searchText.toLowerCase();

      filtered = filtered.filter(
        (x) =>
          x.folderFileName.toLowerCase().includes(search) ||
          x.resourceFullPath.toLowerCase().includes(search),
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter((x) => x.category === this.selectedCategory);
    }

    if (this.selectedCriticality) {
      filtered = filtered.filter(
        (x) => x.criticality === this.selectedCriticality,
      );
    }

    // ✅ ALWAYS update total first
    this.totalElements = filtered.length;
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalElements / this.pageSize),
    );

    // ✅ clamp pageIndex safely
    if (this.pageIndex > this.totalPages - 1) {
      this.pageIndex = this.totalPages - 1;
    }
    if (this.pageIndex < 0) {
      this.pageIndex = 0;
    }

    // ✅ pagination slice
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    this.dataSourceImportant = filtered.slice(start, end);

    // ✅ UI counters (correct binding)
    this.filteredUsers = filtered;
    this.paginatedUsers = this.dataSourceImportant;

    this.showingCount = this.dataSourceImportant.length;
    this.totalCount = this.originalData.length;

    this.generatePages();
  }

  // ROW SELECTION
  toggleRow(row: TableRowImportant) {
    if (this.selection.has(row)) {
      this.selection.delete(row);
    } else {
      this.selection.add(row);
    }
    console.log('✅ selection now:', Array.from(this.selection));
  }

  toggleAllRows() {
    if (this.selection.size === this.dataSourceImportant.length) {
      this.selection.clear();
    } else {
      this.dataSourceImportant.forEach((row) => this.selection.add(row));
    }
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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.vaultId = Number(params['vaultId']) || 0;
      this.getWorkflowData();
    });
  }

  // API CALL
  getWorkflowData() {
    const filterString = this.selectedFilterIds.join(',');

    this.api
      .getAllFilesAndFoldersDetails(
        this.vaultId,
        this.searchText,
        this.selectedCategory,
        filterString,
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data || res;

          this.originalData = data.map(
            (item: RequestAccessWorkflowInterface) => ({
              folderFileName: item.itemName,
              resourceFullPath: item.itemUrl,
              category: item.category,
              criticality: 'Open',
              sourceType: item.itemType,
            }),
          );

          this.categoriesImportant = [
            ...new Set(this.originalData.map((x) => x.category)),
          ];

          this.pageIndex = 0;
          this.applyFilters();

          this.selection.clear();
        },
        error: (err) => {
          console.error('Workflow API error:', err);
        },
      });
  }

  // DATE FORMAT
  private getFormattedDateTime(): string {
    const now = new Date();

    const date = now.toLocaleDateString('en-GB').replace(/\//g, '-');

    const time = now
      .toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/:/g, '-');

    return `${date}_${time}`;
  }

  // EXPORT DATA
  private getExportData() {
    return this.dataSourceImportant.map((item) => ({
      'Folder / File Name': item.folderFileName,
      ResourceFullPath: item.resourceFullPath,
      Category: item.category,
      Criticality: item.criticality,
    }));
  }

  // DOWNLOAD EXCEL
  downloadExcel() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadExcel(
      data,
      `request-workflow-report_${timestamp}`,
      'Request Workflow',
    );
  }

  // DOWNLOAD CSV
  downloadCSV() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadCSV(
      data,
      `request-workflow-report_${timestamp}`,
      'Request Workflow',
    );
  }

  // DOWNLOAD PDF
  downloadPDF() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadPDF(
      data,
      `request-workflow-report_${timestamp}`,
      'Request Workflow',
    );
  }

  // ✅ Pagination
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  paginatedUsers: any[] = [];
  filteredUsers: any[] = [];

  // ✅ PAGINATION UI CALCULATION
  generatePages() {
    const visible = 3;

    if (this.totalPages <= 0) {
      this.pages = [];
      return;
    }

    let start = Math.max(1, this.pageIndex + 1 - 1);
    let end = Math.min(this.totalPages, start + visible - 1);

    if (end - start < visible - 1) {
      start = Math.max(1, end - visible + 1);
    }

    this.pages = [];
    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  // ✅ PAGINATION ACTIONS
  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.applyFilters();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.applyFilters();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.applyFilters();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.applyFilters();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.applyFilters();
  }
  buildAccessRequestPayload() {
    const payloads: any[] = [];

    const users = this.selectedUsers;
    const rows =
      this.filteredUsers?.length > 0 ? this.filteredUsers : this.originalData;

    console.log('👤 users:', users);
    console.log('📁 rows:', rows);

    if (!users?.length || !rows.length) {
      console.warn('⚠️ selectedUsers or data is empty');
      return payloads;
    }

    for (const user of users) {
      for (const row of rows) {
        payloads.push({
          employeeName: user?.namepass ?? '',
          employeeEmail: user?.emailpass ?? '',
          folderFileName: row?.folderFileName,
          resourceFullPath: row?.resourceFullPath,
          category: row?.category,
          criticality: row?.criticality ?? 'Open',
          sourceType: row?.itemType ?? 'File',
        });
      }
    }

    console.log('✅ build payloads', payloads);

    return payloads;
  }
  submitAccessRequest() {
    const payloads = this.buildAccessRequestPayload();
    console.log('submit payloads', payloads);

    if (!payloads.length) {
      console.error('❌ No payload generated.');
      return;
    }

    this.api.saveaccessrequestdetails(payloads).subscribe({
      next: (res) => {
        console.log('✅ Bulk request successful:', res);

        // 👉 redirect after success
        this.router.navigate(['../request-access-detail'], {
          relativeTo: this.route,
        });
      },
      error: (err) => {
        console.error('❌ Bulk request failed:', err);
      },
    });
  }
}
