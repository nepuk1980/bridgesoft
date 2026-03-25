import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ApiService } from '../../services/api.service';

interface Filter {
  value: string;
  viewValue: string;
}

interface Application {
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
  // ✅ dynamic category list
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

  // ✅ master data (important)
  originalData: Application[] = [];

  searchText: string = '';
  selectedCategory: string = '';
  selectedFilter: string = '';

  // pagination
  page = 0;
  size = 100000;
  totalElements = 0;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.getIdentityVaultData();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // ✅ API CALL
  getIdentityVaultData() {
    this.api.getlistofidentityvaults(this.page, this.size).subscribe({
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

        // ✅ store original + display
        this.originalData = mappedData;
        this.dataSource.data = mappedData;

        // ✅ dynamic categories (managers)
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

        // pagination
        this.totalElements = res.totalElements;
        this.page = res.number;
        this.size = res.size;

        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('API Error:', err);
      },
    });
  }

  // ✅ FILTER + SEARCH
  applyFilters() {
    let filteredData = [...this.originalData];

    // category
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
        if (this.selectedFilter === 'low') return item.riskScore < 30;
        if (this.selectedFilter === 'medium')
          return item.riskScore >= 30 && item.riskScore <= 60;
        if (this.selectedFilter === 'high') return item.riskScore > 60;
        return true;
      });
    }

    // search
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filteredData = filteredData.filter((item) =>
        `${item.firstName} ${item.lastName} ${item.email} ${item.manager}`
          .toLowerCase()
          .includes(search),
      );
    }

    this.dataSource.data = filteredData;

    // reset paginator
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // pagination
  onPageChange(event: any) {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.getIdentityVaultData();
  }

  // reset filters
  resetFilters() {
    this.searchText = '';
    this.selectedCategory = '';
    this.selectedFilter = '';
    this.dataSource.data = this.originalData;
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
}
