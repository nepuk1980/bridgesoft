import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgFor, NgIf } from '@angular/common';

import { IdentityVaultResponseInterface } from '../../models/type';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-request-access',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './request-access.component.html',
  styleUrl: './request-access.component.css',
})
export class RequestAccessComponent implements OnInit {
  // ✅ keep same variable names used in HTML
  paginatedUsers: any[] = [];
  filteredUsers: any[] = [];
  roles: string[] = [];

  // ✅ Pagination
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  // ✅ Filters
  searchText = '';
  selectedFilter = '';

  selectedUsers: any[] = [];
  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  // ✅ MAIN API CALL
  fetchUsers() {
    this.api
      .getlistofidentityvaults(this.pageIndex, this.pageSize)
      .subscribe((res: IdentityVaultResponseInterface) => {
        const mappedUsers = (res.content || []).map((u: any) => ({
          id: u.id,
          namepass: `${u.firstName || ''}${u.lastName || ''}`,
          emailpass: u.email,
          name: `${u.firstName || ''} ${u.lastName || ''}`,
          company: u.company,
          role: u.job_title,
          manager: u.manager,
          employeeType: u.department || '-',
          status: 'Active',
          profileImage: '/images/profile.png',
        }));

        // ✅ extract unique roles dynamically
        this.roles = [
          ...new Set(mappedUsers.map((u) => u.role).filter(Boolean)),
        ];

        // ✅ apply filter based on role now
        this.filteredUsers = mappedUsers.filter((user: any) => {
          const searchMatch =
            user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
            user.company
              .toLowerCase()
              .includes(this.searchText.toLowerCase()) ||
            user.role.toLowerCase().includes(this.searchText.toLowerCase());

          const filterMatch =
            !this.selectedFilter || user.role === this.selectedFilter;

          return searchMatch && filterMatch;
        });

        this.paginatedUsers = this.filteredUsers;

        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;

        this.generatePages();
      });
  }

  // ✅ FILTER
  applyFilters() {
    this.pageIndex = 0;
    this.fetchUsers();
  }

  // ✅ PAGINATION UI CALCULATION
  generatePages() {
    const visible = 3;

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
    this.fetchUsers();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.fetchUsers();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.fetchUsers();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.fetchUsers();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.fetchUsers();
  }

  isSelected(user: any): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  toggleSelection(user: any, checked: boolean): void {
    if (checked) {
      const exists = this.selectedUsers.some((u) => u.id === user.id);
      if (!exists) {
        // create new array reference (better for change detection)
        this.selectedUsers = [...this.selectedUsers, user];
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    }
  }
}
