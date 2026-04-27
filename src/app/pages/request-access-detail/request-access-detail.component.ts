import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SelectionModel } from '@angular/cdk/collections';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-request-access-detail',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MatChipsModule,
    MatIconModule,
    NgFor,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './request-access-detail.component.html',
  styleUrl: './request-access-detail.component.css',
})
export class RequestAccessDetailComponent implements OnInit {
  users: string[] = ['Mitchelle Shymhal', 'Amit Tandon'];

  displayedColumns: string[] = ['path', 'name', 'category', 'access'];

  selection = new SelectionModel<any>(true, []);

  searchText: string = '';
  selectedCategory: string = '';
  selectedType: string = '';

  categories: string[] = [];
  types: string[] = []; // ✅ dynamic types

  RESOURCE_DATA = [
    {
      path: 'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
      name: 'Employee',
      type: 'folder',
      category: 'PIL',
      access: {
        fullControl: false,
        modify: false,
        readExecute: false,
        listFolder: false,
        read: false,
        write: false,
      },
    },
    {
      path: 'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
      name: 'Human Resources.xls',
      type: 'file',
      category: 'HIPAA',
      access: {
        fullControl: false,
        modify: false,
        readExecute: false,
        listFolder: false,
        read: false,
        write: false,
      },
    },
    {
      path: 'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
      name: 'Mediclaims.xls',
      type: 'file',
      category: 'PDPB',
      access: {
        fullControl: false,
        modify: false,
        readExecute: false,
        listFolder: false,
        read: false,
        write: false,
      },
    },
    {
      path: 'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
      name: 'Insurance Data',
      type: 'folder',
      category: 'GDPR',
      access: {
        fullControl: true,
        modify: false,
        readExecute: false,
        listFolder: false,
        read: false,
        write: false,
      },
    },
    {
      path: 'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
      name: 'Travel Data',
      type: 'folder',
      category: 'SOC 2',
      access: {
        fullControl: false,
        modify: false,
        readExecute: false,
        listFolder: false,
        read: false,
        write: false,
      },
    },
  ];

  dataSource = [...this.RESOURCE_DATA];

  ngOnInit() {
    // ✅ dynamic categories
    this.categories = [...new Set(this.RESOURCE_DATA.map((d) => d.category))];

    // ✅ dynamic types (folder/file)
    this.types = [...new Set(this.RESOURCE_DATA.map((d) => d.type))];
    this.applyFilter();
  }

  applyFilter() {
    let filtered = this.RESOURCE_DATA.filter((item) => {
      const matchesSearch =
        !this.searchText ||
        item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.path.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesCategory =
        !this.selectedCategory || item.category === this.selectedCategory;

      const matchesType = !this.selectedType || item.type === this.selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });

    // ✅ TOTAL CALCULATION FIRST
    this.totalElements = filtered.length;
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalElements / this.pageSize),
    );

    // ✅ SAFE PAGE INDEX
    if (this.pageIndex > this.totalPages - 1) {
      this.pageIndex = this.totalPages - 1;
    }
    if (this.pageIndex < 0) {
      this.pageIndex = 0;
    }

    // ✅ PAGINATION SLICE
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    this.dataSource = filtered.slice(start, end);

    // ✅ KEEP FOR UI (if used)
    this.filteredUsers = filtered;
    this.paginatedUsers = this.dataSource;

    this.generatePages();
    this.selection.clear();
  }

  remove(user: string) {
    this.users = this.users.filter((u) => u !== user);
  }

  isAllSelected(): boolean {
    return (
      this.dataSource.length > 0 &&
      this.selection.selected.length === this.dataSource.length
    );
  }

  isIndeterminate(): boolean {
    return (
      this.selection.selected.length > 0 &&
      this.selection.selected.length < this.dataSource.length
    );
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.dataSource);
  }

  toggleRow(row: any) {
    this.selection.toggle(row);
  }

  submit() {
    console.log('Selected Rows:', this.selection.selected);
  }

  // ✅ Pagination
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  paginatedUsers: any[] = [];
  filteredUsers: any[] = [];

  // ✅ PAGINATION UI CALCULATION
  generatePages() {
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

  // ✅ PAGINATION ACTIONS
  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.applyFilter();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.applyFilter();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.applyFilter();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.applyFilter();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.applyFilter();
  }
}
