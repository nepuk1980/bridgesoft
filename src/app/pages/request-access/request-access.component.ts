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

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IdentityVaultResponseInterface } from '../../models/type';
import { ApiService } from '../../services/api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './request-access.component.html',
  styleUrl: './request-access.component.css',
})
export class RequestAccessComponent implements OnInit {
  // ===============================
  // DATA
  // ===============================
  rawUsers: any[] = [];
  paginatedUsers: any[] = [];
  roles: string[] = [];

  // ===============================
  // PAGINATION
  // ===============================
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  // ===============================
  // FILTERS
  // ===============================
  searchText = '';
  selectedFilter = '';

  // ===============================
  // SELECTION
  // ===============================
  selectedUsers: any[] = [];

  // ===============================
  // CACHE
  // ===============================
  pageCache: {
    [key: string]: {
      users: any[];
      totalPages: number;
      totalElements: number;
    };
  } = {};

  isLoading = false;
  // ===============================
  // RXJS SEARCH
  // ===============================
  private searchSubject = new Subject<string>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.pageCache = {};
        this.fetchUsers();
      });

    this.fetchUsers();
  }

  // ===============================
  // FETCH USERS
  // ===============================
  fetchUsers() {
    const search = (this.searchText || '').trim();
    const filter = (this.selectedFilter || '').trim();

    const cacheKey = `${this.pageIndex}_${search}_${filter}`;

    // ===============================
    // CACHE HIT
    // ===============================
    if (this.pageCache[cacheKey]) {
      this.isLoading = false; // ✅ FIX: ensure loader stops on cache

      const cached = this.pageCache[cacheKey];
      this.rawUsers = cached.users;
      this.totalPages = cached.totalPages;
      this.totalElements = cached.totalElements;

      this.paginatedUsers = [...this.rawUsers];
      this.generatePages();
      return;
    }

    // ===============================
    // API CALL
    // ===============================
    this.isLoading = true;

    this.api
      .getlistofidentityvaults(this.pageIndex, this.pageSize, search, filter)
      .subscribe({
        next: (res: IdentityVaultResponseInterface) => {
          this.isLoading = false; // ✅ stop loader on success

          const mappedUsers = (res.content || []).map((u: any) => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`,
            emailpass: u.email,
            company: u.company,
            role: u.job_title,
            manager: u.manager,
            employeeType: u.department || '-',
            status: 'Active',
            profileImage: '/images/profile.png',
          }));

          this.rawUsers = mappedUsers;

          this.roles = [
            ...new Set(mappedUsers.map((u) => u.role).filter(Boolean)),
          ];

          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;

          this.pageCache[cacheKey] = {
            users: mappedUsers,
            totalPages: res.totalPages,
            totalElements: res.totalElements,
          };

          this.paginatedUsers = [...this.rawUsers];
          this.generatePages();
        },

        error: () => {
          this.isLoading = false; // ✅ FIX: stop loader on error
        },
      });
  }

  // ===============================
  // SEARCH
  // ===============================
  applySearch() {
    this.searchSubject.next(this.searchText);
  }

  // ===============================
  // FILTER
  // ===============================
  applyFilters() {
    this.pageIndex = 0;
    this.pageCache = {};
    this.fetchUsers();
  }

  // ===============================
  // PAGINATION
  // ===============================
  generatePages() {
    const visible = 3;

    let start = Math.max(1, this.pageIndex + 1);
    let end = Math.min(this.totalPages, start + visible - 1);

    if (end - start < visible - 1) {
      start = Math.max(1, end - visible + 1);
    }

    this.pages = [];

    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

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

  // ===============================
  // SELECTION
  // ===============================
  isSelected(user: any): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  toggleSelection(user: any, checked: boolean): void {
    if (checked) {
      if (!this.isSelected(user)) {
        this.selectedUsers = [...this.selectedUsers, user];
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    }
  }
}
