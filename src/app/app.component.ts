import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { SessionManagerService } from './services/session-manager.service';
import { SessionManagerComponent } from './session-manager/session-manager.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'bridgesoft';
  private router = inject(Router);
  private authService = inject(AuthService);
  private sessionManager = inject(SessionManagerService);

  /** Track whether the session manager has been started for the protected area */
  private sessionStarted = false;

  private readonly publicRoutePrefixes = ['/login', '/launch'];

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url: string = event.urlAfterRedirects || '';

        const isPublic = this.publicRoutePrefixes.some((p) => url.startsWith(p));

        if (!isPublic && !this.sessionStarted) {
          // Entering the protected layout -> start activity monitoring + auto-refresh
          this.sessionManager.start();
          this.sessionStarted = true;
        }

        if (isPublic) {
          this.sessionStarted = false;
        }
      });
  }
}
