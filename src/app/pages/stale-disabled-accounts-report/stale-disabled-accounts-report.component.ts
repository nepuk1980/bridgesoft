import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ReportService } from '../../services/report.service';
import { ApiService } from '../../services/api.service';
import { SessionManagerService } from '../../services/session-manager.service';
import { DisabledIdentityVaultResponse } from '../../models/type';

export type VaultApiItem = DisabledIdentityVaultResponse['content'][number];

// Frontend Table Interface (Only 5 Display Columns)
export interface DisabledVaultRow {
  accountName: string;
  inheritancePath: string;
  displayName: string;
  job_title: string;
  accountStatus: string;
}

const sanitize = (val: any): string => {
  if (val === null || val === undefined) return '-';
  const str = String(val).trim();
  return str.length > 0 ? str : '-';
};

@Component({
  selector: 'app-stale-disabled-accounts-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InnerheaderComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './stale-disabled-accounts-report.component.html',
  styleUrl: './stale-disabled-accounts-report.component.css',
})
export class StaleDisabledAccountsReportComponent implements OnInit, AfterViewInit {
  constructor(
    private reportService: ReportService,
    private api: ApiService,
    private route: ActivatedRoute,
    private sessionManager: SessionManagerService,
  ) { }

  // ================= UI TABLE (5 COLUMNS ONLY) =================
  displayedColumns: string[] = [
    'accountName',
    'inheritancePath',
    'displayName',
    'job_title',
    'accountStatus',
  ];

  dataSource = new MatTableDataSource<DisabledVaultRow>([]);

  // ================= UI STATE =================
  searchText = '';
  selectedFilter = '';
  filters: { value: string; viewValue: string }[] = [];
  selectedDownload = 'download';
  isLoading = false;
  isDownloading = false;

  // ================= PAGINATION =================
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;
  totalPages = 0;
  pages: number[] = [];

  // ================= VIEW =================
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchText = params['searchEmployeeName'] || '';
      this.pageIndex = 0;
      this.loadVaultData(this.pageIndex, this.pageSize);
      this.loadFilters();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  get displayTotalElements(): number {
    return this.totalElements;
  }

  private mapToTableRow(item: VaultApiItem): DisabledVaultRow {
    const fullName = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
    return {
      accountName: sanitize(item.accountName),
      inheritancePath: sanitize(item.inheritancePath),
      displayName: sanitize(item.displayName?.trim() || fullName),
      job_title: sanitize(item.job_title),
      accountStatus: sanitize(item.accountStatus),
    };
  }

  // ================= API LOAD =================
  loadVaultData(page: number = 0, size: number = this.pageSize): void {
    this.isLoading = true;
    this.api
      .getlistofdisabledidentityvaults(
        this.searchText,
        this.selectedFilter,
        page,
        size,
      )
      .subscribe({
        next: (res: DisabledIdentityVaultResponse) => {
          this.isLoading = false;
          this.dataSource.data = (res.content || []).map((item) =>
            this.mapToTableRow(item),
          );
          this.totalElements = res.totalElements || 0;
          this.pageSize = size;
          this.pageIndex = page;

          this.updatePagination();
        },
        error: (err) => {
          this.isLoading = false;
          console.error('API Error:', err);
        },
      });
  }

  private loadFilters(): void {
    this.api
      .getlistofdisabledidentityvaults(this.searchText, '', 0, 100)
      .subscribe({
        next: (res: DisabledIdentityVaultResponse) => {
          const uniqueStatuses = Array.from(
            new Set((res.content || []).map((x) => x.accountStatus).filter(Boolean)),
          );

          this.filters = uniqueStatuses.map((v) => ({
            value: v,
            viewValue: v,
          }));
        },
        error: (err) => console.error('Filter API Error:', err),
      });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadVaultData(0, this.pageSize);
  }

