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
    'ravi@sharepoint',
    'Greg.Anderson@allegiantair.com',
    'Laura.Overton@allegiantair.com',
    'Maury.Gallagher@allegiantair.com',
    'Michael.Broderick@allegiantair.com',
    'Robert.Goldberg@allegiantair.com',
    'Robert.Neal@allegiantair.com',
    'Tyler.Hollingsworth@allegiantair.com',
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

          // Format the name nicely from the email prefix
          const localPart = email.split('@')[0];
          const nameParts = localPart.split('.');
          const formattedName =
            nameParts.length > 1 ? nameParts.join(' ') : localPart;

          // Extract account type from the first record in content if available
          const firstRecord = apiResponse?.content?.[0];
          const accountType =
            firstRecord?.accountType === 'USER'
              ? 'Individual'
              : firstRecord?.accountType || 'Individual';

          return {
            name: formattedName,
            type: accountType,
            email: email,
            // SUCCESS: Grab totalElements directly from this specific user's filtered API response
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
