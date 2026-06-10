import {
  Component,
  ViewChild,
  AfterViewInit,
  Inject,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartEvent, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MydrivepopupComponent } from '../mydrivepopup/mydrivepopup.component';
import { ApiService } from '../../../services/api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ReportService } from '../../../services/report.service';
import { FormsModule } from '@angular/forms';

// Register plugin
Chart.register(ChartDataLabels);

export interface Shared {
  sharedBy: string;
  sharedWith: string;
  fileName: string;
  fileType: string;
  date: string;
}

export interface externalFiles {
  name: string;
  type: string;
  service: string;
  serviceType: string;
  libraryName: string;
  lastViewed: string;
  lastViewedRecent: string;
  tags: string[];
}

@Component({
  selector: 'app-externalresourcespopup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BaseChartDirective,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './externalresourcespopup.component.html',
  styleUrls: ['./externalresourcespopup.component.css'],
})
export class ExternalresourcespopupComponent implements AfterViewInit, OnInit {
  private dialogRef = inject(MatDialogRef<ExternalresourcespopupComponent>);
  private dialog = inject(MatDialog);
  private api = inject(ApiService);

  // Infinite scroll
  page = 0;
  pageSize = 10;
  loading = false;
  allDataLoaded = false;
  isLoading = false;
  isDownloading = false;
  searchFileOrFolderName = '';
  selectedDownload: string = 'download';
  // Hold accumulated records
  private sharedData: Shared[] = [];
  private externalDataList: externalFiles[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reportService: ReportService,
  ) {}

  displayedColumns: string[] = [
    'sharedBy',
    'sharedWith',
    'fileName',
    'fileType',
    'date',
  ];

  displayedColumns2: string[] = [
    'name',
    'type',
    'service',
    'lastViewed',
    // 'lastViewedRecent',
    'tags',
  ];

  dataSource = new MatTableDataSource<Shared>([]);
  dataSource2 = new MatTableDataSource<externalFiles>([]);

  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('sort2') sort2!: MatSort;

  driveDialogRef!: MatDialogRef<MydrivepopupComponent>;

  ngOnInit(): void {
    this.setStaticChartData();
    this.loadTableData(true);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort1;
    this.dataSource2.sort = this.sort2;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.dataSource.filter = value;
    this.dataSource2.filter = value;
  }

  loadTableData(reset: boolean = false): void {
    if (this.loading) {
      return;
    }

    if (reset) {
      this.page = 0;
      this.allDataLoaded = false;
      this.sharedData = [];
      this.externalDataList = [];
      this.dataSource.data = [];
      this.dataSource2.data = [];
    }

    if (this.allDataLoaded) {
      return;
    }

    this.loading = true;

    const category = this.data?.ruleCategory || 'External Sources';

    // API uses offset and limit
    const offset = this.page * this.pageSize;

    this.api
      .getFilesystemAccessPermissionDetails(category, offset, this.pageSize, '')
      .subscribe({
        next: (res: any) => {
          const raw = res?.content ?? res?.data ?? [];

          if (!raw || raw.length === 0) {
            this.allDataLoaded = true;
            this.loading = false;
            return;
          }

          const sharedRows: Shared[] = raw.map((item: any) => ({
            sharedBy: item.username,
            sharedWith: item.username,
            fileName: item.itemName,
            fileType: item.itemType,
            date: item.createDatetime,
          }));

          const externalRows: externalFiles[] = raw.map((item: any) => ({
            name: item.itemName,
            type: item.itemType,
            service: item.sourceType,
            libraryName: item.libraryName?.toLowerCase() || '',
            serviceType: item.sourceType?.toLowerCase() || '',
            lastViewed: item.lastModifiedDatetime,
            // lastViewedRecent: item.lastAccessedDatetime,
            tags: item.ruleCategory ? item.ruleCategory.split(',') : [],
          }));

          // Append newly loaded records
          this.sharedData.push(...sharedRows);
          this.externalDataList.push(...externalRows);

          // Update datasource
          this.dataSource.data = [...this.sharedData];
          this.dataSource2.data = [...this.externalDataList];

          // Re-attach sorting
          if (this.sort1) {
            this.dataSource.sort = this.sort1;
          }

          if (this.sort2) {
            this.dataSource2.sort = this.sort2;
          }

          // If fewer than pageSize records are returned,
          // assume there is no more data.
          if (raw.length < this.pageSize) {
            this.allDataLoaded = true;
          }

          this.page++;
          this.loading = false;
        },
        error: (err) => {
          console.error(
            'Error loading filesystem access permission details',
            err,
          );
          this.loading = false;
        },
      });
  }

  onTableScroll(event: Event): void {
    const target = event.target as HTMLElement;

    const scrollPosition = target.scrollTop + target.clientHeight;
    const scrollHeight = target.scrollHeight;

    // Load next page when within 50px of bottom
    if (
      scrollHeight - scrollPosition <= 50 &&
      !this.loading &&
      !this.allDataLoaded
    ) {
      this.loadTableData();
    }
  }

