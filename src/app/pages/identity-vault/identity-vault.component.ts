import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { CommonModule } from '@angular/common';

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
    NgxSkeletonLoaderModule
  ],
  templateUrl: './identity-vault.component.html',
  styleUrl: './identity-vault.component.css'
})
export class IdentityVaultComponent implements AfterViewInit {

  categories: Filter[] = [
    { value: 'bob jefferson', viewValue: 'Bob Jefferson' }
  ];

  filters: Filter[] = [
    { value: 'low', viewValue: 'Low Risk' },
    { value: 'medium', viewValue: 'Medium Risk' },
    { value: 'high', viewValue: 'High Risk' }
  ];

  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'email',
    'manager',
    'roleSummary',
    'lastRefresh',
    'riskScore'
  ];

data: Application[] = [
  {
    firstName: 'Christopher',
    lastName: 'Williams',
    email: 'chris.w@bridesoft.com',
    manager: 'Bob Jefferson',
    roleSummary: '',
    lastRefresh: '02 / 12 / 2026 17:11 PM',
    riskScore: 63
  },
  {
    firstName: 'Norton P',
    lastName: 'Sheperd',
    email: 'nortan.s@bridesoft.com',
    manager: 'Bob Jefferson',
    roleSummary: '',
    lastRefresh: '02 / 11 / 2026 09:12 AM',
    riskScore: 32
  },
  {
    firstName: 'Amanda',
    lastName: 'Bobbit',
    email: 'amanda.bobbit@bridesoft.com',
    manager: 'Bob Jefferson',
    roleSummary: '',
    lastRefresh: '02 / 08 / 2026 10:13 AM',
    riskScore: 32
  },
  {
    firstName: 'Prayag',
    lastName: 'Shah',
    email: 'paryag.s@bridesoft.com',
    manager: 'Bob Jefferson',
    roleSummary: '',
    lastRefresh: '02 / 08 / 2026 12:01 PM',
    riskScore: 32
  },
  {
    firstName: 'Gefforson',
    lastName: 'Michille',
    email: 'gefforson.mt@bridesoft.com',
    manager: 'Bob Jefferson',
    roleSummary: '',
    lastRefresh: '02 / 07 / 2026 13:23 PM',
    riskScore: 32
  }
];

  dataSource = new MatTableDataSource<Application>(this.data);

  searchText: string = '';
  selectedCategory: string = '';
  selectedFilter: string = '';

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // 🔥 MAIN FILTER METHOD (search + dropdowns combined)
  applyFilters() {
    let filteredData = [...this.data];

    // Category filter
    if (this.selectedCategory) {
      filteredData = filteredData.filter(item =>
        item.manager.toLowerCase().includes(this.selectedCategory)
      );
    }

    // Risk filter
    if (this.selectedFilter) {
      filteredData = filteredData.filter(item => {
        if (this.selectedFilter === 'low') return item.riskScore < 30;
        if (this.selectedFilter === 'medium') return item.riskScore >= 30 && item.riskScore <= 60;
        if (this.selectedFilter === 'high') return item.riskScore > 60;
        return true;
      });
    }

    // Search filter
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filteredData = filteredData.filter(item =>
        `${item.firstName} ${item.lastName} ${item.email} ${item.manager}`
          .toLowerCase()
          .includes(search)
      );
    }

    this.dataSource.data = filteredData;
  }
}