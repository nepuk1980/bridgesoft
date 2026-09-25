import {
  Component,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule }
  from '@angular/material/button';

import { firstValueFrom }
  from 'rxjs';

import { IgapiService }
  from '../../services/igapi.service';

import { SessionManagerService }
  from '../../services/session-manager.service';

import { AuthService }
  from '../../core/services/auth.service';

@Component({
  selector:
    'app-session-expired-dialog',

  standalone: true,

  imports: [
    CommonModule,
    MatButtonModule
  ],

  templateUrl:
    './session-expired-dialog.component.html',

  styleUrls: [
    './session-expired-dialog.component.scss'
  ]
})
export class SessionExpiredDialogComponent {

  public checking = false;
  private authService = inject(AuthService);
  private api = inject(IgapiService);
  constructor(
    private dialogRef:
      MatDialogRef<SessionExpiredDialogComponent>,

    private session:
      SessionManagerService
  ) {}

  async onLogin(): Promise<void> {

    if (this.checking) {
      return;
    }

    this.checking = true;

    try {

      // ============================================================
      // 1. Validate the server-side session
      // ============================================================

      const validateResp: any =
        await firstValueFrom(
          this.api.get(
            'tokens/validateTokens'
          )
        );

      if (
        !validateResp?.success
      ) {

        console.warn(
          'Session validation failed.'
        );

        this.checking = false;

        this.dialogRef.close();

        await this.session.performLogout();

        return;
      }

      // ============================================================
      // 2. Restore IG URL/session metadata
      // ============================================================

      if (
        validateResp?.IG_URL
      ) {

        this.authService.setIgUrl(
          validateResp.IG_URL
        );
      }

      this.authService.persistSessionData(
        validateResp
      );

      // ============================================================
      // 3. Refresh the authentication tokens
      //
      // IMPORTANT:
      // Do NOT use tokens returned by validateResp after this point.
      // /tokens/refresh is responsible for issuing the NEW tokens.
      // ============================================================

      const refreshResp: any =
        await firstValueFrom(
          this.api.get(
            'tokens/refresh'
          )
        );

      // ============================================================
      // 4. Refresh failed
      // ============================================================

      if (
        refreshResp?.success !== true
      ) {

        console.warn(
          'Token refresh failed:',
          refreshResp
        );

        this.checking = false;

        this.dialogRef.close();

        await this.session.performLogout();

        return;
      }

      // ============================================================
      // 5. Refresh succeeded
      //
      // The backend has already sent the new cookies.
      // Do NOT overwrite them with validateResp tokens.
      // ============================================================

      this.checking = false;

      this.dialogRef.close();

      // Restart inactivity + refresh lifecycle.
      this.session.resumeAfterCheck();

      /*
       * The /tokens/refresh response may provide a new IG_URL.
       */
      if (
        refreshResp?.IG_URL
      ) {

        this.authService.setIgUrl(
          refreshResp.IG_URL
        );
      }

      return;

    } catch (error) {

      console.error(
        'Session recovery failed:',
        error
      );

      this.checking = false;

      this.dialogRef.close();

      await this.session.performLogout();
    }
  }
}