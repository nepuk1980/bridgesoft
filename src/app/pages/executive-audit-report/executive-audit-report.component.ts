import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ReportService } from '../../services/report.service';
import { ApiService } from '../../services/api.service';
import { ExecutiveAuditReportsInterface } from '../../models/type';

// ================= UI MODEL =================
interface AuditEvent {
  employeeName: string;
  eventType: string;
  dataSource: string;
  objectName: string;
  resourceFullPath: string;
  resourceOwner: string;
  eventTime: string;
}

interface Filter {
  value: string;
  viewValue: string;
}

type ExecutiveAuditItem = ExecutiveAuditReportsInterface['content'][number];

// ================= COMPONENT =================
@Component({
  selector: 'app-executive-audit-report',
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
    MatPaginatorModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './executive-audit-report.component.html',
  styleUrls: ['./executive-audit-report.component.css'],
})
export class ExecutiveAuditReportComponent implements OnInit, AfterViewInit {
  constructor(
    private reportService: ReportService,
    private api: ApiService,
  ) {}

  // ================= TABLE =================
  displayedColumns: string[] = [
    'employeeName',
    'eventType',
    'dataSource',
    'objectName',
    'resourceFullPath',
    'resourceOwner',
    'eventTime',
  ];

  dataSource = new MatTableDataSource<AuditEvent>([]);
  originalData: AuditEvent[] = [];

  // ================= UI STATE =================
  searchText = '';
  selectedFilter = '';
  selectedDownload: '' | 'pdf' | 'excel' | 'csv' = '';
  filters: Filter[] = [];

  // ================= PAGINATION =================
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  // ================= VIEW =================
  @ViewChild(MatSort) sort!: MatSort;

  // ✅ FIX: Setter-based paginator (handles *ngIf / delayed render)
  paginator!: MatPaginator;
  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator) {
    if (paginator) {
      this.paginator = paginator;

      paginator.page.subscribe((event) => {
        this.loadAuditData(event.pageIndex, event.pageSize);
      });
    }
  }

  // ================= LIFECYCLE =================
  ngOnInit(): void {
    this.loadAuditData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  // ================= MAPPER =================
  private mapToAuditEvent(item: ExecutiveAuditItem): AuditEvent {
    return {
      employeeName: item.userDisplayname,
      eventType: item.eventType,
      dataSource: item.datasourceType,
      objectName: item.objectName,
      resourceFullPath: item.eventPath,
      resourceOwner: item.resourceOwner,
      eventTime: item.eventTime,
    };
  }

  // ================= PAGINATION HELPER =================
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);

    // ✅ FORCE minimum 1 page
    if (this.totalPages === 0) {
      this.totalPages = 1;
    }

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

  // ================= API LOAD =================
  loadAuditData(page: number = 0, size: number = this.pageSize): void {
    this.api
      .getexecutiveauditreport(this.searchText, this.selectedFilter, page, size)
      .subscribe({
        next: (res: ExecutiveAuditReportsInterface) => {
          const mappedData = res.content.map((item) =>
            this.mapToAuditEvent(item),
          );

          this.originalData = mappedData;
          this.dataSource.data = mappedData;

          // ✅ Only set filters once
          if (this.filters.length === 0) {
            const uniqueEventTypes = Array.from(
              new Set(mappedData.map((x) => x.eventType)),
            );

            this.filters = uniqueEventTypes.map((v) => ({
              value: v,
              viewValue: v,
            }));
          }

          // Pagination
          this.totalElements = res.totalElements;
          this.pageSize = size;
          this.pageIndex = page;

          this.updatePagination();
        },
        error: (err) => console.error('API Error:', err),
      });
  }

  // ================= FILTER =================
  applyFilters(filterValue?: string): void {
    this.pageIndex = 0;
    this.loadAuditData(this.pageIndex, this.pageSize);
  }

  // ================= EXPORT =================
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

  private getExportData() {
    return this.originalData.map((item) => ({
      'Employee Name': item.employeeName,
      'Event Type': item.eventType,
      'Data Source': item.dataSource,
      'Object Name': item.objectName,
      'Resource Full Path': item.resourceFullPath,
      'Resource Owner': item.resourceOwner,
      'Event Time': item.eventTime,
    }));
  }

  downloadExcel() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadExcel(
      data,
      `executive-audit-report_${timestamp}`,
      'Executive Audit Report',
    );
  }

  downloadCSV() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadCSV(
      data,
      `executive-audit-report_${timestamp}`,
      'Executive Audit Report',
    );
  }

  downloadPDF() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadPDF(
      data,
      `executive-audit-report_${timestamp}`,
      'Executive Audit Report',
    );
  }

  // ================= PAGINATION ACTIONS =================
  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.loadAuditData(this.pageIndex, this.pageSize);
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.loadAuditData(this.pageIndex, this.pageSize);
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadAuditData(this.pageIndex, this.pageSize);
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.loadAuditData(this.pageIndex, this.pageSize);
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.loadAuditData(this.pageIndex, this.pageSize);
  }
}
