import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ApiService } from '../../services/api.service';
import { ReportService } from '../../services/report.service';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';

interface Filter {
  value: string;
  viewValue: string;
}

interface Application {
  name: string;
  host: string;
  type: string;
  modified: string;
  assigned: string;
  link: string;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    InnerheaderComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule, // ✅ added
    FormsModule,
    RouterModule,
    NgxSkeletonLoaderModule,
    MatIconModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.css',
})
export class ApplicationsComponent implements OnInit, AfterViewInit {
  constructor(
    private api: ApiService,
    private reportService: ReportService,
  ) {}

  // ✅ Filters
  filters: Filter[] = [];

  displayedColumns: string[] = ['name', 'host', 'type', 'modified', 'assigned'];

  dataSource = new MatTableDataSource<Application>([]);
  originalData: Application[] = [];

  searchText: string = '';
  selectedFilter: string = '';
  selectedDownload: string = 'download';

  isLoading = false; // ✅ loader

  page = 0;
  size = 10;
  totalElements = 0;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ✅ Init
  ngOnInit() {
    this.getApplications();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // ✅ API Call with pagination
  getApplications() {
    this.isLoading = true;

    this.api.getlistofapplications(this.page, this.size).subscribe({
      next: (res) => {
        const mappedData: Application[] = res.content.map((item) => ({
          id: item.id,
          name: item.applicationName,
          host: item.applicationHost,
          type: item.applicationType,
          modified: new Date(item.lastModifiedDatetime).toLocaleString(),
          assigned: item.assignedRoleSummary,
          link:
            '/applications/' +
            item.applicationType.toLowerCase().replace(/\s+/g, '-'),
        }));

        this.originalData = mappedData;
        this.dataSource.data = mappedData;

        this.totalElements = res.totalElements;
        this.generatePages();

        // ✅ 🔥 Dynamic filter generation
        const uniqueTypes = [...new Set(mappedData.map((item) => item.type))];

        this.filters = uniqueTypes.map((type) => ({
          value: type,
          viewValue: type,
        }));

        this.isLoading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false;
      },
    });
  }

  // ✅ Pagination change
  onPageChange(event: any) {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.getApplications();
  }

  // ✅ Combined Filter
  applyFilters() {
    let filteredData = [...this.originalData];

    // Dropdown filter
    if (this.selectedFilter) {
      filteredData = filteredData.filter((item) =>
        item.type.toLowerCase().includes(this.selectedFilter.toLowerCase()),
      );
    }

    // Search filter
    if (this.searchText) {
      const search = this.searchText.trim().toLowerCase();

      filteredData = filteredData.filter((item) =>
        `${item.name} ${item.host} ${item.type} ${item.assigned}`
          .toLowerCase()
          .includes(search),
      );
    }

    this.dataSource.data = filteredData;
  }

  private getFormattedDateTime(): string {
    const now = new Date();

    const date = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
    const time = now
      .toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/:/g, '-'); // HH-MM-SS

    return `${date}_${time}`;
  }

  private getExportData() {
    return this.originalData.map((item) => ({
      Name: item.name,
      Host: item.host,
      Type: item.type,
      Modified: item.modified,
      'Assigned Role Summary': item.assigned,
    }));
  }
  downloadExcel() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `application-report_${timestamp}`,
      'Applications',
    );
  }

  downloadCSV() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `application-report_${timestamp}`,
      'Applications',
    );
  }

  downloadPDF() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `application-report_${timestamp}`,
      'Applications',
    );
  }

  // ✅ Pagination
  pageSize = 10;
  pageIndex = 0;

  totalPages = 0;
  pages: number[] = [];

  // -------------------------------
  // CALCULATE PAGINATION
  // -------------------------------
  generatePages() {
    this.totalPages = Math.ceil(this.totalElements / this.size);

    const visible = 3;

    if (this.totalPages <= 0) {
      this.pages = [];
      return;
    }

    let start = Math.max(1, this.pageIndex + 1 - 1);
    let end = Math.min(this.totalPages, start + visible - 1);

    if (end - start < visible - 1) {
      start = Math.max(1, end - visible + 1);
    }

    this.pages = [];

    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  // -------------------------------
  // PAGINATION ACTIONS (SERVER SIDE)
  // -------------------------------
  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.page = this.pageIndex;
    this.getApplications();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.page = this.pageIndex;
      this.getApplications();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.page = this.pageIndex;
      this.getApplications();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.page = 0;
    this.getApplications();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.page = this.pageIndex;
    this.getApplications();
  }
}
