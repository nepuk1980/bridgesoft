import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { IgapiService } from '../../services/igapi.service';
import { AuthService } from '../../core/services/auth.service';
import { SessionManagerService } from '../../services/session-manager.service';

@Component({
  selector: 'app-session-expired-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './session-expired-dialog.component.html',
  styleUrls: ['./session-expired-dialog.component.css']
})
export class SessionExpiredDialogComponent {
  public checking = false;

  private dialogRef = inject(MatDialogRef<SessionExpiredDialogComponent>);
  private api = inject(IgapiService);
  private authService = inject(AuthService);
  private session = inject(SessionManagerService);

  async onLogin() {
    if (this.checking) return; // prevent duplicate clicks
    this.checking = true;

    try {
      const resp: any = await firstValueFrom(this.api.get('tokens/validateTokens'));

      if (this.authService.isSuccess(resp?.success)) {
        // validateTokens success:true -> hit the refreshTokens API.
        // Keep the Login button disabled and the dialog open while refreshing.
        const refreshResp: any = await firstValueFrom(this.api.get<any>(`tokens/refresh`));

        if (this.authService.isSuccess(refreshResp?.success)) {
          this.authService.persistAuthResponse(refreshResp);
          this.authService.syncAuthCookies();
          this.authService.syncTokensFromCookies();

          this.checking = false;
          this.dialogRef.close(true);
          this.session.resumeAfterCheck();
          return;
        }

        // refreshTokens success:false -> close the dialog and go to IG login.
        this.checking = false;
        this.dialogRef.close(false);
        await this.session.performLogout();
        return;
      }

      // validateTokens success:false -> navigate the user to the IG login page.
      this.checking = false;
      this.dialogRef.close(false);
      await this.session.performLogout();
    } catch (err) {
      // validateTokens / refreshTokens API failed -> navigate to the IG login page.
      console.error('validateTokens/refresh API error:', err);
      this.checking = false;
      this.dialogRef.close(false);
      await this.session.performLogout();
    }
  }
}
