import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ApiService } from '../../services/api.service';
import { ReportService } from '../../services/report.service';
import { forkJoin } from 'rxjs';

interface Alert {
  altername: string;
  description: string;
  folders: number;
  files: number;
  users: number;
}

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [
    InnerheaderComponent,
    RouterModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule,
    FormsModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'altername',
    'description',
    'folders',
    'files',
    'users',
    'action',
  ];

  dataSource = new MatTableDataSource<Alert>([]);
  originalData: Alert[] = [];

  searchText = '';
  selectedFilter = '';

  selectedDownload = 'download';

  isLoading = false;
  isDownloading = false;

  // ================= PAGINATION =================
  pageIndex = 0;
  pageSize = 10;

  totalElements = 0;
  totalPages = 0;

  pages: number[] = [];

  // ================= CACHE =================
  pageCache: Map<number, Alert[]> = new Map();

  maxCachePages = 5;

  Math = Math;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private api: ApiService,
    private reportService: ReportService,
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.getAlerts();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  // ================= ALERTS =================
  getAlerts(): void {
    // Use cache first
    if (this.pageCache.has(this.pageIndex)) {
      this.dataSource.data = this.pageCache.get(this.pageIndex) ?? [];

      this.generatePages();

      this.prefetchNearbyPages();

      return;
    }

    this.isLoading = true;

    this.api.getalerts(this.pageIndex, this.pageSize).subscribe({
      next: (res: any) => {
        const mappedData: Alert[] = (res.content ?? []).map(
          (item: any): Alert => ({
            altername: item.alertName,
            description: item.alertDesc,
            folders: item.alertFolders ?? 0,
            files: item.alertFiles ?? 0,
            users: item.alertUsers ?? 0,
          }),
        );

        // Cache page
        this.pageCache.set(this.pageIndex, mappedData);

        this.cleanupCache();

        // Update table
        this.dataSource.data = mappedData;
        this.originalData = mappedData;

        // Pagination info
        this.totalElements = res.totalElements ?? 0;

        this.totalPages =
          res.totalPages ?? Math.ceil(this.totalElements / this.pageSize);

        this.generatePages();

        // Prefetch next pages
        this.prefetchNearbyPages();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('API Error:', err);

        this.isLoading = false;
      },
    });
  }

  // ================= PREFETCH =================
  prefetchNearbyPages(): void {
    const pagesToPrefetch = [this.pageIndex + 1, this.pageIndex + 2];

    pagesToPrefetch.forEach((page) => {
      if (page >= this.totalPages) return;

      if (this.pageCache.has(page)) return;

      this.api.getalerts(page, this.pageSize).subscribe({
        next: (res: any) => {
          const mappedData: Alert[] = (res.content ?? []).map(
            (item: any): Alert => ({
              altername: item.alertName,
              description: item.alertDesc,
              folders: item.alertFolders ?? 0,
              files: item.alertFiles ?? 0,
              users: item.alertUsers ?? 0,
            }),
          );

          this.pageCache.set(page, mappedData);

          this.cleanupCache();
        },
        error: () => {},
      });
    });
  }

  // ================= CACHE CLEANUP =================
  cleanupCache(): void {
    if (this.pageCache.size <= this.maxCachePages) {
      return;
    }

    const validPages = [
      this.pageIndex - 2,
      this.pageIndex - 1,
      this.pageIndex,
      this.pageIndex + 1,
      this.pageIndex + 2,
    ];

    Array.from(this.pageCache.keys()).forEach((key) => {
      if (!validPages.includes(key)) {
        this.pageCache.delete(key);
      }
    });
  }

  // ================= PAGINATION =================
  generatePages(): void {
    if (!this.totalPages) {
      this.pages = [];
      return;
    }

    const visiblePages = 3;

    let start = Math.max(1, this.pageIndex + 1 - Math.floor(visiblePages / 2));

    let end = start + visiblePages - 1;

    if (end > this.totalPages) {
      end = this.totalPages;

      start = Math.max(1, end - visiblePages + 1);
    }

    this.pages = [];

    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  goToPage(page: number): void {
    if (page === this.pageIndex + 1) return;

    this.pageIndex = page - 1;

    this.getAlerts();
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;

      this.getAlerts();
    }
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;

      this.getAlerts();
    }
  }

  firstPage(): void {
    if (this.pageIndex === 0) return;

    this.pageIndex = 0;

    this.getAlerts();
  }

  lastPage(): void {
    if (this.totalPages <= 0) return;

    this.pageIndex = this.totalPages - 1;

    this.getAlerts();
  }

  // ================= REFRESH =================
  refreshAlerts(): void {
    this.pageCache.clear();

    this.pageIndex = 0;

    this.getAlerts();
  }

  // ================= DOWNLOAD =================
  onDownloadChange(): void {
    switch (this.selectedDownload) {
      case 'excel':
        this.downloadExcel();
        break;

      case 'csv':
        this.downloadCSV();
        break;

      case 'pdf':
        this.downloadPDF();
        break;
    }

    this.selectedDownload = 'download';
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

  private fetchAllDataAndExport(type: 'excel' | 'csv' | 'pdf'): void {
    this.isLoading = true;
    this.isDownloading = true;

    const chunkSize = 1000;

    const firstRequest = this.api.getalerts(0, chunkSize);

    firstRequest.subscribe({
      next: (firstRes: any) => {
        const totalElements = firstRes?.totalElements ?? 0;

        const totalPages =
          firstRes?.totalPages ?? Math.ceil(totalElements / chunkSize);

        // If everything came in first request
        if (totalPages <= 1) {
          this.exportData(firstRes?.content ?? [], type);

          this.isLoading = false;
          this.isDownloading = false;

          return;
        }

        const requests = [];

        // First page already loaded
        requests.push(firstRequest);

        for (let page = 1; page < totalPages; page++) {
          requests.push(this.api.getalerts(page, chunkSize));
        }

        forkJoin(requests).subscribe({
          next: (responses: any[]) => {
            const allItems = responses.flatMap(
              (response: any) => response?.content ?? [],
            );

            this.exportData(allItems, type);

            this.isLoading = false;
            this.isDownloading = false;
          },
          error: (err) => {
            console.error('Export Error:', err);

            this.isLoading = false;
            this.isDownloading = false;
          },
        });
      },
      error: (err) => {
        console.error('Export Error:', err);

        this.isLoading = false;
        this.isDownloading = false;
      },
    });
  }

  // ================= HELPERS =================
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

  private exportData(allItems: any[], type: 'excel' | 'csv' | 'pdf'): void {
    const exportData = allItems.map((item: any, index: number) => ({
      'Sr No': index + 1,
      'Alert Name': item.alertName ?? '-',
      Description: item.alertDesc ?? '-',
      Folders: item.alertFolders ?? 0,
      Files: item.alertFiles ?? 0,
      Users: item.alertUsers ?? 0,
    }));

    const timestamp = this.getFormattedDateTime();

    switch (type) {
      case 'excel':
        this.reportService.downloadExcel(
          exportData,
          `alerts_${timestamp}`,
          'Alerts',
        );
        break;

      case 'csv':
        this.reportService.downloadCSV(
          exportData,
          `alerts_${timestamp}`,
          'Alerts',
        );
        break;

      case 'pdf':
        this.reportService.downloadPDF(
          exportData,
          `alerts_${timestamp}`,
          'Alerts',
        );
        break;
    }
  }
}
