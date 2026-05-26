import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { MatCardModule } from '@angular/material/card';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
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
  isLoading = false;

  // The base list of executive emails you want to display cards for
  private executiveEmails: string[] = [
    'Greg.Anderson@allegiantair.com',
    'Laura.Overton@allegiantair.com',
    'Maury.Gallagher@allegiantair.com',
    'Michael.Broderick@allegiantair.com',
    'Robert.Goldberg@allegiantair.com',
    'Robert.Neal@allegiantair.com',
    'Tyler.Hollingsworth@allegiantair.com',
    'Drew.Wells@allegiantair.com',
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadExecutiveCards();
  }

  loadExecutiveCards(): void {
    this.isLoading = true;

    // 1. Map each email into an individual API HTTP request observable
    const requests = this.executiveEmails.map(
      (email) => this.api.getexecutiveauditreport('', email, '', 0, 1), // page=0, size=1 for speed since we only need totalElements
    );

    // 2. Fire all API calls in parallel and wait for them to resolve
    forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        this.accounts = this.executiveEmails.map((email, index) => {
          const apiResponse = responses[index];

          // Grab the first record returned by the filtered search to read its properties
          const firstRecord = apiResponse?.content?.[0];

          // Safe fallback variables if the API hasn't found any records for this specific email yet
          const fallbackName = email.split('@')[0].replace(/\./g, ' ');
          const accountType =
            firstRecord?.accountType === 'USER'
              ? 'Individual'
              : firstRecord?.accountType || 'Individual';

          return {
            // ✅ MAPS THE ORIGINAL FIELD DIRECTLY FROM THE API RESPONSE
            name: firstRecord?.targetUserDisplayName || fallbackName,
            type: firstRecord?.accountType || accountType,
            email: email,
            records: apiResponse?.totalElements || 0,
          };
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching executive audit counts:', err);
        this.isLoading = false;
      },
    });
  }
}
