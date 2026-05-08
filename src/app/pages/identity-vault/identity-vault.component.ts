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

  loading = false;

  // pagination
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

  ngOnInit(): void {
    this.getIdentityVaultData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  // ✅ API CALL WITH SERVER SEARCH + PAGINATION
  getIdentityVaultData(): void {
    this.loading = true;

    this.api
      .getlistofidentityvaults(
        this.pageIndex,
        this.pageSize,
        this.searchText?.trim() || '',
      )
      .subscribe({
        next: (res: any) => {
          const content = res?.content || [];

          const mappedData: Application[] = content.map((item: any) => ({
            id: item.id,
            firstName: item.firstName || '-',
            lastName: item.lastName || '-',
            email: item.email || '-',
            manager: item.manager || '-',
            roleSummary: item.assignedRoleSummary || '-',
            lastRefresh: item.lastModifiedDatetime
              ? new Date(item.lastModifiedDatetime).toLocaleString()
              : '-',
            riskScore: Number(item.riskScore || 0),
            link: '',
          }));

          // keep latest page data
          this.originalData = mappedData;

          // table data
          this.dataSource.data = mappedData;

          // backend pagination
          this.totalElements = res.totalElements || 0;
          this.totalPages = res.totalPages || 0;

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

          // apply local dropdown filters
          this.applyLocalFilters();

          this.generatePages();

          this.loading = false;
        },
        error: (err) => {
          console.error('API Error:', err);
          this.loading = false;
        },
      });
  }

  // ✅ LOCAL FILTERS ONLY
  applyLocalFilters(): void {
    let filteredData = [...this.originalData];

    // manager filter
    if (this.selectedCategory) {
      filteredData = filteredData.filter((item) =>
        item.manager
          ?.toLowerCase()
          .includes(this.selectedCategory.toLowerCase()),
      );
    }

    // risk filter
    if (this.selectedFilter) {
      filteredData = filteredData.filter((item) => {
        if (this.selectedFilter === 'low') {
          return item.riskScore < 30;
        }

        if (this.selectedFilter === 'medium') {
          return item.riskScore >= 30 && item.riskScore <= 60;
        }

        if (this.selectedFilter === 'high') {
          return item.riskScore > 60;
        }

        return true;
      });
    }

    this.dataSource.data = filteredData;
  }

  // ✅ SEARCH
  onSearch(): void {
    this.pageIndex = 0;
    this.getIdentityVaultData();
  }

  // ✅ FILTER CHANGE
  onFilterChange(): void {
    this.applyLocalFilters();
  }

  // ✅ PAGE NUMBERS
  generatePages(): void {
    const visiblePages = 3;

    if (this.totalPages <= 0) {
      this.pages = [1];
      return;
    }

    let start = Math.max(1, this.pageIndex + 1 - 1);
    let end = Math.min(this.totalPages, start + visiblePages - 1);

    if (end - start < visiblePages - 1) {
      start = Math.max(1, end - visiblePages + 1);
    }

    this.pages = [];

    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  // ✅ PAGINATION
  goToPage(page: number): void {
    this.pageIndex = page - 1;
    this.getIdentityVaultData();
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.getIdentityVaultData();
    }
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.getIdentityVaultData();
    }
  }

  firstPage(): void {
    this.pageIndex = 0;
    this.getIdentityVaultData();
  }

  lastPage(): void {
    this.pageIndex = this.totalPages - 1;
    this.getIdentityVaultData();
  }

  // ✅ RESET
  resetFilters(): void {
    this.searchText = '';
    this.selectedCategory = '';
    this.selectedFilter = '';

    this.pageIndex = 0;

    this.getIdentityVaultData();
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

  // export helpers
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
    return this.dataSource.data.map((item) => ({
      'First Name': item.firstName || '-',
      'Last Name': item.lastName || '-',
      'Email Id': item.email || '-',
      Manager: item.manager || '-',
      'Assigned Role Summary': item.roleSummary || '-',
      'Last Refresh': item.lastRefresh || '-',
      'Risk Score': item.riskScore ?? 0,
    }));
  }

  // exports
  downloadExcel(): void {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadExcel(
      data,
      `identity-vault-report_${timestamp}`,
      'Identity Vault',
    );
  }

  downloadCSV(): void {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadCSV(
      data,
      `identity-vault-report_${timestamp}`,
      'Identity Vault',
    );
  }

  downloadPDF(): void {
    const data = this.getExportData();
    const timestamp = this.getFormattedDateTime();

    this.reportService.downloadPDF(
      data,
      `identity-vault-report_${timestamp}`,
      'Identity Vault',
    );
  }
}
