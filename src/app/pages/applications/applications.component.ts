import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

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
  link:string;
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
    FormsModule,
    RouterModule,
    NgxSkeletonLoaderModule
  ],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.css'
})
export class ApplicationsComponent implements AfterViewInit {

  filters: Filter[] = [
    { value: 'filter-0', viewValue: 'File Share Permission' },
    { value: 'filter-1', viewValue: 'Access Control' },
    { value: 'filter-2', viewValue: 'User Role' },
  ];

  displayedColumns: string[] = [
    'name',
    'host',
    'type',
    'modified',
    'assigned',
  ];

  data: Application[] = [
    {
      name: 'File Share Permission',
      host: '',
      type: 'File Share Permission',
      modified: '02 / 12 / 2026 17:01 PM',
      assigned: 'Account, Group',
          link: '/applications/file-share-permission'
    },
    {
      name: 'Access Control',
      host: 'Server 1',
      type: 'Access Control',
      modified: '03 / 12 / 2026 12:00 PM',
      assigned: 'Admin',
      link: '/applications/access-control'
    },
    {
      name: 'User Role',
      host: 'Server 2',
      type: 'User Role',
      modified: '04 / 12 / 2026 10:30 AM',
      assigned: 'User',
      link: '/applications/user-role'
    },
    // you can keep adding more rows...
  ];

  dataSource = new MatTableDataSource<Application>(this.data);

  searchText: string = '';
  selectedFilter: string = '';

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // 🔍 Search
  applySearch() {
    this.dataSource.filterPredicate = (data: Application, filter: string) => {
      const combined = Object.values(data).join(' ').toLowerCase();
      return combined.includes(filter);
    };

    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  // 🔽 Dropdown filter
  applyDropdownFilter() {
    if (!this.selectedFilter) {
      this.dataSource.data = this.data;
      return;
    }

    this.dataSource.data = this.data.filter(item =>
      item.type.toLowerCase().includes(this.selectedFilter.toLowerCase())
    );
  }
}