import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { IgapiService } from '../services/igapi.service';
import { AuthService } from '../core/services/auth.service';
import { SessionService } from '../services/session.service';
import { PermissionService } from '../services/permission.service';

export interface PagePermissionGroup {
  permission: string;
  pagePermissions: string[];
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
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginObj = {
    username: '',
    password: ''
  };

  private router = inject(Router);
  private api = inject(IgapiService);
  private cookie = inject(CookieService);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private permissionService = inject(PermissionService);

  private setCookie(name: string, value: string, expiresDays = 1, path = '/'): void {
    // ngx-cookie-service uses positional args: name, value, expires, path, domain, secure, sameSite
    this.cookie.set(name, value, expiresDays, path, undefined, false, 'Lax');
  }

  onLogin(): void {
    const basicAuthHeader = btoa(`${this.loginObj.username}:${this.loginObj.password}`);

    // Store basicAuth in localStorage for the initial login/checkTokens flow.
    localStorage.setItem('basicAuth', basicAuthHeader);

    this.api.post<any>('auth/login', this.loginObj).subscribe({
      next: (res) => {
        // 1. Save refresh token received from login API in cookies
        if (res?.refreshToken) {
          this.setCookie('refreshToken', res.refreshToken, 7, '/');
        }

        if (res?.accessToken) {
          this.setCookie('accessToken', res.accessToken, 1);
        }

        if (res?.idToken) {
          this.setCookie('idToken', res.idToken, 1);
        }

        // 2. Keep basicAuth in localStorage only until token-based session is established.

        // 3. Perform checkTokens validation
        this.getcheckTokens();
      },
      error: (err) => {
        console.error('Login Error:', err);
        alert('Invalid credentials or server error.');
      }
    });
  }

  getcheckTokens(): void {
    this.api.get<any>('token/checkTokens').subscribe({
      next: (res) => {
        if (res && res.success) {

          // Store permissions List
          if (res.permissionsList) {
            this.permissionService.setPermissions(res.permissionsList);
          }

          // Trigger secondary authentication phase
          this.authService.login().subscribe({
            next: (newToken: string) => {
              if (newToken) {
                localStorage.setItem('logitoken', newToken);
                this.authService.setSession(newToken);
              }
              this.sessionService.startSessionTimer();
              this.router.navigate(['/'], { replaceUrl: true });
            },
            error: (err) => {
              console.error('Secondary login error:', err);
              this.sessionService.logoutAndRedirect();
            }
          });
        } else {
          this.sessionService.logoutAndRedirect();
        }
      },
      error: (err) => {
        console.error('checkTokens API error:', err);
        this.sessionService.logoutAndRedirect();
      }
    });
  }

  logout(): void {
    this.sessionService.logoutAndRedirect();
  }
}