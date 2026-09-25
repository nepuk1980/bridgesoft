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
import { PrivilegedAccessReportResponse } from '../../models/type';

export type PrivilegedAccessItem = PrivilegedAccessReportResponse['content'][number];

// UI Table Model (7 Display Columns)
export interface PrivilegedAccessRow {
  sourceType: string;
  accountName: string;
  eventType: string;
  eventDescription: string;
  eventOperation: string;
  path: string;
  eventTime: string;
}

interface Filter {
  value: string;
  viewValue: string;
}

const sanitize = (val: any): string => {
  if (val === null || val === undefined) return '-';
  const str = String(val).trim();
  return str.length > 0 ? str : '-';
};

@Component({
  selector: 'app-privileged-access-report',
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
  templateUrl: './privileged-access-report.component.html',
  styleUrl: './privileged-access-report.component.css',
})
export class PrivilegedAccessReportComponent implements OnInit, AfterViewInit {
  constructor(
    private reportService: ReportService,
    private api: ApiService,
    private route: ActivatedRoute,
    private sessionManager: SessionManagerService,
  ) { }

  // ================= UI TABLE COLUMNS =================
  displayedColumns: string[] = [
    'sourceType',
    'accountName',
    'eventType',
    'eventDescription',
    'eventOperation',
    'path',
    'eventTime',
  ];

  dataSource = new MatTableDataSource<PrivilegedAccessRow>([]);

  // ================= UI STATE =================
  searchText = '';
  selectedFilter = '';
  filters: Filter[] = [];
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
      this.loadReportData(this.pageIndex, this.pageSize);
      this.loadFilters();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  get displayTotalElements(): number {
    return this.totalElements;
  }

  private mapToTableRow(item: PrivilegedAccessItem): PrivilegedAccessRow {
    return {
      sourceType: sanitize(item.sourceType),
      accountName: sanitize(item.accountName),
      eventType: sanitize(item.eventType),
      eventDescription: sanitize(item.eventDescription),
      eventOperation: sanitize(item.eventOperation),
      path: sanitize(item.path),
      eventTime: sanitize(item.eventTime),
    };
  }

  // ================= API LOAD =================
  loadReportData(page: number = 0, size: number = this.pageSize): void {
    this.isLoading = true;
    this.api
      .getprivilegedaccessreport(
        this.searchText,
        this.selectedFilter,
        page,
        size,
      )
      .subscribe({
        next: (res: PrivilegedAccessReportResponse) => {
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
      .getprivilegedaccessreport(this.searchText, '', 0, 100)
      .subscribe({
        next: (res: PrivilegedAccessReportResponse) => {
          const uniqueEventTypes = Array.from(
            new Set((res.content || []).map((x) => x.eventType).filter(Boolean)),
          );

          this.filters = uniqueEventTypes.map((v) => ({
            value: v,
            viewValue: v,
          }));
        },
        error: (err) => console.error('Filter API Error:', err),
      });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadReportData(0, this.pageSize);
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
    this.loadReportData(this.pageIndex, this.pageSize);
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.validateSessionOnAction();
      this.loadReportData(this.pageIndex, this.pageSize);
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.validateSessionOnAction();
      this.loadReportData(this.pageIndex, this.pageSize);
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.validateSessionOnAction();
    this.loadReportData(0, this.pageSize);
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.validateSessionOnAction();
    this.loadReportData(this.pageIndex, this.pageSize);
  }

  /** Hit validateTokens on pagination change; logs out on an invalid session. */
  private validateSessionOnAction(): void {
    this.sessionManager.validateAndContinue().subscribe();
  }

  // ================= EXPORT (ALL PAYLOAD FIELDS) =================
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
      .getprivilegedaccessreport(
        this.searchText,
        this.selectedFilter,
        0,
        this.totalElements || 10000,
      )
      .subscribe({
        next: (res: PrivilegedAccessReportResponse) => {
          this.isLoading = false;
          this.isDownloading = false;
          const items = res?.content ?? [];

          const exportData = items.map((item, index) => ({
            'Sr No': index + 1,
            'ID': sanitize(item.id),
            'Source Type': sanitize(item.sourceType),
            'Account Name': sanitize(item.accountName),
            'Event Type': sanitize(item.eventType),
            'Event Description': sanitize(item.eventDescription),
            'Event Operation': sanitize(item.eventOperation),
            'Path': sanitize(item.path),
            'Event Time': sanitize(item.eventTime),
            'Object Name': sanitize(item.objectName),
            'Sensitive': item.sensitive ?? false,
            'Event Status': sanitize(item.eventStatus),
            'Data Source': sanitize(item.dataSource),
            'Exposure Level': sanitize(item.exposureLevel),
            'Permissions Before Change': sanitize(item.permissionsBeforeChange),
            'Permissions After Change': sanitize(item.permissionsAfterChange),
            'Changed Permission Flag': item.changedPermissionFlag ?? false,
          }));

          const timestamp = this.getFormattedDateTime();
          const filename = `privileged-access-report_${timestamp}`;
          const title = 'Privileged Access Report';
          const desc = 'Audit report tracking privileged access events, permission modifications, and operation histories.';
          const filter = `EventTime = ${timestamp} [ And ] Filter=${this.selectedFilter || 'All'} [AND] Search=${this.searchText || 'None'}`;

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