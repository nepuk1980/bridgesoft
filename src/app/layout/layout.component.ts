import { Component, inject, ViewChild, OnInit } from '@angular/core';
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
import { MatMenuModule } from '@angular/material/menu';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PermissionService } from '../services/permission.service';
import { SessionService } from '../services/session.service';

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
    MatMenuModule,
    NgxSkeletonLoaderComponent,
    MatProgressSpinnerModule,
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
export class LayoutComponent implements OnInit {
  private dialog = inject(MatDialog);
  public permissionService = inject(PermissionService);
  private sessionService = inject(SessionService);

  @ViewChild('drawer') drawer!: MatSidenav;

  constructor(
    private api: ApiService,
    private router: Router,
  ) { }

  isDashboard = true;
  hidden = false;

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
  size = 20;
  totalElements = 0;

  getNotifications() {
    if (this.loadingNotifications) return;

    this.loadingNotifications = true;

    this.api.getgetnotifications(this.page, this.size).subscribe({
      next: (res: NotificationInterface) => {
        const newNotifications = res.content ?? [];
        this.notifications = [...this.notifications, ...newNotifications];
        this.totalElements = res.totalElements ?? 0;
        this.loadingNotifications = false;
      },
      error: (err) => {
        console.error('Notification API Error:', err);
        this.loadingNotifications = false;
      },
    });
  }

  onNotificationScroll(event: Event): void {
    const element = event.target as HTMLElement;

    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 10;

    const hasMore = this.notifications.length < this.totalElements;

    if (atBottom && hasMore && !this.loadingNotifications) {
      this.page++;
      this.getNotifications();
    }
  }

  get notificationCount(): string | number {
    return this.totalElements > 99 ? '99+' : this.totalElements;
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

  logout(): void {
    this.sessionService.logoutAndRedirect();
  }
}