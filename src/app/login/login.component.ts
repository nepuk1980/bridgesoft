import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IgapiService } from '../services/igapi.service';
import { AuthService } from '../core/services/auth.service';
import { SessionService } from '../services/session.service';

export interface PagePermissionGroup {
  permission: string;
  pagePermissions: string[];
}

export interface ValidateUserResponse {
  success: boolean;
  authenticated?: boolean;
  message?: string;
  IG_URL?: string;
}

export interface CheckTokensResponse {
  permissions: string[];
  role: string[];
  permissionsList: PagePermissionGroup[];
  success: boolean;
  isManager: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginObj = {
    username: '',
    password: ''
  };

  // True while authenticating (SSO launch / post-login redirect) -> spinner
  loading = false;
  errorMessage = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(IgapiService);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);

  ngOnInit(): void {
    // SSO entry: collect launch_code / fasm_session_id + user from the route and
    // authenticate against FASM via POST /api/auth/validate-user (per the flow
    // "Login: UI -> /validate-user -> ... -> cookies -> UI").
    this.route.queryParamMap.subscribe((params) => {
      const launchCode = params.get('launch_code') || '';
      const sessionId = params.get('fasm_session_id') || '';
      const user = params.get('user') || '';

      if ((!launchCode && !sessionId) || !user) {
        // No SSO params -> fall back to the manual credential form.
        return;
      }

      // Persist the values for later validate-token payloads.
      localStorage.setItem('user', user);
      if (launchCode) {
        localStorage.setItem('launchCode', launchCode);
        localStorage.removeItem('fasmSessionId');
      } else if (sessionId) {
        localStorage.setItem('fasmSessionId', sessionId);
        localStorage.removeItem('launchCode');
      }

      const payload: any = { user };
      if (sessionId) {
        payload.fasm_session_id = sessionId;
      } else if (launchCode) {
        payload.launch_code = launchCode;
      }

      this.validateUser(payload);
    });
  }

  /**
   * Flow: UI -> POST /api/auth/validate-user -> FASM (IG introspect + DB) -> cookies -> UI.
   * Success -> straight to the dashboard (route guard runs /validateTokens).
   * Failure -> navigate to the internal /login page (no external redirect).
   */
  private validateUser(payload: any): void {
    this.loading = true;
    this.errorMessage = '';

    // Cookie-only authentication - no Authorization header.
    this.api.post<ValidateUserResponse>('auth/validate-user', payload).subscribe({
      next: (res) => {
        this.loading = false;

        if (res && this.authService.isSuccess(res.success) && this.authService.isSuccess(res.authenticated)) {
          // Store IG_URL as backup for any later backend failure fallbacks
          this.authService.setIgUrl(res.IG_URL);

          // Store the login response into browser storage (backup data)
          this.authService.persistSessionData(res);

          // Persist tokens + capture the session cookies the server just set
          this.authService.persistAuthResponse(res);
          this.authService.syncTokensFromCookies();

          this.router.navigate(['/'], { replaceUrl: true });
        } else {
          // Authentication failed (expired / consumed / invalid launch code) -
          // stay inside the SPA, store IG_URL as backup and show the message.
          console.warn('⛔ User authentication failed:', res?.message);
          this.authService.setIgUrl(res?.IG_URL);
          this.errorMessage = res?.message || 'Authentication failed.';
        }
      },
      error: (err) => {
        console.error('❌ validate-user API error:', err);
        this.loading = false;
        this.errorMessage = 'Unable to verify your session. Please try again.';
      }
    });
  }

  onLogin(): void {
    const basicAuthHeader = btoa(`${this.loginObj.username}:${this.loginObj.password}`);

    // Store basicAuth in localStorage for the initial login/checkTokens flow.
    localStorage.setItem('basicAuth', basicAuthHeader);

    this.api.post<any>('auth/login', this.loginObj).subscribe({
      next: (res) => {
        console.log('✅ Login response received:', res);
        this.authService.persistAuthResponse(res);

        // After login show the spinner launch screen, which fetches the
        // launch_code / fasm_session_id + user and adds them into the route.
        this.router.navigate(['/launch'], {
          queryParams: { user: this.loginObj.username },
          replaceUrl: true,
        });
      },
      error: (err) => {
        console.error('❌ Login Error:', err);
        alert('Invalid credentials or server error.');
      }
    });
  }

  logout(): void {
    this.sessionService.logoutAndRedirect();
  }
}
