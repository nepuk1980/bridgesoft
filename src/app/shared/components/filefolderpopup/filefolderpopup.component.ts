import {
  Component,
  ViewChild,
  AfterViewInit,
  Inject,
  inject,
  OnInit,
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NgFor, NgIf } from '@angular/common';

import { ReportService } from '../../../services/report.service';

import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-filefolderpopup',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    FormsModule,
    MatProgressSpinnerModule,
    NgIf,
    NgFor,
    MatTooltipModule,
  ],
  templateUrl: './filefolderpopup.component.html',
  styleUrls: ['./filefolderpopup.component.css'],
})
export class FilefolderpopupComponent implements AfterViewInit, OnInit {
  private dialogRef = inject(MatDialogRef<FilefolderpopupComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reportService: ReportService,
    private api: ApiService,
  ) {}

  displayedColumns: string[] = [
    'name',
    'category',
    'adgroup',
    'user',
    'duration',
    'created',
  ];

  dataSource = new MatTableDataSource<any>();

  selectedDownload: string = 'Download';

  @ViewChild(MatSort) sort!: MatSort;

  // ================= PAGINATION =================
  pageSize = 10;
  pageIndex = 0;

  totalPages = 0;
  totalElements = 0;

  pages: number[] = [];

  isLoading = false;
  isDownloading = false;

  searchFileOrFolderName: string = '';

  searchTimeout: any;

  // ================= SMART CACHE =================
  // only cache nearby pages
  pageCache: Map<number, any[]> = new Map();

  // max pages to keep in memory
  maxCachePages = 5;

  get dataSourceLength() {
    return this.dataSource.data.length || 0;
  }

