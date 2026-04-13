import { Component } from '@angular/core';
import { InnerheaderComponent } from '../../shared/components/innerheader/innerheader.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alert',
  imports: [
    InnerheaderComponent,
    RouterModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  displayedColumns: string[] = [
    'altername',
    'description',
    'folders',
    'files',
    'users',
    'action',
  ];
  // 🔹 ORIGINAL DATA (full list)
  originalData = [
    {
      altername: 'Policy Violation HR',
      description:
        'This alter is triggered when some beyond the HR is trying to access the policies of HR',
      folders: '1',
      files: '17',
      users: '23',
    },
    {
      altername: 'Unauthorized Access Finance',
      description:
        'This alter is triggered when some beyond the Finance is trying to access the policies',
      folders: '2',
      files: '14',
      users: '13',
    },
  ];
  // 🔹 FILTERED TABLE DATA
  dataSource = [...this.originalData];

  edit(row: any) {
    console.log('Edit', row);
  }

  delete(row: any) {
    // Remove from original data
  }
  constructor(private router: Router) {}
}
