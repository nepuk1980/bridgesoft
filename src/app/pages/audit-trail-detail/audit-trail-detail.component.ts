import { Component } from '@angular/core';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-audit-trail-detail',
  standalone: true,
  imports: [InnerheaderComponent, CommonModule, MatTableModule],
  templateUrl: './audit-trail-detail.component.html',
  styleUrls: ['./audit-trail-detail.component.css'],
})
export class AuditTrailDetailComponent {
  userName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const nav = history.state;
    this.userName = nav?.name || 'User';
  }

  accessKeys: string[] = ['F', 'M', 'R', 'W', 'X', 'L'];

  data = {
    requestDetails: {
      accessRequestId: '328362',
      type: 'Access Request of a File Share Resource',
      requestee: 'Mitchelle Shymhal',
      requester: 'Administrator',
      completionStatus: 'Completed',
      priority: 'Normal',
      currentStep: 'End',
      requestDate: '02 / 12 / 2026 17:09 PM',
      completionDate: '02 / 12 / 2026 17:23 PM',
      verificationDate: '-',
      executionDate: 'Verifying',
    },

    requestItems: [
      {
        firstName: 'Christopher',
        lastName: 'Williams',
        operation: 'Set',
        application: 'File Share Application',
        value: 'Employee Folder',
        displayValue: 'Employee Folder',
        accessLevel: {
          F: true,
          M: true,
          R: true,
          W: true,
          X: false,
          L: false,
        },
        provisioningStatus: 'Finished',
      },
      {
        firstName: 'Christopher',
        lastName: 'Williams',
        operation: 'Set',
        application: 'File Share Application',
        value: 'Mediclaim.xlsx',
        displayValue: 'Mediclaim.xlsx',
        accessLevel: {
          F: true,
          M: true,
          R: true,
          W: true,
          X: true,
          L: true,
        },
        provisioningStatus: 'Finished',
      },
    ],
  };

  displayedColumns: string[] = [
    'operation',
    'application',
    'value',
    'displayValue',
    'accessLevel',
    'provisioningStatus',
  ];

  goToDetail(item: any) {
    const slug = this.createSlug(item.firstName, item.lastName);
    const fullName = `${item.firstName} ${item.lastName}`;

    this.router.navigate(['/identity-vault', slug], {
      queryParams: { name: fullName },
    });
  }

  createSlug(firstName: string, lastName: string): string {
    return `${firstName}-${lastName}`.toLowerCase();
  }
}
