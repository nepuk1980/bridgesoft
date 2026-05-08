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
import { AuditResponseInterface } from '../../models/type';

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

type ExecutiveAuditItem = AuditResponseInterface['content'][number];

@Component({
  selector: 'app-audit-trail',
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
  templateUrl: './audit-trail.component.html',
  styleUrl: './audit-trail.component.css',
})
export class AuditTrailComponent implements OnInit, AfterViewInit {
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

  isLoading = false;

  // ================= PAGINATION =================
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;

  totalPages = 0;
  pages: number[] = [];

  // ================= PAGE CACHE =================
  private pageCache = new Map<number, AuditEvent[]>();
  private preloadingPages = new Set<number>();

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

  // ================= CACHE KEY =================
  private getCacheKey(page: number): string {
    return `${page}_${this.pageSize}_${this.searchText}_${this.selectedFilter}`;
  }

  // ================= API LOAD =================
  loadAuditData(page: number = 0, size: number = this.pageSize): void {
    const cacheKey = this.getCacheKey(page);

    // ✅ Serve instantly from cache
    const cached = this.pageCache.get(cacheKey as any);

    if (cached) {
      this.dataSource.data = cached;

      this.pageIndex = page;
      this.pageSize = size;

      this.updatePagination();

      // silent preload
      this.preloadNextPages(page, size);

      return;
    }

    this.isLoading = true;

    this.api
      .getaudittrail(this.searchText, this.selectedFilter, page, size)
      .subscribe({
        next: (res: AuditResponseInterface) => {
          const mappedData = res.content.map((item) =>
            this.mapToAuditEvent(item),
          );

          // cache page
          this.pageCache.set(cacheKey as any, mappedData);

          this.dataSource.data = mappedData;

          this.totalElements = res.totalElements;
          this.pageSize = size;
          this.pageIndex = page;

          this.updatePagination();

          this.isLoading = false;

          // silent preload next pages
          this.preloadNextPages(page, size);
        },
        error: (err) => {
          console.error('API Error:', err);
          this.isLoading = false;
        },
      });
  }

  // ================= SILENT PRELOAD =================
  private preloadNextPages(currentPage: number, size: number): void {
    const nextPages = [currentPage + 1, currentPage + 2];

    nextPages.forEach((page) => {
      if (page >= this.totalPages) return;

      const cacheKey = this.getCacheKey(page);

      // already cached
      if (this.pageCache.has(cacheKey as any)) return;

      // already loading
      if (this.preloadingPages.has(page)) return;

      this.preloadingPages.add(page);

      this.api
        .getaudittrail(this.searchText, this.selectedFilter, page, size)
        .subscribe({
          next: (res: AuditResponseInterface) => {
            const mappedData = res.content.map((item) =>
              this.mapToAuditEvent(item),
            );

            // store silently
            this.pageCache.set(cacheKey as any, mappedData);

            this.preloadingPages.delete(page);
          },
          error: () => {
            this.preloadingPages.delete(page);
          },
        });
    });
  }

