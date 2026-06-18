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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertInterface } from '../../models/type';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

interface Alert {
  id: number;
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
    NgxSkeletonLoaderModule,
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

  dataSource = new MatTableDataSource<AlertInterface>([]);
  originalData: AlertInterface[] = [];

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
  pageCache: Map<number, AlertInterface[]> = new Map();

  maxCachePages = 5;

  Math = Math;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private api: ApiService,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.getAlerts();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  getAlerts(): void {
    this.isLoading = true;
    this.api.getalerts(this.pageIndex, this.pageSize).subscribe({
      next: (res: any) => {
        // Ensure you use the exact key from the API response
        const mappedData: AlertInterface[] = (res.content ?? []).map(
          (item: any) => ({
            id: item.alertId ?? item.id ?? 0,
            alertName: item.alertName ?? '',
            alertDesc: item.alertDesc ?? '',
            whenSomeone: item.whenSomeone ?? '',
            alertAction: item.alertAction ?? '',
            alertResources: item.alertResources ?? '',
            includeGroups: item.includeGroups ?? '',
            includeUsers: item.includeUsers ?? '',
            includeResources: item.includeResources ?? '',
            excludeGroups: item.excludeGroups ?? '',
            excludeUsers: item.excludeUsers ?? '',
            excludeResources: item.excludeResources ?? '',
            allTheTime: item.allTheTime ?? false,
            fromDate: item.fromDate ?? null,
            toDate: item.toDate ?? null,
            days: item.days ?? '',
            timeZone: item.timeZone ?? '',
            alertTime: item.alertTime ?? null,
            alertMode: item.alertMode ?? '',
            createdDate: item.createdDate ?? null,
            updatedDate: item.updatedDate ?? null,
            deletedDate: item.deletedDate ?? null,
            alertUsers: item.alertUsers ?? 0,
            alertFolders: item.alertFolders ?? 0,
            alertFiles: item.alertFiles ?? 0,
            alertEmail: item.alertEmail ?? null,
          }),
        );
        this.dataSource.data = mappedData;
        this.totalElements = res.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  // Add this helper method
  showMessage(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // Increased to 3s for better readability
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  // Update your deleteAlert to use the new method
  deleteAlert(element: Alert): void {
    if (!element.id) {
      this.showMessage('Error: Invalid Alert ID');
      return;
    }

    if (confirm('Are you sure you want to delete this alert?')) {
      this.isLoading = true;
      this.api.deleteAlert(element.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.showMessage('Alert deleted successfully'); // Using the helper
          this.refreshAlerts();
        },
        error: (err) => {
          this.isLoading = false;
          this.showMessage('Error deleting alert'); // Using the helper
          console.error('Delete Error:', err);
        },
      });
    }
  }

  refreshAlerts(): void {
    this.pageCache.clear();
    this.pageIndex = 0;
    this.getAlerts();
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
  editAlert(element: AlertInterface): void {
    // Pass the entire alert object to the configuration page
    this.router.navigate(['alerts/alerts-configuration'], {
      state: { alertData: element, mode: 'edit' },
    });
  }
  copyAlert(element: AlertInterface): void {
    // Pass the entire alert object to the configuration page
    this.router.navigate(['alerts/alerts-configuration'], {
      state: { alertData: element, mode: 'copy' },
    });
  }
}
