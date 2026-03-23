import { Component } from '@angular/core';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [
    InnerheaderComponent,
    RouterModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './audit-trail.component.html',
  styleUrl: './audit-trail.component.css',
})
export class AuditTrailComponent {
  // ✅ FULL JSON DATA
  originalData = [
    {
      requestId: '328362',
      userName: 'Mitchelle Shymhal',
      requestedBy: 'Christopher Williams',
      requestedDate: '2026-02-12',
      requestedTime: '17:09',
      status: 'Pending',
      accessList: [
        {
          type: 'folder',
          name: 'Employee Folder',
          app: 'File Share Permission Application',
          status: 'Complete',
        },
        {
          type: 'file',
          name: 'Mediclaim.xlsx',
          app: 'File Share Permission Application',
          status: 'Complete',
        },
      ],
    },
    {
      requestId: '322782',
      userName: 'Amit Tandon',
      requestedBy: 'Wanda Jackson',
      requestedDate: '2026-02-12',
      requestedTime: '17:09',
      status: 'Pending',
      accessList: [
        {
          type: 'folder',
          name: 'Employee Folder',
          app: 'File Share Permission Application',
          status: 'Complete',
        },
        {
          type: 'file',
          name: 'Mediclaim.xlsx',
          app: 'File Share Permission Application',
          status: 'Complete',
        },
      ],
    },
    {
      requestId: '322032',
      userName: 'John Brownlee',
      requestedBy: 'Amit Tandon',
      requestedDate: '2026-02-11',
      requestedTime: '16:21',
      status: 'Pending',
      accessList: [
        {
          type: 'file',
          name: 'Employee Benifits.xlsx',
          app: 'File Share Permission Application',
          status: 'Complete',
        },
        {
          type: 'file',
          name: 'Employee Insurance.xlsx',
          app: 'File Share Permission Application',
          status: 'Complete',
        },
      ],
    },
    {
      requestId: '329214',
      userName: 'Peter Carpenter',
      requestedBy: 'Jenna Jilton',
      requestedDate: '2026-02-12',
      requestedTime: '09:01',
      status: 'Pending',
      accessList: [
        {
          type: 'folder',
          name: 'Employee Devices',
          app: 'File Share Permission Application',
          status: 'Complete',
        },
        {
          type: 'file',
          name: 'Device Maintenance Expenditure.xlsx',
          app: 'File Share Permission Application',
          status: 'Complete',
        },
      ],
    },
  ];

  // ✅ Working Data
  dataSource = [...this.originalData];

  searchText = '';
  selectedFilter = '';
  selectedSort = '';

  // 🔍 Search
  applyFilter(value: string) {
    this.searchText = value.toLowerCase();
    this.filterData();
  }

  // 🔄 Filter + Sort
  filterData() {
    let data = [...this.originalData];

    // Search
    if (this.searchText) {
      data = data.filter(
        (item) =>
          item.userName.toLowerCase().includes(this.searchText) ||
          item.requestId.toLowerCase().includes(this.searchText),
      );
    }

    // Status Filter
    if (this.selectedFilter) {
      data = data.filter((item) => item.status === this.selectedFilter);
    }

    // Date Sort
    if (this.selectedSort === 'latest') {
      data.sort(
        (a, b) =>
          new Date(b.requestedDate).getTime() -
          new Date(a.requestedDate).getTime(),
      );
    } else if (this.selectedSort === 'oldest') {
      data.sort(
        (a, b) =>
          new Date(a.requestedDate).getTime() -
          new Date(b.requestedDate).getTime(),
      );
    }

    this.dataSource = data;
  }

  // 🔢 Count
  get filteredCount() {
    return this.dataSource.length;
  }

  get totalCount() {
    return this.originalData.length;
  }
  createSlug(userName: string): string {
    const fullName = `${userName} `;

    return fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  constructor(private router: Router) {}

  goToDetail(item: any) {
    this.router.navigate(['/audit-trail', item.requestId], {
      queryParams: { name: item.userName }, // 👈 breadcrumb uses this
    });
  }
}