  // ================= FILTER =================
  private loadFilters(): void {
    this.api.getaudittrail('', '', 0, 1000).subscribe({
      next: (res: AuditResponseInterface) => {
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

  // ================= SEARCH =================
  onSearch(): void {
    this.clearCache();

    this.pageIndex = 0;

    this.loadAuditData(0, this.pageSize);
  }

  // ================= APPLY FILTER =================
  applyFilters(): void {
    this.clearCache();

    this.pageIndex = 0;

    this.loadAuditData(0, this.pageSize);
  }

  // ================= CLEAR CACHE =================
  private clearCache(): void {
    this.pageCache.clear();
    this.preloadingPages.clear();
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

  goToPage(p: number): void {
    this.pageIndex = p - 1;

    this.loadAuditData(this.pageIndex, this.pageSize);
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;

      this.loadAuditData(this.pageIndex, this.pageSize);
    }
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;

      this.loadAuditData(this.pageIndex, this.pageSize);
    }
  }

  firstPage(): void {
    this.pageIndex = 0;

    this.loadAuditData(0, this.pageSize);
  }

  lastPage(): void {
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

  private fetchAllDataAndExport(type: 'excel' | 'csv' | 'pdf'): void {
    this.isLoading = true;

    this.api
      .getaudittrail(
        this.searchText,
        this.selectedFilter,
        0,
        this.totalElements || 10000,
      )
      .subscribe({
        next: (res: AuditResponseInterface) => {
          this.isLoading = false;

          const items = res?.content ?? [];

          const exportData = items.map((item) => ({
            Id: item.id ?? '-',
            'Employee Name': item.userDisplayname ?? '-',
            'Event Type': item.eventType ?? '-',
            'Data Source': item.datasourceType ?? '-',
            'Object Name': item.objectName ?? '-',
            'Resource Full Path': item.eventPath ?? '-',
            'Resource Owner': item.resourceOwner ?? '-',
            'Event Time': item.eventTime ?? '-',
            // 'Source System': item.sourceSystem ?? '-',
            // 'Event Id': item.eventId ?? '-',
            // 'User Email': item.userEmail ?? '-',
            // 'User Display Name': item.userDisplayname ?? '-',
            // 'Event Type': item.eventType ?? '-',
            // 'Device Name': item.deviceName ?? '-',
            // 'Event Time': item.eventTime ?? '-',
            // 'Datasource Type': item.datasourceType ?? '-',
            // 'Event Operation': item.eventOperation ?? '-',
            // 'Event Description': item.eventDescription ?? '-',
            // 'Event Path': item.eventPath ?? '-',
            // 'Account Name': item.accountName ?? '-',
            // 'Object Name': item.objectName ?? '-',
            // 'Object Type': item.objectType ?? '-',
            // 'Event Sensitive': item.eventSensitive ?? false,
            // 'Event Status': item.eventStatus ?? '-',
            // 'External Ip': item.externalIp ?? '-',
            // Datasource: item.datasource ?? '-',
            // Country: item.country ?? '-',
            // Department: item.department ?? '-',
            // 'User Agent': item.useragent ?? '-',
            // 'Exposure Level': item.exposureLevel ?? '-',

            // 'Permissions Before Change': item.permissionsBeforeChange ?? '-',

            // 'Permissions After Change': item.permissionsAfterChange ?? '-',

            // 'Changed Permission Flag': item.changedPermissionFlag ?? false,

            // 'Resource Owner': item.resourceOwner ?? '-',

            // 'Target User Email': item.targetUserEmail ?? '-',

            // 'Target User Display Name': item.targetUserDisplayName ?? '-',

            // 'Target OneDrive Path Key': item.targetOneDrivePathKey ?? '-',

            // 'Connection Type': item.connectionType ?? '-',

            // 'Client Ip': item.clientIp ?? '-',

            // Client: item.client ?? '-',

            // 'Device Trust Type': item.deviceTrustType ?? '-',

            // 'Source Nat Address': item.sourceNatAddress ?? '-',

            // 'Source Port': item.sourcePort ?? '-',

            // 'Source Zone': item.sourceZone ?? '-',

            // 'Destination Device Name': item.destinationDevicename ?? '-',

            // 'Device Managed Status': item.deviceManagedStatus ?? false,

            // 'Source Nat Port': item.sourceNatPort ?? '-',

            // 'Logon Type': item.logonType ?? '-',

            // 'Account Type': item.accountType ?? '-',

            // 'Sam Account Name': item.samAccountname ?? '-',

            // 'Operating System': item.operatingSystem ?? '-',

            // 'Malicious External Ip': item.maliciousExternalIp ?? false,

            // 'Externalip Reputation': item.externalipReputation ?? '-',

            // 'Inheritance Paths': item.inheritancePaths ?? '-',
          }));

          const timestamp = this.getFormattedDateTime();

          const filename = `audit-trail-report_${timestamp}`;

          const title = 'Audit Trail Report';

          const desc =
            'Daily scheduled search of VIP OD personal spaces for unauthorized access.';

          const filter = `EventTime = ${timestamp} [ And ] DataSource=${items[0]?.datasourceType ?? '-'} [AND] Account Name!=${items[0]?.accountName ?? '-'}`;

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
                  mode: 'default',
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

  downloadExcel(): void {
    this.fetchAllDataAndExport('excel');
  }

  downloadCSV(): void {
    this.fetchAllDataAndExport('csv');
  }

  downloadPDF(): void {
    this.fetchAllDataAndExport('pdf');
  }
}
