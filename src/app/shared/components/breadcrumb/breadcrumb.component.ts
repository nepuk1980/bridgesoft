import { Component, OnInit } from '@angular/core';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSkeletonLoaderComponent],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css'],
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // ✅ Initial load
    this.breadcrumbs = this.buildBreadcrumbs(this.route.root);

    // ✅ On route change
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
      });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    // ✅ Add Dashboard only once
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Dashboard', url: '/' });
    }

    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');

      if (routeURL) {
        url += `/${routeURL}`;
      }

      let label = child.snapshot.data['breadcrumb'];

      // ✅ Dynamic breadcrumb
      if (child.snapshot.data['dynamic']) {
        const navState = history.state;
        const queryName = child.snapshot.queryParams['name'];

        let dynamicName = navState?.name || queryName;

        // fallback from URL slug
        if (!dynamicName) {
          const paramId = child.snapshot.params['id'];
          if (paramId) {
            dynamicName = paramId
              .split('-')
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1),
              )
              .join(' ');
          }
        }

        const showPrefix = child.snapshot.data['showPrefix'];

        if (showPrefix) {
          label = `${child.snapshot.data['breadcrumb']}: ${dynamicName}`;
        } else {
          label = dynamicName;
        }
      }

      // ✅ 🚀 FIX: Prevent duplicate + skip empty route duplicates
      if (label && breadcrumbs[breadcrumbs.length - 1]?.label !== label) {
        breadcrumbs.push({ label, url });
      }

      // ✅ Continue recursion (IMPORTANT: do not break loop early incorrectly)
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
