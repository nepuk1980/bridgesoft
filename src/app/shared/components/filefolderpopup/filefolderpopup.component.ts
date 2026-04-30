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

  // ✅ FULL DATA STORAGE
  allData: any[] = [];
  filteredData: any[] = [];

  selectedDownload: string = 'Download';

  @ViewChild(MatSort) sort!: MatSort;

  // ================= PAGINATION =================
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  isLoading = false;

  get dataSourceLength() {
    return this.dataSource.data.length || 0;
  }

  // ================= INIT =================
  ngOnInit() {
    const isFile = this.data?.fileicon;

    this.displayedColumns = isFile
      ? ['name', 'category', 'adgroup', 'user', 'duration', 'created']
      : ['name', 'category', 'adgroup', 'created'];

    this.loadAllData(); // ✅ fetch full dataset
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // ================= LOAD FULL DATA =================
  loadAllData() {
    this.isLoading = true;

    this.api
      .getFilesystemAccessPermissionDetails(
        this.data.ruleCategory,
        0,
        100000, // ⚠️ large fetch
      )
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          const items = res?.content ?? [];
          const isFile = this.data?.fileicon;

          this.allData = items.map((item: any) => ({
            name: isFile
              ? (item.fileName ?? item.itemName ?? '-')
              : (item.itemName ?? '-'),

            itemType: item.itemType,

            url: isFile
              ? (item.fileUrl ?? item.itemUrl ?? null)
              : (item.itemUrl ?? null),

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

          // ✅ initial state
          this.filteredData = [...this.allData];
          this.pageIndex = 0;

          this.updatePagination();
        },
        error: (err) => {
          console.error('API error:', err);
          this.isLoading = false;
        },
      });
  }

  // ================= PAGINATION CORE =================
  updatePagination() {
    this.totalElements = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);

    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    this.dataSource.data = this.filteredData.slice(start, end);

    this.generatePages();
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

  // ================= PAGINATION ACTIONS =================
  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.updatePagination();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updatePagination();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.updatePagination();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.updatePagination();
  }

  // ================= GLOBAL SEARCH =================
  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.pageIndex = 0;

    this.filteredData = this.allData.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value) ||
        item.adgroup.toLowerCase().includes(value),
    );

    this.updatePagination();
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
    this.isLoading = true;

    // ✅ ALWAYS fetch full dataset (ignore pagination + search)
    this.api
      .getFilesystemAccessPermissionDetails(
        this.data.ruleCategory,
        0,
        100000, // 🔥 force full fetch (independent of UI state)
      )
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          const items = res?.content ?? [];
          const isFile = this.data?.fileicon;

          const allData = items.map((item: any) => ({
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
        },
        error: (err) => {
          console.error('Export API error:', err);
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
