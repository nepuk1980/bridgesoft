import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

export interface Notification {
  notification: string;
  sourceIp: string;
  resource: string;
  resourceType: 'file' | 'folder' | '';
  targetUser: string;
  time: string;
}

@Component({
  selector: 'app-notificationpopup',
  imports: [
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    NgIf
  ],
  templateUrl: './notificationpopup.component.html',
  styleUrls: ['./notificationpopup.component.css']
})
export class NotificationpopupComponent implements OnInit {

  displayedColumns: string[] = ['notification', 'sourceIp', 'resource', 'targetUser', 'time'];
  dataSource = new MatTableDataSource<Notification>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    // Assign the passed notifications array to the table's dataSource
    if (this.data && this.data.notifications) {
      this.dataSource.data = this.data.notifications;
    }
  }
}