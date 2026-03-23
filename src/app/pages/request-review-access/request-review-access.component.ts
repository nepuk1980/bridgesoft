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

    this.dataSource = this.originalData.filter(
      (item) =>
        item.resourcePath.toLowerCase().includes(this.searchText) ||
        item.name.toLowerCase().includes(this.searchText) ||
        item.category.toLowerCase().includes(this.searchText),
    );
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
    // Remove from original data
    this.originalData = this.originalData.filter(
      (item) =>
        !(
          item.resourcePath === row.resourcePath &&
          item.name === row.name &&
          item.category === row.category
        ),
    );

    // Reapply filter to update table properly
    this.applyFilter(this.searchText);
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
}
