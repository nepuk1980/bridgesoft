import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { RouterModule } from '@angular/router';
import { ExecutiveAuditReportsInterface } from '../../models/type';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [MatCardModule, InnerheaderComponent, RouterModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  // Pagination State
  totalElements: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;

  // Filter & Search State
  searchText: string = '';
  executiveEmail: string = ''; // ✅ Tracking state variable
  selectedFilter: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAuditData();
  }

  /**
   * Primary method to load audit data based on parameters
   * (Fixes compiler error around line 119)
   */
  loadAuditData(
    page: number = this.pageIndex,
    size: number = this.pageSize,
  ): void {
    this.api
      .getexecutiveauditreport(
        this.searchText,
        this.executiveEmail, // ✅ Insert this as the 2nd argument
        this.selectedFilter,
        this.pageIndex,
        this.pageSize,
      )
      .subscribe({
        next: (res: ExecutiveAuditReportsInterface) => {
          this.totalElements = res.totalElements;
          this.pageIndex = page;
          this.pageSize = size;
        },
        error: (err) => console.error('API Error:', err),
      });
  }

  /**
   * Example handler or secondary fetch hook inside your file
   * (Fixes compiler error around line 140)
   */
  fetchBulkDataExample(): void {
    // Passes an extra empty string down to cover the 5 expected arguments
    this.api
      .getexecutiveauditreport('', '', '', 0, 1000) // ✅ Added 3rd string literal
      .subscribe({
        next: (res: ExecutiveAuditReportsInterface) => {
          console.log('Bulk logs loaded:', res.totalElements);
        },
        error: (err) => console.error('Bulk Fetch Error:', err),
      });
  }

  /**
   * Alternative Pagination / Reload handler
   * (Fixes compiler error around line 229)
   */
  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.api
      .getexecutiveauditreport(
        this.searchText,
        this.executiveEmail, // ✅ Added 2nd argument
        this.selectedFilter,
        this.pageIndex,
        this.pageSize,
      )
      .subscribe({
        next: (res: ExecutiveAuditReportsInterface) => {
          this.totalElements = res.totalElements;
        },
        error: (err) => console.error('Pagination API Error:', err),
      });
  }
}