  // ================= PAGINATION =================
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.totalElements / this.pageSize) || 1;

    const visible = 3;
    let start = Math.max(1, this.pageIndex + 1);
    let end = Math.min(this.totalPages, start + visible - 1);

    if (end - start < visible - 1) {
      start = Math.max(1, end - visible + 1);
    }

    this.pages = [];
    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.validateSessionOnAction();
    this.loadVaultData(this.pageIndex, this.pageSize);
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.validateSessionOnAction();
      this.loadVaultData(this.pageIndex, this.pageSize);
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.validateSessionOnAction();
      this.loadVaultData(this.pageIndex, this.pageSize);
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.validateSessionOnAction();
    this.loadVaultData(0, this.pageSize);
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.validateSessionOnAction();
    this.loadVaultData(this.pageIndex, this.pageSize);
  }

  /** Hit validateTokens on pagination change; logs out on an invalid session. */
  private validateSessionOnAction(): void {
    this.sessionManager.validateAndContinue().subscribe();
  }

  // ================= EXPORT (INCLUDES ALL 24 PAYLOAD FIELDS) =================
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

  private fetchAllDataAndExport(type: 'excel' | 'csv' | 'pdf'): void {
    this.isLoading = true;
    this.isDownloading = true;

    this.api
      .getlistofdisabledidentityvaults(
        this.searchText,
        this.selectedFilter,
        0,
        this.totalElements || 10000,
      )
      .subscribe({
        next: (res: DisabledIdentityVaultResponse) => {
          this.isLoading = false;
          this.isDownloading = false;
          const items = res?.content ?? [];

          const exportData = items.map((item, index) => {
            const fallbackFullName = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();

            return {
              'Sr No': index + 1,
              'ID': sanitize(item.id),
              'Account Name': sanitize(item.accountName),
              'Inheritance Path': sanitize(item.inheritancePath),
              'Name': sanitize(item.displayName?.trim() || fallbackFullName),
              'Title': sanitize(item.job_title),
              'Disabled Account': sanitize(item.accountStatus),
              'First Name': sanitize(item.firstName),
              'Last Name': sanitize(item.lastName),
              'Email': sanitize(item.email),
              'Account Type': sanitize(item.accountType),
              'Active': item.active ?? false,
              'Employee Code': sanitize(item.employee_code),
              'Department': sanitize(item.department),
              'Company': sanitize(item.company),
              'Location': sanitize(item.location),
              'Manager': sanitize(item.manager),
              'Manager Employee ID': sanitize(item.manager_employee_id),
              'Manager Department': sanitize(item.manager_department),
              'Directory Path': sanitize(item.directoryPath),
              'Risk Score': sanitize(item.riskScore),
              'Assigned Role Summary': sanitize(item.assignedRoleSummary),
              'Groups List': sanitize(item.groupsList),
              'Created Date': sanitize(item.createDatetime),
              'Last Modified Date': sanitize(item.lastModifiedDatetime),
            };
          });

          const timestamp = this.getFormattedDateTime();
          const filename = `disabled-identity-vault-report_${timestamp}`;
          const title = 'Disabled Identity Vault Report';
          const desc = 'Comprehensive list of disabled vault accounts and associated employee properties.';
          const filter = `EventTime = ${timestamp} [ And ] Status Filter=${this.selectedFilter || 'All'} [AND] Search=${this.searchText || 'None'}`;

          switch (type) {
            case 'excel':
              this.reportService.downloadExcel(exportData, filename, title, desc, filter);
              break;
            case 'csv':
              this.reportService.downloadCSV(exportData, filename, title, desc, filter);
              break;
            case 'pdf':
              this.reportService.downloadPDF(exportData, filename, title, { mode: 'wide' }, desc, filter);
              break;
          }
        },
        error: (err) => {
          console.error('Export API Error:', err);
          this.isLoading = false;
          this.isDownloading = false;
        },
      });
  }

  downloadExcel() {
    this.fetchAllDataAndExport('excel');
  }

  downloadCSV() {
    this.fetchAllDataAndExport('csv');
  }

  downloadPDF() {
    this.fetchAllDataAndExport('pdf');
  }
}