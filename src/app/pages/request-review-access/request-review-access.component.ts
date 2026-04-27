import { Component } from '@angular/core';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-request-review-access',
  standalone: true,
  imports: [
    InnerheaderComponent,
    RouterModule,
    MatChipsModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    NgFor,
    NgIf,
    MatSnackBarModule,
  ],
  templateUrl: './request-review-access.component.html',
  styleUrl: './request-review-access.component.css',
})
export class RequestReviewAccessComponent {
  users: string[] = ['Mitchelle Shymhal', 'Amit Tandon'];

  remove(user: string) {
    this.users = this.users.filter((u) => u !== user);
  }

  displayedColumns: string[] = [
    'resourcePath',
    'name',
    'category',
    'access',
    'action',
  ];

  // 🔹 ORIGINAL DATA (full list)
  originalData = [
    {
      resourcePath:
        'https://bridgesoft.sharepoint.com/sites/humanresources/documents/humanresources',
      name: 'Employee',
      type: 'folder',
      category: 'PIL',
      access: { read: true, write: true, modify: true, fullControl: false },
    },
    {
      resourcePath:
        'https://bridgesoft.sharepoint.com/sites/medical/documents/humanresources',
      name: 'Mediclaims.xls',
      type: 'file',
      category: 'PDPB',
      access: { read: false, write: false, modify: false, fullControl: true },
    },
    {
      resourcePath:
        'https://bridgesoft.sharepoint.com/sites/medical/documents/humanresources',
      name: 'Mediclaims.xls',
      type: 'file',
      category: 'PDPB',
      access: { read: false, write: false, modify: false, fullControl: true },
    },
  ];

  // 🔹 FILTERED TABLE DATA
  dataSource = [...this.originalData];

  searchText: string = '';

  applyFilter(value: string) {
    this.searchText = value.toLowerCase();

    this.allFilteredData = this.originalData.filter(
      (item) =>
        item.resourcePath.toLowerCase().includes(this.searchText) ||
        item.name.toLowerCase().includes(this.searchText) ||
        item.category.toLowerCase().includes(this.searchText),
    );

    this.pageIndex = 0;

    this.totalElements = this.allFilteredData.length;
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalElements / this.pageSize),
    );

    this.applyPagination();
  }

  get filteredCount() {
    return this.dataSource.length;
  }

  get totalCount() {
    return this.originalData.length;
  }

  edit(row: any) {
    console.log('Edit', row);
  }

  delete(row: any) {
    this.originalData = this.originalData.filter(
      (item) =>
        !(
          item.resourcePath === row.resourcePath &&
          item.name === row.name &&
          item.category === row.category
        ),
    );

    // 🔥 IMPORTANT
    this.allFilteredData = [...this.originalData];

    this.totalElements = this.allFilteredData.length;
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalElements / this.pageSize),
    );

    this.pageIndex = 0;

    this.applyPagination();
  }
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  submit() {
    // Redirect to home
    this.router.navigate(['/']).then(() => {
      // Show success message AFTER navigation
      this.snackBar.open('Request Submitted Successfully', '', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      });
    });
  }
  ngOnInit() {
    this.allFilteredData = [...this.originalData];

    this.totalElements = this.allFilteredData.length;
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalElements / this.pageSize),
    );

    this.applyPagination();
  }
  // ngOnInit() {
  //   // if (history.state?.showSnack) {
  //   this.snackBar.open('Request Submitted Successfully', '', {
  //     duration: 300000,
  //     panelClass: ['success-snackbar'],
  //     horizontalPosition: 'center',
  //     verticalPosition: 'top',
  //   });

  //   // 🔥 IMPORTANT: clear state to prevent repeat
  //   // history.replaceState({}, '');
  //   // }
  // }

  // ✅ Pagination
  pageSize = 10;
  pageIndex = 0;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  paginatedUsers: any[] = [];
  filteredUsers: any[] = [];
  allFilteredData: any[] = [];

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
    this.applyPagination();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.applyPagination();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.applyPagination();
    }
  }

  firstPage() {
    this.pageIndex = 0;
    this.applyPagination();
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.applyPagination();
  }

  applyPagination() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    const paginated = this.allFilteredData.slice(start, end);

    this.dataSource = paginated;

    this.filteredUsers = this.allFilteredData;
    this.paginatedUsers = paginated;

    this.generatePages();
  }
}
