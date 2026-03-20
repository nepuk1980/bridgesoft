import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
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
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // ✅ FIX 1: Run once on load
    this.breadcrumbs = this.buildBreadcrumbs();

    // ✅ FIX 2: Then update on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs();
      });
  }

private buildBreadcrumbs(): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', url: '/' } // ✅ ALWAYS FIRST
  ];

  let url = '';
  let route = this.router.routerState.snapshot.root;

  while (route) {
    const routeURL = route.url.map(segment => segment.path).join('/');

    if (routeURL) {
      url += `/${routeURL}`;
    }

    const label = route.data['breadcrumb'];

    // ❌ Avoid duplicate Dashboard
    if (
      label &&
      label !== 'Dashboard' &&
      breadcrumbs[breadcrumbs.length - 1]?.label !== label
    ) {
      breadcrumbs.push({ label, url });
    }

    route = route.firstChild!;
  }

  return breadcrumbs;
}
}