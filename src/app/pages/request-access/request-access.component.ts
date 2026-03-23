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
  users = [
    {
      name: 'Christopher P. Williams',
      company: 'SalePoint',
      role: 'Application Admin',
      manager: 'Charles David',
      employeeType: 'Remote Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Mitchelle Shymhal',
      company: 'NCS',
      role: 'Application Admin',
      manager: 'Fiona Wilson',
      employeeType: 'Contract Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Amit Tandon',
      company: 'SalePoint',
      role: 'Application Admin',
      manager: 'Charles David',
      employeeType: 'Remote Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Wanda Jacksons',
      company: 'NCS',
      role: 'Application Admin',
      manager: 'Fiona Wilson',
      employeeType: 'Contract Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Milton P Watson',
      company: 'SalePoint',
      role: 'Application Admin',
      manager: 'Charles David',
      employeeType: 'Remote Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Norton P. Williams',
      company: 'SalePoint',
      role: 'Application Admin',
      manager: 'Charles David',
      employeeType: 'Remote Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Amanda Shymhal',
      company: 'NCS',
      role: 'Application Admin',
      manager: 'Fiona Wilson',
      employeeType: 'Contract Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Art Schurum',
      company: 'SalePoint',
      role: 'Application Admin',
      manager: 'Charles David',
      employeeType: 'Remote Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Melinda Kite',
      company: 'NCS',
      role: 'Application Admin',
      manager: 'Fiona Wilson',
      employeeType: 'Contract Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
    {
      name: 'Kristoff Jones',
      company: 'SalePoint',
      role: 'Application Admin',
      manager: 'Charles David',
      employeeType: 'Remote Worker',
      status: 'Active',
      profileImage: '/images/profile.png',
    },
  ];

  paginatedUsers: any[] = [];
  filteredUsers: any[] = [];

  pageSize = 5;
  pageIndex = 0;

  searchText = '';
  selectedFilter = '';

  totalPages = 0;
  pages: number[] = [];

  ngOnInit() {
    this.filteredUsers = this.users;
    this.calculatePages();
    this.updatePagedData();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter((user) => {
      const searchMatch =
        user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.company.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchText.toLowerCase());

      const filterMatch =
        !this.selectedFilter || user.company === this.selectedFilter;

      return searchMatch && filterMatch;
    });

    this.pageIndex = 0;
    this.calculatePages();
    this.updatePagedData();
  }

  calculatePages() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.generatePages();
  }

  generatePages() {
    const visible = 3;

    let start = Math.max(1, this.pageIndex + 1 - 1);
    let end = Math.min(this.totalPages, start + visible - 1);

    // adjust if near end
    if (end - start < visible - 1) {
      start = Math.max(1, end - visible + 1);
    }

    this.pages = [];
    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  updatePagedData() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  goToPage(p: number) {
    this.pageIndex = p - 1;
    this.updatePagedData();
    this.generatePages();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.updatePagedData();
      this.generatePages();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updatePagedData();
      this.generatePages();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.updatePagedData();
    this.generatePages();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.updatePagedData();
    this.generatePages();
  }
}
