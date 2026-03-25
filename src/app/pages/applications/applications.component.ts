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
  ],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.css',
})
export class ApplicationsComponent implements OnInit, AfterViewInit {
  constructor(private api: ApiService) {}

  // ✅ Filters
  filters: Filter[] = [];

  displayedColumns: string[] = ['name', 'host', 'type', 'modified', 'assigned'];

  dataSource = new MatTableDataSource<Application>([]);
  originalData: Application[] = [];

  searchText: string = '';
  selectedFilter: string = '';

  isLoading = false; // ✅ loader

  // ✅ Pagination
  page = 0;
  size = 100000;
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
}
