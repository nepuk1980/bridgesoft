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
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { FileSystemResponseInterface } from '../../../models/type';

type ShareApiMethod = (
  ruleCategory: string,
  page: number,
  size: number,
  search?: string,
) => Observable<FileSystemResponseInterface>;

@Component({
  selector: 'app-filefoldersharepopup',
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
  templateUrl: './filefoldersharepopup.component.html',
  styleUrl: './filefoldersharepopup.component.css',
})
export class FilefoldersharepopupComponent implements AfterViewInit, OnInit {
  private dialogRef = inject(MatDialogRef<FilefoldersharepopupComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reportService: ReportService,
    private api: ApiService,
  ) {}

  selectedDownload: string = 'Download';
  // ✅ Search-aware cache
  private pageCache = new Map<string, any[]>();
  private requestCache = new Map<string, Observable<any[]>>();

  displayedColumns: string[] = [
    'name',
    'category',
    'adgroup',
    'user',
    'duration',
    'created',
  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatSort) sort!: MatSort;

  searchFileOrFolderName: string = '';
  private searchTimeout: any;

  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  isLoading = false;
  isDownloading = false;

  ngOnInit() {
    const isFile = this.data?.fileicon;

    this.displayedColumns = isFile
      ? ['name', 'category', 'adgroup', 'user', 'duration', 'created']
      : ['name', 'category', 'adgroup', 'created'];

    this.loadPageData();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private getApiMethod(methodName: keyof ApiService): ShareApiMethod | null {
    const fn = this.api[methodName];
    if (typeof fn !== 'function') return null;
    return fn.bind(this.api) as ShareApiMethod;
  }

  private getKey(page: number) {
    return `${this.searchFileOrFolderName}_${page}`;
  }

  private mapItem(item: any, isFile: boolean) {
    return {
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
  }

  private prefetchPage(page: number) {
    const key = this.getKey(page);

    if (
      this.pageCache.has(key) ||
      this.requestCache.has(key) ||
      page < 0 ||
      page >= this.totalPages
    ) {
      return;
    }

    const apiFn = this.getApiMethod(this.data.apiMethod);
    if (!apiFn) return;

    const request$ = apiFn(
      this.data.ruleCategory,
      page,
      this.pageSize,
      this.searchFileOrFolderName,
    ).pipe(
      map((res) => {
        const items = res?.content ?? [];
        const isFile = this.data?.fileicon;
        return items.map((item: any) => this.mapItem(item, isFile));
      }),
      shareReplay(1),
    );

    this.requestCache.set(key, request$);

    request$.subscribe((mapped) => {
      this.pageCache.set(key, mapped);
      this.requestCache.delete(key);
    });
  }

  loadPageData() {
    const key = this.getKey(this.pageIndex);

    // ✅ Cache hit
    if (this.pageCache.has(key)) {
      this.dataSource.data = this.pageCache.get(key)!;
      this.generatePages();

      this.prefetchPage(this.pageIndex + 1);
      this.prefetchPage(this.pageIndex + 2);
      this.prefetchPage(this.pageIndex - 1);

      return;
    }
    this.isLoading = true;

    // ✅ Request in-flight
    if (this.requestCache.has(key)) {
      this.isLoading = true;

      this.requestCache.get(key)!.subscribe((mapped) => {
        this.isLoading = false;
        this.dataSource.data = mapped;

        this.prefetchPage(this.pageIndex + 1);
        this.prefetchPage(this.pageIndex + 2);
        this.prefetchPage(this.pageIndex - 1);
      });

      return;
    }

    // ✅ Fresh API call
    this.isLoading = true;

    const apiFn = this.getApiMethod(this.data.apiMethod);
    if (!apiFn) return;

    const request$ = apiFn(
      this.data.ruleCategory,
      this.pageIndex,
      this.pageSize,
      this.searchFileOrFolderName,
    ).pipe(
      map((res) => {
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;

        const items = res?.content ?? [];
        const isFile = this.data?.fileicon;

        return items.map((item: any) => this.mapItem(item, isFile));
      }),
      shareReplay(1),
    );

    this.requestCache.set(key, request$);

    request$.subscribe((mapped) => {
      this.isLoading = false;

      this.pageCache.set(key, mapped);
      this.requestCache.delete(key);

      this.dataSource.data = mapped;
      this.generatePages();

      this.prefetchPage(this.pageIndex + 1);
      this.prefetchPage(this.pageIndex + 2);
      this.prefetchPage(this.pageIndex - 1);
    });
  }

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

  goToPage(p: number) {
    this.pageIndex = p - 1;
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

  // ✅ Debounced server-side search
  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.searchFileOrFolderName = value;
      this.pageIndex = 0;

      this.pageCache.clear();
      this.requestCache.clear();

      this.loadPageData();
    }, 300);
  }

  // ================= EXPORT (UNCHANGED) =================
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
    const apiFn = this.getApiMethod(this.data.apiMethod);

    if (!apiFn) return;

    this.isLoading = true;
    this.isDownloading = true;

    // ✅ fetch in chunks
    const CHUNK_SIZE = 5000;

    let currentPage = 0;

    let totalPages = 0;

    let allItems: any[] = [];

    const fetchNextPage = () => {
      apiFn(
        this.data.ruleCategory,
        currentPage,
        CHUNK_SIZE,
        this.searchFileOrFolderName || '',
      ).subscribe({
        next: (res: any) => {
          const items = res?.content ?? [];

          // ✅ set total pages once
          if (!totalPages) {
            totalPages = res?.totalPages ?? 0;
          }

          // ✅ merge chunk data
          allItems.push(...items);

          currentPage++;

          // ✅ fetch next chunk
          if (currentPage < totalPages) {
            fetchNextPage();
            return;
          }

          // ================= FINAL EXPORT =================
          const isFile = this.data?.fileicon;

          const allData = allItems.map((item: any) => ({
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
          }));

          const exportData = allData.map((item: any) => {
            let row: any = {};

            if (this.data?.both) {
              row['File/Folder Names'] = item.name;
            } else if (this.data?.file) {
              row['File Names'] = item.name;
            } else {
              row['Folder Names'] = item.name;
            }

            row['Categories'] = item.category;
            row['AD Group'] = item.adgroup;
            row['User'] = item.user;
            row['Duration'] = item.duration;
            row['Created On'] = item.created;

            return row;
          });

          const timestamp = this.getFormattedDateTime();

          // ================= DOWNLOAD =================
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

          // ✅ cleanup memory
          allItems = [];

          this.isLoading = false;
          this.isDownloading = false;
        },

        error: (err: any) => {
          console.error('Export API error:', err);

          this.isLoading = false;
          this.isDownloading = false;
        },
      });
    };

    // ✅ start fetching
    fetchNextPage();
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
