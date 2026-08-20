import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { delay } from 'rxjs/operators';

import { IgapiService } from '../../services/igapi.service';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../services/session.service';
import { getInitialUrl } from '../../sso-url';

export interface ValidateUserResponse {
  success: boolean;
  authenticated?: boolean;
  message?: string;
  IG_URL?: string;
}

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent implements OnInit, OnDestroy {
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

  // Keep the loading screen visible briefly before hitting validate-user.
  private readonly validateUserDelayMs = 0;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(IgapiService);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);

  ngOnInit(): void {
    this.startMessageRotation();

    const { launchCode, fasmSessionId, user } = this.resolveLaunchValues();

    // On project load, directly hit the validate-user API with the values
    // parsed from the browser URL. Any failure falls back to validateTokens
    // via the existing logic.
    this.validateSession(user, launchCode, fasmSessionId);
  }

  /**
   * Resolve the SSO values (launch_code / fasm_session_id / user) from the
   * browser URL. Parses every URL part that may carry them.
   */
  private resolveLaunchValues(): { launchCode: string; fasmSessionId: string; user: string } {
    const values = { launchCode: '', fasmSessionId: '', user: '' };

    // 1. Parse every URL part that may carry the SSO values. The captured
    //    initial URL is the original one, before any navigation redirects.
    const sources = [
      getInitialUrl(),                               // original full URL at bootstrap
      this.route.snapshot.paramMap.get('payload'),   // /launch/launch_code=..+user=..
      window.location.pathname,                      // raw pathname
      window.location.search,                        // raw query string (?..)
      window.location.hash,                          // hash (#..)
    ];

    for (const source of sources) {
      if (!source) {
        continue;
      }
      const parsed = this.parsePathValues(source);
      if (parsed) {
        values.launchCode = values.launchCode || parsed.launchCode;
        values.fasmSessionId = values.fasmSessionId || parsed.fasmSessionId;
        values.user = values.user || parsed.user;
      }
    }

    // 2. Angular-decoded query params (?launch_code=..&user=..).
    const query = this.route.snapshot.queryParamMap;
    values.launchCode = values.launchCode || query.get('launch_code') || '';
    values.fasmSessionId = values.fasmSessionId || query.get('fasm_session_id') || '';
    values.user = values.user || query.get('user') || '';

    // 3. Query-string corruption: '+' becomes ' ' inside query values, e.g.
    //    ?launch_code=abc+user=B1PC -> "launch_code=abc user=B1PC". Extract it.
    if (!values.user && values.launchCode.indexOf(' user=') !== -1) {
      const idx = values.launchCode.indexOf(' user=');
      values.user = values.launchCode.slice(idx + 6);
      values.launchCode = values.launchCode.slice(0, idx);
    }

    console.log('🔗 SSO URL:', getInitialUrl());
    console.log('🎯 current location:', window.location.href);
    console.log('📦 resolved SSO values:', values);

    return values;
  }

  /**
   * Parse the SSO payload that FASM/IG appends to the URL. Values are read
   * from the URL only (no launch API is called), in the form:
   *   /launch/launch_code="<code>"+user="<user>"
   *   /launch/fasm_session_id="<session>"+user="<user>"
   * Works on route params and on the raw pathname / query string / hash.
   */
  private parsePathValues(input: string | null): { launchCode: string; fasmSessionId: string; user: string } | null {
    if (!input) {
      return null;
    }

    const result = { launchCode: '', fasmSessionId: '', user: '' };
    let found = false;

    // Pre-decode the input so fully-encoded URLs work too
    // (e.g. launch_code%3D%22hskjdhfk%22%2Buser%3D%22B1PC%22).
    let decoded = input;
    try {
      decoded = decodeURIComponent(input);
    } catch {
      // keep the raw input if it is not properly encoded
    }

    // Split on '+' or '&' only when it precedes a known key (values may contain them).
    const segments = decoded.split(/[+&](?=(?:launch_code|fasm_session_id|user)=)/i);

    for (const segment of segments) {
      const eq = segment.indexOf('=');
      if (eq === -1) {
        continue;
      }

      // Key is the text after the last '/' (handles the "/launch/" path prefix),
      // with any leading '?' or '#' (query/hash prefixes) stripped.
      let rawKey = segment.slice(0, eq);
      const slashIdx = rawKey.lastIndexOf('/');
      rawKey = slashIdx === -1 ? rawKey : rawKey.slice(slashIdx + 1);
      const key = rawKey.replace(/^[?#]+/, '').trim().toLowerCase();

      let value = segment.slice(eq + 1).trim();
      try {
        value = decodeURIComponent(value);
      } catch {
        // keep the raw value if it is not properly encoded
      }

      // Strip surrounding double or single quotes: launch_code="hskjdhfk"
      if (value.length >= 2) {
        const first = value[0];
        const last = value[value.length - 1];
        if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
          value = value.slice(1, -1).trim();
        }
      }

      if (!value) {
        continue;
      }

      if (key === 'launch_code') {
        result.launchCode = value;
        found = true;
      } else if (key === 'fasm_session_id') {
        result.fasmSessionId = value;
        found = true;
      } else if (key === 'user') {
        result.user = value;
        found = true;
      }
    }

    return found ? result : null;
  }

  /**
   * Flow: UI -> POST /api/auth/validate-user -> GET /api/tokens/validateTokens.
   * The spinner stays visible until validateTokens returns success:true.
   *
   * The payload is built directly from the values parsed out of the browser
   * URL (launch_code / fasm_session_id / user) — no localStorage is used.
   */
  private validateSession(user: string, launchCode: string, sessionId: string): void {
    this.loading = true;
    this.errorMessage = '';

    const payload: any = { user };
    if (launchCode) {
      console.log('launch', launchCode);
      payload.launch_code = launchCode;
    } else if (sessionId) {
      console.log('storedSessionId', sessionId);
      payload.fasm_session_id = sessionId;
    }

    console.log('🔎 validate-user payload:', payload);

    this.api
      .post<ValidateUserResponse>('auth/validate-user', payload)
      .pipe(delay(this.validateUserDelayMs))
      .subscribe({
        next: (res) => {
          console.log('✅ validate-user response:', res);
          if (res && this.authService.isSuccess(res.success) && this.authService.isSuccess(res.authenticated)) {
            // Store the session response into browser storage (backup data)
            this.authService.persistSessionData(res);

            // Persist tokens + capture the session cookies the server just set
            this.authService.persistAuthResponse(res);
            this.authService.syncTokensFromCookies();

            // validate-user succeeded -> hit validate-token.
            this.validateTokensAndFinish();
          } else {
            // authenticated: false (e.g. no valid launch_code / fasm_session_id)
            console.warn('⛔ validate-user rejected, falling back to validateTokens:', res?.message);
            this.validateTokensAndFinish();
          }
        },
        error: (err) => {
          // HTTP 401 -> no IG-issued launch_code / fasm_session_id available.
          console.warn('⛔ validate-user failed, falling back to validateTokens:', err?.status, err?.message);
          this.validateTokensAndFinish();
        }
      });
  }

  /** GET /api/tokens/validateTokens; the spinner stays up until success:true. */
  private validateTokensAndFinish(): void {
    this.api.get<any>('tokens/validateTokens').subscribe({
      next: (res) => {
        console.log('✅ validateTokens response:', res);
        if (res && this.authService.isSuccess(res.success)) {
          // igUrl is only ever taken from the validateTokens API response.
          this.authService.setIgUrl(res.IG_URL);

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

  /** Navigate to the dashboard once the token validation succeeds. */
  private finishLogin(): void {
    const refreshToken = localStorage.getItem('refreshToken') || 'NOT FOUND';
    console.log('🔑 Refresh token after login:', refreshToken ? 'STORED' : refreshToken);
    this.loading = false;

    // On page refresh the browser URL is preserved (skipLocationChange: true),
    // so window.location.pathname still holds the original route the user was
    // on. Navigate back there instead of always going to the dashboard.
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/' && !currentPath.startsWith('/launch') && !currentPath.startsWith('/loading')) {
      console.log('🔄 Refresh detected – returning to:', currentPath);
      this.router.navigate([currentPath], { replaceUrl: true });
    } else {
      this.router.navigate(['/'], { replaceUrl: true });
    }
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
