import { Component, inject, ViewChild } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

import { NgFor, NgIf } from '@angular/common';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';

import { NotificationpopupComponent } from '../shared/components/notificationpopup/notificationpopup.component';
import { ApiService } from '../services/api.service';
import { NotificationInterface } from '../models/type';

@Component({
  selector: 'app-layout',
  standalone: true,
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

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  isDashboard = true;

  hidden = false;

  // API DATA
  notifications: any[] = [];
  loadingNotifications = false;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;

        if (url === '/' || url === '/dashboard') {
          this.isDashboard = true;
          setTimeout(() => this.drawer?.open());
        } else {
          this.isDashboard = false;
          setTimeout(() => this.drawer?.close());
        }
      });

    this.getNotifications();
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  toggleBadgeVisibility() {
    this.hidden = true;
  }

  page = 0;
  size = 10;
  totalElements = 0;

  getNotifications() {
    this.loadingNotifications = true;

    this.api.getgetnotifications(this.page, this.size).subscribe({
      next: (res: NotificationInterface) => {
        this.notifications = res.content ?? [];
        this.totalElements = res.totalElements ?? 0;

        this.loadingNotifications = false;
      },
      error: (err) => {
        console.error('Notification API Error:', err);
        this.loadingNotifications = false;
      },
    });
  }

  get notificationCount(): number {
    return this.notifications.length;
  }

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
