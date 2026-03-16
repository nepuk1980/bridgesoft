import { Component,inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import {   MatBadgeModule } from '@angular/material/badge';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { MatDialog } from '@angular/material/dialog';
import { NotificationpopupComponent } from '../shared/components/notificationpopup/notificationpopup.component';


@Component({
  selector: 'app-layout',
  imports: [
     RouterOutlet,
    RouterLink,
    MatBadgeModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    NgxSkeletonLoaderComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private dialog = inject(MatDialog);


 hidden = false;

toggleBadgeVisibility() {
  this.hidden = true;
}
notifications = [
  {
    notification: 'Bob Smith (EMP2371Y) logged in during off hours into file system',
    sourceIp: '103.25.45.210',
    resource: 'Fileshare Login',
    resourceType: '',
    targetUser: 'Bob Smith',
    time: '02 / 12 / 2026 12:21 PM'
  },
  {
    notification: 'User Timothy Leet (EMP2391B) from HR requested for access in Legal File',
    sourceIp: '103.25.45.211',
    resource: 'Fileshare Legal File',
    resourceType: 'file',
    targetUser: 'Timothy Leet',
    time: '02 / 12 / 2026 09:22 AM'
  },
  {
    notification: 'Multiple requests raised at the same time for a single user Michelle Saget (EMP2015C)',
    sourceIp: '103.25.45.212',
    resource: 'Fileshare Access',
    resourceType: 'folder',
    targetUser: 'Michelle Saget',
    time: '02 / 12 / 2026 07:13 AM'
  },
  {
    notification: 'Unauthorised access for Vendor Policy detected by user Ben Smithson (EMP0932V)',
    sourceIp: '103.25.45.210',
    resource: 'Vendor Policy',
    resourceType: 'folder',
    targetUser: 'Ben Smithson',
    time: '02 / 11 / 2026 03:36 PM'
  },
  {
    notification: 'Art Schuram (EMP2251Y) logged in during off hours into file system',
    sourceIp: '103.25.45.210',
    resource: 'Fileshare Login',
    resourceType: '',
    targetUser: 'Art Schuram',
    time: '02 / 11 / 2026 11:24 AM'
  },
  {
    notification: 'Bob Smith (EMP2371Y) logged in during off hours into file system',
    sourceIp: '103.25.45.210',
    resource: 'Fileshare Login',
    resourceType: '',
    targetUser: 'Bob Smith',
    time: '02 / 12 / 2026 12:21 PM'
  },
  {
    notification: 'User Timothy Leet (EMP2391B) from HR requested for access in Legal File',
    sourceIp: '103.25.45.211',
    resource: 'Fileshare Legal File',
    resourceType: 'file',
    targetUser: 'Timothy Leet',
    time: '02 / 12 / 2026 09:22 AM'
  },
  {
    notification: 'Multiple requests raised at the same time for a single user Michelle Saget (EMP2015C)',
    sourceIp: '103.25.45.212',
    resource: 'Fileshare Access',
    resourceType: 'folder',
    targetUser: 'Michelle Saget',
    time: '02 / 12 / 2026 07:13 AM'
  },
  {
    notification: 'Unauthorised access for Vendor Policy detected by user Ben Smithson (EMP0932V)',
    sourceIp: '103.25.45.210',
    resource: 'Vendor Policy',
    resourceType: 'folder',
    targetUser: 'Ben Smithson',
    time: '02 / 11 / 2026 03:36 PM'
  },
  {
    notification: 'Art Schuram (EMP2251Y) logged in during off hours into file system',
    sourceIp: '103.25.45.210',
    resource: 'Fileshare Login',
    resourceType: '',
    targetUser: 'Art Schuram',
    time: '02 / 11 / 2026 11:24 AM'
  },
  {
    notification: 'Bob Smith (EMP2371Y) logged in during off hours into file system',
    sourceIp: '103.25.45.210',
    resource: 'Fileshare Login',
    resourceType: '',
    targetUser: 'Bob Smith',
    time: '02 / 12 / 2026 12:21 PM'
  },
  {
    notification: 'User Timothy Leet (EMP2391B) from HR requested for access in Legal File',
    sourceIp: '103.25.45.211',
    resource: 'Fileshare Legal File',
    resourceType: 'file',
    targetUser: 'Timothy Leet',
    time: '02 / 12 / 2026 09:22 AM'
  },
  {
    notification: 'Multiple requests raised at the same time for a single user Michelle Saget (EMP2015C)',
    sourceIp: '103.25.45.212',
    resource: 'Fileshare Access',
    resourceType: 'folder',
    targetUser: 'Michelle Saget',
    time: '02 / 12 / 2026 07:13 AM'
  },
  {
    notification: 'Unauthorised access for Vendor Policy detected by user Ben Smithson (EMP0932V)',
    sourceIp: '103.25.45.210',
    resource: 'Vendor Policy',
    resourceType: 'folder',
    targetUser: 'Ben Smithson',
    time: '02 / 11 / 2026 03:36 PM'
  },
  {
    notification: 'Art Schuram (EMP2251Y) logged in during off hours into file system',
    sourceIp: '103.25.45.210',
    resource: 'Fileshare Login',
    resourceType: '',
    targetUser: 'Art Schuram',
    time: '02 / 11 / 2026 11:24 AM'
  }
];
    openNotificationDialog() {
    this.dialog.open(NotificationpopupComponent, {
      width: '85.75rem',
      minWidth: '85.75rem',
      maxWidth: '100%',
      data: {
        title: 'Notifications',
        notifications: this.notifications
      }
    });
  }


    handleNotificationClick() {
  this.toggleBadgeVisibility();
  this.openNotificationDialog();
}


}