  openDriveDialog(element: Shared): MatDialogRef<MydrivepopupComponent> {
    if (this.driveDialogRef) {
      this.driveDialogRef.close();
    }

    this.driveDialogRef = this.dialog.open(MydrivepopupComponent, {
      width: '34.375rem',
      hasBackdrop: false,
      minWidth: '34.375rem',
      maxWidth: '100%',
      position: {
        bottom: '4%',
        right: '5%',
      },
      panelClass: 'bottom-right-dialog',
      data: element,
    });

    return this.driveDialogRef;
  }

  closeDialog(): void {
    if (this.driveDialogRef) {
      this.driveDialogRef.close();
    }
    this.dialogRef.close();
  }

  // =========================
  // Chart Configuration
  // =========================

  public barChartType: 'bar' = 'bar';

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 20,
      },
    },

    scales: {
      x: {
        offset: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          color: '#787878',
          padding: 12,
          font: {
            size: 12,
            weight: 'bold',
          },
          align: 'center',
        },
      },
      y: {
        min: 0,
        max: 14000,
        ticks: {
          display: false,
        },
        grid: {
          display: true,
        },
        border: {
          display: false,
        },
      },
    },

    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#787878',
        font: {
          weight: 'bold',
          size: 14,
        },
        formatter: (value: number) => {
          if (value >= 1000) {
            return `~${(value / 1000).toFixed(1)}K`;
          }
          return `~${value}`;
        },
      },
    },
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  private setStaticChartData(): void {
    this.barChartData = {
      labels: [
        ['Stale', 'Resources'],
        ['Private'],
        ['Shared', 'External'],
        ['Sensitive', 'Files'],
        ['Public'],
        ['Shared Internal', 'Files'],
      ],
      datasets: [
        {
          label: 'External Resources',
          data: [12700, 12300, 2970, 2550, 1180, 1170],
          borderRadius: 8,
          categoryPercentage: 1,
          barPercentage: 1,
          barThickness: 84,
          maxBarThickness: 84,
          backgroundColor: (context) => {
            const { chart, dataIndex, dataset } = context;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return '#6C63FF';
            }

            const gradients = [
              ['#F4FAFF', '#7EC8F8'], // Light Blue
              ['#FFF8F0', '#F5B971'], // Light Orange
              ['#F4FFF6', '#7EDB8C'], // Light Green
              ['#F7FDFF', '#A6EFFF'], // Light Cyan
              ['#F4FCFD', '#6CC9D9'], // Light Teal
              ['#F5F7FF', '#8C9EFF'], // Light Indigo
            ];

            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top,
            );

            gradient.addColorStop(0, gradients[dataIndex][0]);
            gradient.addColorStop(0.4, gradients[dataIndex][1]);

            return gradient;
          },
        },
      ],
    };
  }

  chartClicked({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  chartHovered({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
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

  private fetchAllDataAndExport(type: 'excel' | 'csv' | 'pdf'): void {
    this.isLoading = true;
    this.isDownloading = true;

    const category = this.data?.ruleCategory || 'External Sources';
    const PAGE_SIZE = 1000; // use maximum supported by backend

    let page = 0;
    let allItems: any[] = [];

    const fetchPage = () => {
      this.api
        .getFilesystemAccessPermissionDetails(
          category,
          page, // page number, NOT offset
          PAGE_SIZE,
          this.searchFileOrFolderName || '',
        )
        .subscribe({
          next: (res: any) => {
            const items = res?.content || [];

            allItems.push(...items);

            console.log(
              `Page: ${page + 1}/${res.totalPages}, Fetched: ${items.length}, Total Loaded: ${allItems.length}`,
            );

            // Last page reached
            if (res.last || page >= res.totalPages - 1) {
              this.exportData(allItems, type);
              return;
            }

            page++;
            fetchPage();
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
            this.isDownloading = false;
            this.selectedDownload = 'download';
          },
        });
    };

    fetchPage();
  }

  private exportData(allItems: any[], type: 'excel' | 'csv' | 'pdf'): void {
    const exportData = allItems.map((item: any, index: number) => ({
      'Sr No': index + 1,
      'Shared By': item.username ?? '-',
      'Shared With': item.username ?? '-',
      'File Name': item.itemName ?? '-',
      'File Type': item.itemType ?? '-',
      Date: item.createDatetime
        ? new Date(item.createDatetime).toLocaleString()
        : '-',
      Service: item.sourceType ?? '-',
      'Source Type': item.sourceType ?? '-',
      'Last Viewed': item.lastModifiedDatetime ?? '-',
      Tags: item.ruleCategory ?? '-',
    }));

    const timestamp = this.getFormattedDateTime();

    if (type === 'excel') {
      this.reportService.downloadExcel(
        exportData,
        `external-sources${timestamp}`,
        'External Sources',
      );
    } else if (type === 'csv') {
      this.reportService.downloadCSV(
        exportData,
        `external-sources${timestamp}`,
        'External Sources',
      );
    } else {
      this.reportService.downloadPDF(
        exportData,
        `external-sources${timestamp}`,
        'External Sources',
      );
    }

    this.selectedDownload = 'download';
    this.isLoading = false;
    this.isDownloading = false;
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
