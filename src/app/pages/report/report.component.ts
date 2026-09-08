import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    MatCardModule,
    InnerheaderComponent,
    RouterModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  // Report Counts
  executiveAuditCount: number = 0;
  disabledVaultsCount: number = 0;
  privilegedAccessCount: number = 0;

  // Filter & Search Defaults
  searchText: string = '';
  executiveEmail: string = '';
  selectedFilter: string = '';

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadDashboardMetrics();
  }

  loadDashboardMetrics(): void {
    forkJoin({
      executive: this.api.getexecutiveauditreport(this.searchText, this.executiveEmail, this.selectedFilter, 0, 1),
      disabledVaults: this.api.getlistofdisabledidentityvaults(this.searchText, this.selectedFilter, 0, 1),
      privilegedAccess: this.api.getprivilegedaccessreport(this.searchText, this.selectedFilter, 0, 1)
    }).subscribe({
      next: ({ executive, disabledVaults, privilegedAccess }) => {
        this.executiveAuditCount = executive?.totalElements ?? 0;
        this.disabledVaultsCount = (disabledVaults as any)?.totalElements ?? 0;
        this.privilegedAccessCount = (privilegedAccess as any)?.totalElements ?? 0;
      },
      error: (err) => console.error('Dashboard metrics fetch error:', err)
    });
  }
}