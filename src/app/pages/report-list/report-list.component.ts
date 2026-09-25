import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { MatCardModule } from '@angular/material/card';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { SessionManagerService } from '../../services/session-manager.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface ExecutiveAccount {
  name: string;
  type: string;
  email: string;
  records: number;
}

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    InnerheaderComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.css',
})
export class ReportListComponent implements OnInit {
  accounts: ExecutiveAccount[] = [];
  paginatedAccounts: ExecutiveAccount[] = [];
  isLoading = false;

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 8; // Set cards per page
  totalElements: number = 0;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(
    private api: ApiService,
    private sessionManager: SessionManagerService,
  ) { }

  ngOnInit(): void {
    this.loadExecutiveCards();
  }

  loadExecutiveCards(): void {
    this.isLoading = true;

    this.api
      .getexecutiveauditmetadata()
      .pipe(
        switchMap((metadata) => {
          if (!metadata || metadata.length === 0) {
            return of({ metadata: [], responses: [] });
          }

          const requests = metadata.map((item) =>
            this.api.getexecutiveauditreport('', item.email, '', 0, 1)
          );

          return forkJoin(requests).pipe(
            switchMap((responses) => of({ metadata, responses }))
          );
        })
      )
      .subscribe({
        next: ({ metadata, responses }) => {
          this.accounts = metadata.map((meta, index) => {
            const apiResponse = responses[index];
            const firstRecord = apiResponse?.content?.[0];

            return {
              name:
                meta.accountName ||
                firstRecord?.targetUserDisplayName ||
                meta.email.split('@')[0].replace(/\./g, ' '),
              type: meta.accountType || firstRecord?.accountType || 'Individual',
              email: meta.email,
              records: apiResponse?.totalElements || 0,
            };
          });

          this.totalElements = this.accounts.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          this.updatePagination();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching executive metadata or reports:', err);
          this.isLoading = false;
        },
      });
  }

  // --- Pagination Methods ---

  updatePagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedAccounts = this.accounts.slice(start, end);
    this.generatePageNumbers();
  }

  generatePageNumbers(): void {
    const visiblePages = 5;
    let startPage = Math.max(1, this.pageIndex + 1 - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    this.pages = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageIndex = page - 1;
      this.validateSessionOnAction();
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.validateSessionOnAction();
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.validateSessionOnAction();
      this.updatePagination();
    }
  }

  firstPage(): void {
    if (this.pageIndex !== 0) {
      this.pageIndex = 0;
      this.validateSessionOnAction();
      this.updatePagination();
    }
  }

  lastPage(): void {
    if (this.pageIndex !== this.totalPages - 1) {
      this.pageIndex = Math.max(0, this.totalPages - 1);
      this.validateSessionOnAction();
      this.updatePagination();
    }
  }

  /** Hit validateTokens on pagination change; logs out on an invalid session. */
  private validateSessionOnAction(): void {
    this.sessionManager.validateAndContinue().subscribe();
  }
} 