  // ================= INIT =================
  ngOnInit() {
    const isFile = this.data?.fileicon;

    this.displayedColumns = isFile
      ? ['name', 'category', 'adgroup', 'user', 'duration', 'created']
      : ['name', 'category', 'adgroup', 'created'];

    this.searchFileOrFolderName = this.data?.searchFileOrFolderName ?? '';

    this.loadPage();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // ================= DATA MAPPER =================
  mapData(items: any[]) {
    const isFile = this.data?.fileicon;

    return items.map((item: any) => ({
      name: isFile
        ? (item.fileName ?? item.itemName ?? '-')
        : (item.itemName ?? '-'),

      category: item.category ?? '-',

      adgroup: item.groupsList
        ? item.groupsList
            .split(',')
            .map((g: string) => g.trim())
            .join(', ')
        : '-',

      user: item.username ?? item.owner ?? '-',

      duration: item.duration ?? '-',

      created: item.createDatetime
        ? new Date(item.createDatetime).toLocaleDateString()
        : '-',
    }));
  }

  // ================= LOAD PAGE =================
  loadPage() {
    // ✅ use cache first
    if (this.pageCache.has(this.pageIndex)) {
      this.dataSource.data = this.pageCache.get(this.pageIndex) ?? [];

      this.generatePages();

      // preload nearby pages
      this.prefetchNearbyPages();

      return;
    }

    this.isLoading = true;

    this.api
      .getFilesystemAccessPermissionDetails(
        this.data.ruleCategory,
        this.pageIndex,
        this.pageSize,
        this.searchFileOrFolderName || '',
      )
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          const items = this.mapData(res?.content ?? []);

          // store cache
          this.pageCache.set(this.pageIndex, items);

          // cleanup old cache
          this.cleanupCache();

          this.dataSource.data = items;

          this.totalElements = res?.totalElements ?? 0;
          this.totalPages = res?.totalPages ?? 0;

          this.generatePages();

          // silently preload nearby pages
          this.prefetchNearbyPages();
        },

        error: (err) => {
          console.error('Pagination API Error:', err);
          this.isLoading = false;
        },
      });
  }

  // ================= PREFETCH =================
  prefetchNearbyPages() {
    const pagesToPrefetch = [this.pageIndex + 1, this.pageIndex + 2];

    pagesToPrefetch.forEach((page) => {
      if (page >= this.totalPages) return;

      if (this.pageCache.has(page)) return;

      this.api
        .getFilesystemAccessPermissionDetails(
          this.data.ruleCategory,
          page,
          this.pageSize,
          this.searchFileOrFolderName || '',
        )
        .subscribe({
          next: (res: any) => {
            const items = this.mapData(res?.content ?? []);

            this.pageCache.set(page, items);

            this.cleanupCache();
          },
          error: () => {},
        });
    });
  }

  // ================= CACHE CLEANUP =================
  cleanupCache() {
    // keep only nearby pages
    if (this.pageCache.size <= this.maxCachePages) return;

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
  generatePages() {
    if (!this.totalPages) {
      this.pages = [];
      return;
    }

    const visible = 3;

    let start = Math.max(1, this.pageIndex + 1 - Math.floor(visible / 2));

    let end = start + visible - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - visible + 1);
    }

    this.pages = [];

    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  // ================= PAGINATION ACTIONS =================
  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.loadPage();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.loadPage();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadPage();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.loadPage();
  }

  lastPage() {
    if (this.totalPages > 0) {
      this.pageIndex = this.totalPages - 1;
      this.loadPage();
    }
  }

  // ================= SEARCH =================
  applyFilter() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.pageIndex = 0;

      this.pageCache.clear();

      this.loadPage();
    }, 400);
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

  private fetchAllDataAndExport(type: 'excel' | 'csv' | 'pdf') {
    this.isLoading = true;
    this.isDownloading = true;

    // ✅ chunk size
    const chunkSize = 5000;

    // ✅ current API page
    let currentPage = 0;

    // ✅ total pages from API
    let totalPages = 0;

    // ✅ store all rows
    let allItems: any[] = [];

    const fetchNextPage = () => {
      this.api
        .getFilesystemAccessPermissionDetails(
          this.data.ruleCategory,
          currentPage,
          chunkSize,
          this.searchFileOrFolderName || '',
        )
        .subscribe({
          next: (res: any) => {
            const items = res?.content ?? [];

            // ✅ total pages from backend
            if (!totalPages) {
              totalPages = res?.totalPages ?? 0;
            }

            // ✅ append data
            allItems.push(...items);

            // ✅ next page
            currentPage++;

            // ✅ continue until all pages loaded
            if (currentPage < totalPages) {
              fetchNextPage();
              return;
            }

            // ================= EXPORT =================
            const isFile = this.data?.fileicon;

            const exportData = allItems.map((item: any) => {
              const mappedItem = {
                name: isFile
                  ? (item.fileName ?? item.itemName ?? '-')
                  : (item.itemName ?? '-'),

                category: item.category ?? '-',

                adgroup: item.groupsList
                  ? item.groupsList
                      .split(',')
                      .map((g: string) => g.trim())
                      .join(', ')
                  : '-',

                user: item.userName ?? item.owner ?? '-',

                duration: item.duration ?? '-',

                created: item.createDatetime
                  ? new Date(item.createDatetime).toLocaleDateString()
                  : '-',
              };

              let row: any = {};

              if (this.data?.both) {
                row['File/Folder Names'] = mappedItem.name;
              } else if (this.data?.file) {
                row['File Names'] = mappedItem.name;
              } else {
                row['Folder Names'] = mappedItem.name;
              }

              row['Categories'] = mappedItem.category;
              row['AD Group'] = mappedItem.adgroup;
              row['User'] = mappedItem.user;
              row['Duration'] = mappedItem.duration;
              row['Created On'] = mappedItem.created;

              return row;
            });

            const timestamp = this.getFormattedDateTime();

            // ✅ download file
            if (type === 'excel') {
              this.reportService.downloadExcel(
                exportData,
                `dashboard-${this.data.reporttitle}_${timestamp}`,
                `Dashboard-${this.data.title}`,
              );
            } else if (type === 'csv') {
              this.reportService.downloadCSV(
                exportData,
                `dashboard-${this.data.reporttitle}_${timestamp}`,
                `Dashboard-${this.data.title}`,
              );
            } else {
              this.reportService.downloadPDF(
                exportData,
                `dashboard-${this.data.reporttitle}_${timestamp}`,
                `Dashboard-${this.data.title}`,
              );
            }

            // ✅ cleanup
            allItems = [];

            this.isLoading = false;
            this.isDownloading = false;
          },

          error: (err) => {
            console.error('Export API error:', err);

            this.isLoading = false;
            this.isDownloading = false;
          },
        });
    };

    // ✅ start loading pages
    fetchNextPage();
  }

  // ================= DOWNLOAD =================
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
