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
    this.checking = true;
    try {
      const resp: any = await firstValueFrom(this.api.get('tokens/validateTokens'));
      if (this.authService.isSuccess(resp?.success)) {
        const refreshResp: any = await firstValueFrom(this.api.get<any>(`tokens/refresh`));

        this.checking = false;

        if (this.authService.isSuccess(refreshResp?.success)) {
          this.authService.persistAuthResponse(refreshResp);
          this.authService.syncAuthCookies();
          this.authService.syncTokensFromCookies();

          this.dialogRef.close(true);
          this.session.resumeAfterCheck();
          return;
        } else {
          this.dialogRef.close(false);
          await this.session.performLogout();
          return;
        }
      } else {
        // validateTokens success:false -> try to rotate the tokens via refresh.
        const refreshResp: any = await firstValueFrom(this.api.get<any>(`tokens/refresh`));

        this.checking = false;

        if (this.authService.isSuccess(refreshResp?.success)) {
          this.authService.persistAuthResponse(refreshResp);
          this.authService.syncAuthCookies();
          this.authService.syncTokensFromCookies();

          this.dialogRef.close(true);
          this.session.resumeAfterCheck();
          return;
        }

        this.dialogRef.close(false);
        await this.session.performLogout();
        return;
      }
    } catch (err) {
      console.error('checkTokens/refresh API error:', err);
      this.checking = false;
      this.dialogRef.close(false);
      await this.session.performLogout();
      return;
    }
  }
}
