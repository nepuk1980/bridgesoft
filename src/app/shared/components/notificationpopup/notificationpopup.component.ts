import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ApiService } from '../../../services/api.service';
import { NotificationInterface } from '../../../models/type';
import { ReportService } from '../../../services/report.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

export interface NotificationRow {
  notification: string;
  sourceIp: string;
  resource: string;
  targetUser: string;
  time: string;
}

@Component({
  selector: 'app-notificationpopup',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    NgIf,
    NgFor,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  templateUrl: './notificationpopup.component.html',
  styleUrls: ['./notificationpopup.component.css'],
})
export class NotificationpopupComponent implements OnInit, AfterViewInit {
  private dialogRef = inject(MatDialogRef<NotificationpopupComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService,
    private reportService: ReportService,
  ) {}

  displayedColumns: string[] = [
    'notification',
    'sourceIp',
    'resource',
    'targetUser',
    'time',
  ];

  dataSource = new MatTableDataSource<NotificationRow>();

  @ViewChild(MatSort) sort!: MatSort;

  private pageCache = new Map<number, NotificationRow[]>();
  private requestCache = new Map<number, Observable<NotificationRow[]>>();
  selectedDownload: string = 'Download';

  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  isLoading = false;
  isDownloading = false;

  ngOnInit(): void {
    this.loadPageData();
    console.log(this.dataSource);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private mapNotification(item: any): NotificationRow {
    return {
      notification: item.notification ?? '-',
      sourceIp: item.sourceIp ?? '-',
      resource: item.resource ?? '-',
      targetUser: item.target_user ?? '-',
      time: item.notificationTime
        ? new Date(item.notificationTime).toLocaleString()
        : '-',
    };
  }

  private prefetchPage(page: number) {
    if (
      this.pageCache.has(page) ||
      this.requestCache.has(page) ||
      page < 0 ||
      page >= this.totalPages
    ) {
      return;
    }

    const request$ = this.api.getgetnotifications(page, this.pageSize).pipe(
      map((res: NotificationInterface) =>
        (res.content ?? []).map((item) => this.mapNotification(item)),
      ),
      shareReplay(1),
    );

    this.requestCache.set(page, request$);

    request$.subscribe((data) => {
      this.pageCache.set(page, data);
      this.requestCache.delete(page);
    });
  }

  loadPageData() {
    if (this.pageCache.has(this.pageIndex)) {
      this.dataSource.data = this.pageCache.get(this.pageIndex)!;
      this.generatePages();

      this.prefetchPage(this.pageIndex + 1);
      this.prefetchPage(this.pageIndex - 1);

      return;
    }

    this.isLoading = true;

    const request$ = this.api
      .getgetnotifications(this.pageIndex, this.pageSize)
      .pipe(
        map((res: NotificationInterface) => {
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;

          return (res.content ?? []).map((item) => this.mapNotification(item));
        }),
        shareReplay(1),
      );

    this.requestCache.set(this.pageIndex, request$);

    request$.subscribe({
      next: (data) => {
        this.pageCache.set(this.pageIndex, data);
        this.requestCache.delete(this.pageIndex);

        this.dataSource.data = data;

        this.generatePages();

        this.prefetchPage(this.pageIndex + 1);
        this.prefetchPage(this.pageIndex - 1);

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  generatePages() {
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

  goToPage(page: number) {
    this.pageIndex = page - 1;
    this.loadPageData();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.loadPageData();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadPageData();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.loadPageData();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.loadPageData();
  }

  private getFormattedDateTime(): string {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(now.getDate()).padStart(
      2,
      '0',
    )}_${String(now.getHours()).padStart(2, '0')}-${String(
      now.getMinutes(),
    ).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  }

  private fetchAllDataAndExport(type: 'excel' | 'csv' | 'pdf') {
    this.isDownloading = true;

    const pageSize = 5000;
    let currentPage = 0;
    let totalPages = 1;

    const allNotifications: any[] = [];

    const fetchPage = () => {
      this.api.getgetnotifications(currentPage, pageSize).subscribe({
        next: (res: NotificationInterface) => {
          totalPages = res.totalPages || 1;

          allNotifications.push(...(res.content || []));

          currentPage++;

          if (currentPage < totalPages) {
            fetchPage();
            return;
          }

          const exportData = allNotifications.map((item: any, index) => ({
            'Sr No': index + 1,
            Notification: item.notification ?? '-',
            'Source IP': item.sourceIp ?? '-',
            Resource: item.resource ?? '-',
            'Target User': item.target_user ?? '-',
            Time: item.notificationTime
              ? new Date(item.notificationTime).toLocaleString()
              : '-',
          }));

          const timestamp = this.getFormattedDateTime();

          if (type === 'excel') {
            this.reportService.downloadExcel(
              exportData,
              `notifications_${timestamp}`,
              'Notifications',
            );
          } else if (type === 'csv') {
            this.reportService.downloadCSV(
              exportData,
              `notifications_${timestamp}`,
              'Notifications',
            );
          } else {
            this.reportService.downloadPDF(
              exportData,
              `notifications_${timestamp}`,
              'Notifications',
            );
          }

          this.isDownloading = false;
        },

        error: (err) => {
          console.error('Export failed', err);
          this.isDownloading = false;
        },
      });
    };

    fetchPage();
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
