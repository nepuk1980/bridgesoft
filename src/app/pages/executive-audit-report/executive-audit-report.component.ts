import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';

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

  // ================= UI STATE =================
  searchText = '';
  selectedFilter = '';
  filters: Filter[] = [];
  selectedDownload = 'download';

  // ================= PAGINATION =================
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;

  totalPages = 0;
  pages: number[] = [];

  // ================= VIEW =================
  @ViewChild(MatSort) sort!: MatSort;

  // ================= LIFECYCLE =================
  ngOnInit(): void {
    this.loadAuditData();
    this.loadFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  get displayTotalElements(): number {
    return this.totalElements === 0 ? 1 : this.totalElements;
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

  // ================= API LOAD =================
  loadAuditData(page: number = 0, size: number = this.pageSize): void {
    this.api
      .getexecutiveauditreport(this.searchText, this.selectedFilter, page, size)
      .subscribe({
        next: (res: ExecutiveAuditReportsInterface) => {
          const mappedData = res.content.map((item) =>
            this.mapToAuditEvent(item),
          );

          this.dataSource.data = mappedData;

          this.totalElements = res.totalElements;
          this.pageSize = size;
          this.pageIndex = page;

          this.updatePagination();
        },
        error: (err) => console.error('API Error:', err),
      });
  }

  // ================= FILTER =================
  private loadFilters(): void {
    this.api.getexecutiveauditreport('', '', 0, 1000).subscribe({
      next: (res: ExecutiveAuditReportsInterface) => {
        const uniqueEventTypes = Array.from(
          new Set(res.content.map((x) => x.datasourceType)),
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
    this.loadAuditData(0, this.pageSize);
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
    this.loadAuditData(0, this.pageSize);
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
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
  isLoading = false;
  private fetchAllDataAndExport(type: 'excel' | 'csv' | 'pdf'): void {
    this.isLoading = true;

    this.api
      .getexecutiveauditreport(
        this.searchText,
        this.selectedFilter,
        0,
        this.totalElements || 10000,
      )
      .subscribe({
        next: (res: ExecutiveAuditReportsInterface) => {
          this.isLoading = false;

          const items = res?.content ?? [];

          // ✅ No trimming — export FULL dataset
          const exportData = items.map((item) => ({
            Id: item.id ?? '-',
            'Source System': item.sourceSystem ?? '-',
            'Event Id': item.eventId ?? '-',
            'User Email': item.userEmail ?? '-',
            'User Display Name': item.userDisplayname ?? '-',
            'Event Type': item.eventType ?? '-',
            'Device Name': item.deviceName ?? '-',
            'Event Time': item.eventTime ?? '-',
            'Datasource Type': item.datasourceType ?? '-',
            'Event Operation': item.eventOperation ?? '-',
            'Event Description': item.eventDescription ?? '-',
            'Event Path': item.eventPath ?? '-',
            'Account Name': item.accountName ?? '-',
            'Object Name': item.objectName ?? '-',
            'Object Type': item.objectType ?? '-',
            'Event Sensitive': item.eventSensitive ?? false,
            'Event Status': item.eventStatus ?? '-',
            'External Ip': item.externalIp ?? '-',
            Datasource: item.datasource ?? '-',
            Country: item.country ?? '-',
            Department: item.department ?? '-',
            'User Agent': item.useragent ?? '-',
            'Exposure Level': item.exposureLevel ?? '-',
            'Permissions Before Change': item.permissionsBeforeChange ?? '-',
            'Permissions After Change': item.permissionsAfterChange ?? '-',
            'Changed Permission Flag': item.changedPermissionFlag ?? false,
            'Resource Owner': item.resourceOwner ?? '-',
            'Connection Type': item.connectionType ?? '-',
            'Client Ip': item.clientIp ?? '-',
            Client: item.client ?? '-',
            'Device Trust Type': item.deviceTrustType ?? '-',
            'Source Nat Address': item.sourceNatAddress ?? '-',
            'Source Port': item.sourcePort ?? '-',
            'Source Zone': item.sourceZone ?? '-',
            'Destination Device Name': item.destinationDevicename ?? '-',
            'Device Managed Status': item.deviceManagedStatus ?? false,
            'Source Nat Port': item.sourceNatPort ?? '-',
            'Logon Type': item.logonType ?? '-',
            'Account Type': item.accountType ?? '-',
            'Sam Account Name': item.samAccountname ?? '-',
            'Operating System': item.operatingSystem ?? '-',
            'Malicious External Ip': item.maliciousExternalIp ?? false,
            'Externalip Reputation': item.externalipReputation ?? '-',
            'Inheritance Paths': item.inheritancePaths ?? '-',
          }));

          const timestamp = this.getFormattedDateTime();
          const filename = `executive-audit-report_${timestamp}`;
          const title = 'Executive Audit Report';
          const desc =
            'Daily scheduled search of VIP OD personal spaces for unauthorized access.';
          const filter = `EventTime = ${timestamp} [ And ] DataSource=${items[0].datasourceType} [AND] Account Name!=${items[0].accountName}`;

          switch (type) {
            case 'excel':
              this.reportService.downloadExcel(
                exportData,
                filename,
                title,
                desc,
                filter,
              );
              break;
            case 'csv':
              this.reportService.downloadCSV(
                exportData,
                filename,
                title,
                desc,
                filter,
              );
              break;
            case 'pdf':
              this.reportService.downloadPDF(
                exportData,
                filename,
                title,
                {
                  mode: 'wide',
                },
                desc,
                filter,
              );
              break;
          }
        },
        error: (err) => {
          console.error('Export API Error:', err);
          this.isLoading = false;
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
