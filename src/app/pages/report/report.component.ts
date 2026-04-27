import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { RouterModule } from '@angular/router';
import { ExecutiveAuditReportsInterface } from '../../models/type';
import { ApiService } from '../../services/api.service'; // ✅ adjust path

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [MatCardModule, InnerheaderComponent, RouterModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  totalElements: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;

  searchText: string = '';
  selectedFilter: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAuditData();
  }

  loadAuditData(page: number = 0, size: number = this.pageSize): void {
    this.api
      .getexecutiveauditreport(this.searchText, this.selectedFilter, page, size)
      .subscribe({
        next: (res: ExecutiveAuditReportsInterface) => {
          // ✅ Only total count (as you wanted)
          this.totalElements = res.totalElements;

          // Optional: keep pagination state in sync
          this.pageIndex = page;
          this.pageSize = size;
        },
        error: (err) => console.error('API Error:', err),
      });
  }
}
