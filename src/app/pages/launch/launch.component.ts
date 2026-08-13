import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IgapiService } from '../../services/igapi.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { SessionService } from '../../services/session.service';

export interface ValidateUserResponse {
  success: boolean;
  authenticated?: boolean;
  message?: string;
  IG_URL?: string;
}

@Component({
  selector: 'app-launch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './launch.component.html',
  styleUrl: './launch.component.css',
})
export class LaunchComponent implements OnInit, OnDestroy {
  loading = true;
  errorMessage = '';

  currentMessage = '';
  messageIndex = 0;
  private messageTimer: ReturnType<typeof setInterval> | null = null;

  private readonly loadingMessages = [
    'Connecting to secure session...',
    'Verifying your credentials...',
    'Checking permissions...',
    'Preparing your workspace...',
    'Loading your dashboard...',
    'Almost there...',
  ];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(IgapiService);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private sessionService = inject(SessionService);

  ngOnInit(): void {
    this.startMessageRotation();
    this.route.queryParamMap.subscribe((params) => {
      const launchCode = params.get('launch_code') || '';
      const sessionId = params.get('fasm_session_id') || '';
      const user = params.get('user') || '';

      if (!user) {
        console.warn('⛔ Launch route missing user param.');
        this.loading = false;
        this.errorMessage = 'No valid launch session found. Please start again from IG.';
        return;
      }

      if (launchCode || sessionId) {
        // Values already in the route -> persist and validate.
        this.persistValues(user, launchCode, sessionId);
        this.validateSession(user, launchCode, sessionId);
      } else {
        // Post-login entry: fetch launch_code / fasm_session_id + user and add
        // them into the route, e.g. /launch?launch_code=...&user=...
        this.fetchLaunchValues(user);
      }
    });
  }

  private persistValues(user: string, launchCode: string, sessionId: string): void {
    localStorage.setItem('user', user);
    if (launchCode) {
      localStorage.setItem('launchCode', launchCode);
      localStorage.removeItem('fasmSessionId');
    } else if (sessionId) {
      localStorage.setItem('fasmSessionId', sessionId);
      localStorage.removeItem('launchCode');
    }
  }

