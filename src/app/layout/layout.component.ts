import { Component, inject, ViewChild } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';

import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { MatDialog } from '@angular/material/dialog';
import { NotificationpopupComponent } from '../shared/components/notificationpopup/notificationpopup.component';
import { filter } from 'rxjs';

// ✅ ADDED
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';
import { MatDividerModule } from '@angular/material/divider';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [
    RouterModule,
    RouterOutlet,
    RouterLink,
    MatBadgeModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    NgxSkeletonLoaderComponent,
    NgFor,
    NgIf,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',

  // ✅ ADDED
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              width: '100%',
              top: 0,
              left: 0,
            }),
          ],
          { optional: true },
        ),

        group([
          // ✅ IMPORTANT FIX

          query(
            ':leave',
            [
              animate(
                '500ms ease',
                style({
                  opacity: 0,
                  transform: 'translateX(-200px)',
                }),
              ),
            ],
            { optional: true },
          ),

          query(
            ':enter',
            [
              style({
                opacity: 0,
                transform: 'translateX(200px)',
              }),
              animate(
                '500ms ease',
                style({
                  opacity: 1,
                  transform: 'translateX(0)',
                }),
              ),
            ],
            { optional: true },
          ),
        ]),
      ]),
    ]),
  ],
})
export class LayoutComponent {
  private dialog = inject(MatDialog);
  @ViewChild('drawer') drawer!: MatSidenav;

  isDashboard = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;

        if (url === '/' || url === '/dashboard') {
          this.isDashboard = true;
          setTimeout(() => this.drawer.open());
        } else {
          this.isDashboard = false;
          setTimeout(() => this.drawer.close());
        }
      });
  }

  // ✅ ADDED
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  hidden = false;
  notification = 15;

  toggleBadgeVisibility() {
    this.hidden = true;
  }

  notifications = [
    {
      notification:
        'Bob Smith (EMP2371Y) logged in during off hours into file system',
      sourceIp: '103.25.45.210',
      resource: 'Fileshare Login',
      resourceType: '',
      targetUser: 'Bob Smith',
      time: '02 / 12 / 2026 12:21 PM',
    },
    {
      notification:
        'User Timothy Leet (EMP2391B) from HR requested for access in Legal File',
      sourceIp: '103.25.45.211',
      resource: 'Fileshare Legal File',
      resourceType: 'file',
      targetUser: 'Timothy Leet',
      time: '02 / 12 / 2026 09:22 AM',
    },
    {
      notification:
        'Multiple requests raised at the same time for a single user Michelle Saget (EMP2015C)',
      sourceIp: '103.25.45.212',
      resource: 'Fileshare Access',
      resourceType: 'folder',
      targetUser: 'Michelle Saget',
      time: '02 / 12 / 2026 07:13 AM',
    },
    {
      notification:
        'Unauthorised access for Vendor Policy detected by user Ben Smithson (EMP0932V)',
      sourceIp: '103.25.45.210',
      resource: 'Vendor Policy',
      resourceType: 'folder',
      targetUser: 'Ben Smithson',
      time: '02 / 11 / 2026 03:36 PM',
    },
    {
      notification:
        'Art Schuram (EMP2251Y) logged in during off hours into file system',
      sourceIp: '103.25.45.210',
      resource: 'Fileshare Login',
      resourceType: '',
      targetUser: 'Art Schuram',
      time: '02 / 11 / 2026 11:24 AM',
    },
    {
      notification:
        'Bob Smith (EMP2371Y) logged in during off hours into file system',
      sourceIp: '103.25.45.210',
      resource: 'Fileshare Login',
      resourceType: '',
      targetUser: 'Bob Smith',
      time: '02 / 12 / 2026 12:21 PM',
    },
    {
      notification:
        'User Timothy Leet (EMP2391B) from HR requested for access in Legal File',
      sourceIp: '103.25.45.211',
      resource: 'Fileshare Legal File',
      resourceType: 'file',
      targetUser: 'Timothy Leet',
      time: '02 / 12 / 2026 09:22 AM',
    },
    {
      notification:
        'Multiple requests raised at the same time for a single user Michelle Saget (EMP2015C)',
      sourceIp: '103.25.45.212',
      resource: 'Fileshare Access',
      resourceType: 'folder',
      targetUser: 'Michelle Saget',
      time: '02 / 12 / 2026 07:13 AM',
    },
    {
      notification:
        'Unauthorised access for Vendor Policy detected by user Ben Smithson (EMP0932V)',
      sourceIp: '103.25.45.210',
      resource: 'Vendor Policy',
      resourceType: 'folder',
      targetUser: 'Ben Smithson',
      time: '02 / 11 / 2026 03:36 PM',
    },
    {
      notification:
        'Art Schuram (EMP2251Y) logged in during off hours into file system',
      sourceIp: '103.25.45.210',
      resource: 'Fileshare Login',
      resourceType: '',
      targetUser: 'Art Schuram',
      time: '02 / 11 / 2026 11:24 AM',
    },
    {
      notification:
        'Bob Smith (EMP2371Y) logged in during off hours into file system',
      sourceIp: '103.25.45.210',
      resource: 'Fileshare Login',
      resourceType: '',
      targetUser: 'Bob Smith',
      time: '02 / 12 / 2026 12:21 PM',
    },
    {
      notification:
        'User Timothy Leet (EMP2391B) from HR requested for access in Legal File',
      sourceIp: '103.25.45.211',
      resource: 'Fileshare Legal File',
      resourceType: 'file',
      targetUser: 'Timothy Leet',
      time: '02 / 12 / 2026 09:22 AM',
    },
    {
      notification:
        'Multiple requests raised at the same time for a single user Michelle Saget (EMP2015C)',
      sourceIp: '103.25.45.212',
      resource: 'Fileshare Access',
      resourceType: 'folder',
      targetUser: 'Michelle Saget',
      time: '02 / 12 / 2026 07:13 AM',
    },
    {
      notification:
        'Unauthorised access for Vendor Policy detected by user Ben Smithson (EMP0932V)',
      sourceIp: '103.25.45.210',
      resource: 'Vendor Policy',
      resourceType: 'folder',
      targetUser: 'Ben Smithson',
      time: '02 / 11 / 2026 03:36 PM',
    },
    {
      notification:
        'Art Schuram (EMP2251Y) logged in during off hours into file system',
      sourceIp: '103.25.45.210',
      resource: 'Fileshare Login',
      resourceType: '',
      targetUser: 'Art Schuram',
      time: '02 / 11 / 2026 11:24 AM',
    },
  ];
  dataSource = [...this.notifications];
  openNotificationDialog() {
    this.dialog.open(NotificationpopupComponent, {
      width: '85.75rem',
      minWidth: '85.75rem',
      maxWidth: '100%',
      data: {
        title: 'Notifications',
        notifications: this.notifications,
      },
    });
  }

  handleNotificationClick() {
    this.toggleBadgeVisibility();
    this.openNotificationDialog();
  }
}
