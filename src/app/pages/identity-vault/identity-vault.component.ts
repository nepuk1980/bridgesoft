import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ApiService } from '../../services/api.service';
import { ReportService } from '../../services/report.service';

interface Filter {
  value: string;
  viewValue: string;
}

interface Application {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  manager: string;
  roleSummary: string;
  lastRefresh: string;
  riskScore: number;
  link: string;
}

@Component({
  selector: 'app-identity-vault',
  standalone: true,
  imports: [
    CommonModule,
    InnerheaderComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    FormsModule,
    RouterModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './identity-vault.component.html',
  styleUrl: './identity-vault.component.css',
})
export class IdentityVaultComponent implements AfterViewInit, OnInit {
  categories: Filter[] = [];

  filters: Filter[] = [
    { value: 'low', viewValue: 'Low Risk (< 30)' },
    { value: 'medium', viewValue: 'Medium Risk (>= 30 && <= 60)' },
    { value: 'high', viewValue: 'High Risk (> 60)' },
  ];

  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'email',
    'manager',
    'roleSummary',
    'lastRefresh',
    'riskScore',
  ];

  dataSource = new MatTableDataSource<Application>([]);
  originalData: Application[] = [];

  searchText: string = '';
  selectedCategory: string = '';
  selectedFilter: string = '';
  selectedDownload: string = 'Download';

  // ✅ Custom Pagination
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private api: ApiService,
    private reportService: ReportService,
  ) {}

  ngOnInit() {
    this.getIdentityVaultData();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // ✅ API CALL
  getIdentityVaultData() {
    this.api.getlistofidentityvaults(0, 100000).subscribe({
      next: (res: any) => {
        const mappedData: Application[] = res.content.map((item: any) => ({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          manager: item.manager,
          roleSummary: item.assignedRoleSummary || '-',
          lastRefresh: new Date(item.lastModifiedDatetime).toLocaleString(),
          riskScore: Number(item.riskScore),
          link: '',
        }));

        this.originalData = mappedData;
        this.totalElements = mappedData.length;

        // categories
        this.categories = [
          ...new Map(
            mappedData.map((item) => [
              item.manager,
              {
                value: item.manager?.toLowerCase(),
                viewValue: item.manager,
              },
            ]),
          ).values(),
        ];

        // ✅ init pagination
        this.pageIndex = 0;
        this.totalPages = Math.ceil(mappedData.length / this.pageSize) || 1;

        this.updatePaginatedData(mappedData);
      },
      error: (err) => {
        console.error('API Error:', err);
      },
    });
  }

  // ✅ FILTER + SEARCH
  applyFilters() {
    let filteredData = [...this.originalData];

    if (this.selectedCategory) {
      filteredData = filteredData.filter((item) =>
        item.manager
          ?.toLowerCase()
          .includes(this.selectedCategory.toLowerCase()),
      );
    }

    if (this.selectedFilter) {
      filteredData = filteredData.filter((item) => {
        if (this.selectedFilter === 'low') return item.riskScore < 30;
        if (this.selectedFilter === 'medium')
          return item.riskScore >= 30 && item.riskScore <= 60;
        if (this.selectedFilter === 'high') return item.riskScore > 60;
        return true;
      });
    }

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filteredData = filteredData.filter((item) =>
        `${item.firstName} ${item.lastName} ${item.email} ${item.manager}`
          .toLowerCase()
          .includes(search),
      );
    }
    if (filteredData.length === 0) {
      this.pageIndex = 0;
    }

    this.totalPages = Math.ceil(filteredData.length / this.pageSize) || 1;

    if (this.pageIndex >= this.totalPages) {
      this.pageIndex = 0;
    }

    this.updatePaginatedData(filteredData);
  }

  // ✅ Pagination Slice
  updatePaginatedData(data: Application[]) {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    this.dataSource.data = data.slice(start, end);
    this.generatePages();
  }

  // ✅ Page Numbers
  generatePages() {
    const visible = 3;

    if (this.totalPages <= 0) {
      this.pages = [1]; // ✅ fallback
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

  // ✅ Pagination Actions
  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.applyFilters();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.applyFilters();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.applyFilters();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.applyFilters();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.applyFilters();
  }

  resetFilters() {
    this.searchText = '';
    this.selectedCategory = '';
    this.selectedFilter = '';

    this.pageIndex = 0;
    this.totalPages = Math.ceil(this.originalData.length / this.pageSize);

    this.updatePaginatedData(this.originalData);
  }

  // navigation
  createSlug(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

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

  private getExportData() {
    return this.originalData.map((item) => ({
      'First Name': item.firstName || '-',
      'Last Name': item.lastName || '-',
      'Email Id': item.email || '-',
      Manager: item.manager || '-',
      'Assigned Role Summary': item.roleSummary || '-',
      'Last Refresh': item.lastRefresh || '-',
      'Risk Score': item.riskScore ?? 0,
    }));
  }

  downloadExcel() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadExcel(
      data,
      `identity-vault-report_${timestamp}`,
      'Identity Vault',
    );
  }

  downloadCSV() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadCSV(
      data,
      `identity-vault-report_${timestamp}`,
      'Identity Vault',
    );
  }

  downloadPDF() {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();
    this.reportService.downloadPDF(
      data,
      `identity-vault-report_${timestamp}`,
      'Identity Vault',
    );
  }
}