  /**
   * Call the launch API to obtain a launch_code OR fasm_session_id + user, then
   * add them into the route so the URL shows the launch values.
   */
  private fetchLaunchValues(user: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.fasmLaunch(user).subscribe({
      next: (res: any) => {
        console.log('✅ fasm/launch response:', res);
        const launchCode = res?.launch_code || '';
        const sessionId = res?.fasm_session_id || '';
        const resolvedUser = res?.user || user;

        if (!launchCode && !sessionId) {
          this.loading = false;
          this.errorMessage = 'No launch session returned from the server.';
          return;
        }

        this.persistValues(resolvedUser, launchCode, sessionId);

        // Add the values into the route. The queryParamMap subscription above
        // re-emits with the launch_code / fasm_session_id and runs validation.
        const query: any = { user: resolvedUser };
        if (launchCode) {
          query.launch_code = launchCode;
        } else {
          query.fasm_session_id = sessionId;
        }

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: query,
          replaceUrl: true,
        });
      },
      error: (err) => {
        console.error('❌ fasm/launch API error:', err);
        this.loading = false;
        this.errorMessage = 'Unable to obtain a launch session. Please try again.';
      }
    });
  }

  /**
   * Flow: UI -> POST /api/auth/validate-user -> POST /api/tokens/validateTokens.
   * The spinner stays visible until validateTokens returns success:true.
   */
  private validateSession(user: string, launchCode: string, sessionId: string): void {
    this.loading = true;
    this.errorMessage = '';

    const payload: any = { user };
    if (launchCode) {
      payload.launch_code = launchCode;
    } else if (sessionId) {
      payload.fasm_session_id = sessionId;
    }

    this.api.post<ValidateUserResponse>('auth/validate-user', payload).subscribe({
      next: (res) => {
        console.log('✅ validate-user response:', res);
        if (res && this.authService.isSuccess(res.success) && this.authService.isSuccess(res.authenticated)) {
          // Store IG_URL as backup for any later backend failure fallbacks
          this.authService.setIgUrl(res.IG_URL);

          // Store the session response into browser storage (backup data)
          this.authService.persistSessionData(res);

          // Persist tokens + capture the session cookies the server just set
          this.authService.persistAuthResponse(res);
          this.authService.syncTokensFromCookies();

          // validate-user succeeded -> hit validate-token.
          this.validateTokensAndFinish(res?.IG_URL);
        } else {
          // authenticated: false (e.g. no valid launch_code / fasm_session_id)
          console.warn('⛔ validate-user rejected, falling back to validateTokens:', res?.message);
          this.validateTokensAndFinish(res?.IG_URL);
        }
      },
      error: (err) => {
        // HTTP 401 -> no IG-issued launch_code / fasm_session_id available.
        console.warn('⛔ validate-user failed, falling back to validateTokens:', err?.status, err?.message);
        this.validateTokensAndFinish(undefined);
      }
    });
  }

  /** GET /api/tokens/validateTokens; the spinner stays up until success:true. */
  private validateTokensAndFinish(igUrl?: string): void {
    this.api.get<any>('tokens/validateTokens').subscribe({
      next: (res) => {
        console.log('✅ validateTokens response:', res);
        if (res && this.authService.isSuccess(res.success)) {
          // Store IG_URL as backup for any later backend failure fallbacks
          this.authService.setIgUrl(res.IG_URL || igUrl);

          // Store permissions list
          if (res.permissionsList) {
            this.permissionService.setPermissions(res.permissionsList);
          }

          // Store the session response into browser storage (backup data)
          this.authService.persistSessionData(res);

          // Persist any tokens from validateTokens response
          this.authService.setTokensFromValidateResponse(res);
          this.authService.syncTokensFromCookies();

          // Mark the session as validated so the route guard won't re-hit
          // validateTokens on the immediate navigation to the dashboard.
          this.sessionService.markTokenValidated();

          this.finishLogin();
        } else {
          this.loading = false;
          this.authService.setIgUrl(res?.IG_URL);
          // success:false -> try to rotate the tokens via /api/tokens/refresh.
          this.sessionService.refreshTokens().subscribe({
            next: (refreshed) => {
              if (refreshed) {
                this.finishLogin();
              } else {
                // Valid user + valid tokens, but refresh rejected -> logout.
                console.warn('⛔ validateTokens ok but refresh rejected -> logging out.');
                this.sessionService.logoutAndRedirect();
              }
            },
            error: (err) => {
              console.error('validateTokens refresh fallback error:', err);
              this.sessionService.logoutAndRedirect();
            }
          });
        }
      },
      error: (err) => {
        console.error('validateTokens API error:', err);
        this.loading = false;
        this.authService.redirectToIgUrl();
      }
    });
  }

  /** Navigate to the dashboard without the secondary fasm auth/login call. */
  private finishLogin(): void {
    const refreshToken = localStorage.getItem('refreshToken') || 'NOT FOUND';
    console.log('🔑 Refresh token after login:', refreshToken ? 'STORED' : refreshToken);
    this.loading = false;
    this.router.navigate(['/'], { replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.stopMessageRotation();
  }

  /** Rotate the "realistic" status message while the spinner is visible. */
  private startMessageRotation(): void {
    this.showNextMessage();
    this.messageTimer = setInterval(() => this.showNextMessage(), 2500);
  }

  private stopMessageRotation(): void {
    if (this.messageTimer) {
      clearInterval(this.messageTimer);
      this.messageTimer = null;
    }
  }

  private showNextMessage(): void {
    this.currentMessage = this.loadingMessages[this.messageIndex % this.loadingMessages.length];
    this.messageIndex++;
  }
}
