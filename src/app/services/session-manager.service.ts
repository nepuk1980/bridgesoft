import { Injectable, NgZone, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  from,
  map,
  of,
  tap
} from 'rxjs';

import { firstValueFrom } from 'rxjs';

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { SessionExpiredDialogComponent }
  from '../session-manager/session-expired-dialog/session-expired-dialog.component';

import { AuthService }
  from '../core/services/auth.service';

import { IgapiService }
  from './igapi.service';


interface RefreshResult {
  rotated: boolean;
  stillValid: boolean;
  transientError?: boolean;
}


export type SessionState =
  'active' |
  'warning' |
  'expired';


@Injectable({
  providedIn: 'root'
})
export class SessionManagerService {

  // ================================================================
  // SERVICE STATE
  // ================================================================

  private started = false;

  private authService =
    inject(AuthService);

  private api =
    inject(IgapiService);


  // ================================================================
  // TIMERS
  // ================================================================

  private activityTimer!:
    ReturnType<typeof setTimeout>;

  private warningTimer!:
    ReturnType<typeof setTimeout>;

  private refreshTimer!:
    ReturnType<typeof setTimeout>;


  // ================================================================
  // ACTIVITY TRACKING
  // ================================================================

  private activityWindow: boolean[] = [];

  private readonly ACTIVITY_THROTTLE =
    5000;

  private lastActivityTick = 0;


  // ================================================================
  // WARNING / EXPIRED STATE
  // ================================================================

  private autoExtendedDuringWarning =
    false;

  private autoExtendedDuringExpired =
    false;

  private isExpiredDialogOpen =
    false;

  private logoutInProgress =
    false;


  // ================================================================
  // REFRESH REQUEST DEDUPLICATION
  // ================================================================

  private refreshInFlight:
    Promise<RefreshResult> | null = null;


  // ================================================================
  // VALIDATION REQUEST DEDUPLICATION
  //
  // IMPORTANT:
  // This is retained because existing FASM components and the
  // validation interceptor call validateAndContinue().
  //
  // It is NO LONGER automatically triggered from NavigationStart.
  // ================================================================

  private validateInFlight:
    Promise<boolean> | null = null;

  private lastValidate:
    {
      at: number;
      valid: boolean;
    } | null = null;

  private readonly VALIDATE_CACHE_MS =
    1000;


  // ================================================================
  // SESSION STATE
  // ================================================================

  public sessionState$ =
    new BehaviorSubject<SessionState>(
      'active'
    );

  public showWarning$ =
    new BehaviorSubject<boolean>(
      false
    );

  public isRefreshing$ =
    new BehaviorSubject<boolean>(
      false
    );


  // ================================================================
  // SESSION TIMINGS
  // ================================================================

  /**
   * 30 minutes inactivity.
   */
  private readonly INACTIVITY_LIMIT =
    30 * 60 * 1000;

  /**
   * 5 minute warning.
   */
  private readonly WARNING_DURATION =
    5 * 60 * 1000;

  /**
   * Background token refresh every 5 minutes.
   */
  private readonly REFRESH_INTERVAL =
    5 * 60 * 1000;


  // ================================================================
  // SESSION STORAGE
  // ================================================================

  private readonly ACTIVITY_WINDOW_KEY =
    'session-manager.activityWindow';

  private readonly LAST_ACTIVITY_KEY =
    'session-manager.lastActivityAt';

  private readonly WARNING_STARTED_KEY =
    'session-manager.warningStartedAt';

  private readonly STATE_KEY =
    'session-manager.state';


  // ================================================================
  // EVENT LISTENERS
  // ================================================================

  private activityListener =
    () => this.onActivity();

  private visibilityListener =
    () => this.recomputeFromElapsedTime();


  // ================================================================
  // CROSS TAB
  // ================================================================

  private syncChannel:
    BroadcastChannel | null = null;


  // ================================================================
  // CONSTRUCTOR
  // ================================================================

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private dialog: MatDialog
  ) {

    this.initActivityWindow();

    this.initCrossTabSync();

    /*
     * IMPORTANT:
     *
     * DO NOT call trackRouteChanges().
     *
     * We deliberately removed the automatic:
     *
     * NavigationStart
     *       ↓
     * validateAndContinue()
     *
     * pipeline because it created an additional session-validation
     * mechanism on top of the normal auth guard + session manager.
     */
  }


  // ================================================================
  // PUBLIC STATE
  // ================================================================

  public get loggingOut(): boolean {
    return this.logoutInProgress;
  }


  // ================================================================
  // ACTIVITY WINDOW
  // ================================================================

  private getWindowSize(): number {

    return Math.max(
      1,
      Math.ceil(
        this.INACTIVITY_LIMIT /
        this.REFRESH_INTERVAL
      )
    );
  }


  private saveActivityWindow(): void {

    sessionStorage.setItem(
      this.ACTIVITY_WINDOW_KEY,
      JSON.stringify(
        this.activityWindow
      )
    );
  }


  private initActivityWindow(): void {

    /*
     * Do not clear the entire sessionStorage.
     * Only remove keys owned by this service.
     */
    sessionStorage.removeItem(
      this.ACTIVITY_WINDOW_KEY
    );

    sessionStorage.removeItem(
      this.LAST_ACTIVITY_KEY
    );

    sessionStorage.removeItem(
      this.WARNING_STARTED_KEY
    );

    sessionStorage.removeItem(
      this.STATE_KEY
    );


    this.activityWindow =
      new Array(
        this.getWindowSize()
      ).fill(false);


    this.saveActivityWindow();
  }


  // ================================================================
  // SESSION START
  // ================================================================

  public start(): void {

    /*
     * Prevent repeated guard execution from creating
     * multiple timers and event listeners.
     */
    if (this.started) {

      this.recomputeFromElapsedTime();

      return;
    }


    this.started = true;


    this.attachListeners();


    if (
      !sessionStorage.getItem(
        this.LAST_ACTIVITY_KEY
      )
    ) {

      sessionStorage.setItem(
        this.LAST_ACTIVITY_KEY,
        String(Date.now())
      );
    }


    if (
      sessionStorage.getItem(
        this.STATE_KEY
      )
    ) {

      this.recomputeFromElapsedTime();

    } else {

      this.resetInactivityTimer();
    }


    this.scheduleNextRefresh();
  }


  // ================================================================
  // ACTIVITY LISTENERS
  // ================================================================

  private attachListeners(): void {

    [
      'mousemove',
      'keydown',
      'scroll',
      'click'
    ].forEach(
      eventName => {

        window.addEventListener(
          eventName,
          this.activityListener
        );

      }
    );


    document.addEventListener(
      'visibilitychange',
      this.visibilityListener
    );
  }


  // ================================================================
  // CROSS TAB SYNCHRONIZATION
  // ================================================================

  private initCrossTabSync(): void {

    if (
      typeof BroadcastChannel ===
      'undefined'
    ) {

      return;
    }


    try {

      this.syncChannel =
        new BroadcastChannel(
          'session-manager-sync'
        );


      this.syncChannel.onmessage =
        (event) => {

          if (
            event.data?.type ===
            'logout'
          ) {

            this.clearSession();

            this.router.navigate([
              '/login'
            ]);
          }

        };

    } catch (error) {

      console.error(
        'Failed to initialize BroadcastChannel:',
        error
      );

      this.syncChannel = null;
    }
  }


  // ================================================================
  // ACTIVITY
  // ================================================================

  private onActivity(): void {

    const now =
      Date.now();


    if (
      now -
      this.lastActivityTick <
      this.ACTIVITY_THROTTLE
    ) {

      return;
    }


    this.lastActivityTick =
      now;


    sessionStorage.setItem(
      this.LAST_ACTIVITY_KEY,
      String(now)
    );


    const lastIndex =
      Math.max(
        0,
        this.activityWindow.length - 1
      );


    this.activityWindow[
      lastIndex
    ] = true;


    this.saveActivityWindow();


    switch (
    this.sessionState$.value
    ) {

      case 'active':

        this.resetInactivityTimer();

        break;


      case 'warning':

        if (
          !this.autoExtendedDuringWarning
        ) {

          this.autoExtendedDuringWarning =
            true;

          void this.extendWindowDuringDialog();
        }

        break;


      case 'expired':

        if (
          !this.autoExtendedDuringExpired
        ) {

          this.autoExtendedDuringExpired =
            true;

          void this.extendWindowDuringDialog();
        }

        break;
    }
  }


  // ================================================================
  // EXTEND DURING DIALOG
  // ================================================================

  private async extendWindowDuringDialog(): Promise<void> {

    this.activityWindow =
      new Array(
        this.getWindowSize()
      ).fill(false);


    this.activityWindow[
      this.activityWindow.length - 1
    ] = true;


    this.saveActivityWindow();


    const {
      rotated,
      stillValid,
      transientError
    } = await this.attemptRefresh();


    if (
      !rotated &&
      !stillValid &&
      !transientError
    ) {

      await this.performLogout();
    }
  }


  // ================================================================
  // INACTIVITY TIMER
  // ================================================================

  private resetInactivityTimer(): void {

    clearTimeout(
      this.activityTimer
    );

    clearTimeout(
      this.warningTimer
    );


    this.sessionState$.next(
      'active'
    );

    this.showWarning$.next(
      false
    );


    sessionStorage.setItem(
      this.STATE_KEY,
      'active'
    );


    this.activityTimer =
      setTimeout(
        () => this.enterWarning(),
        this.INACTIVITY_LIMIT
      );
  }


  // ================================================================
  // WARNING
  // ================================================================

  private enterWarning(
    remainingDuration:
      number = this.WARNING_DURATION
  ): void {

    clearTimeout(
      this.activityTimer
    );

    clearTimeout(
      this.warningTimer
    );


    this.autoExtendedDuringWarning =
      false;


    this.sessionState$.next(
      'warning'
    );

    this.showWarning$.next(
      true
    );


    sessionStorage.setItem(
      this.STATE_KEY,
      'warning'
    );


    const elapsedAlready =
      this.WARNING_DURATION -
      remainingDuration;


    sessionStorage.setItem(
      this.WARNING_STARTED_KEY,
      String(
        Date.now() -
        elapsedAlready
      )
    );


    this.warningTimer =
      setTimeout(
        () => this.enterExpired(),
        Math.max(
          0,
          remainingDuration
        )
      );
  }


  // ================================================================
  // EXPIRED
  // ================================================================

  private enterExpired(): void {

    clearTimeout(
      this.activityTimer
    );

    clearTimeout(
      this.warningTimer
    );


    this.autoExtendedDuringExpired =
      false;


    this.sessionState$.next(
      'expired'
    );

    this.showWarning$.next(
      false
    );


    sessionStorage.setItem(
      this.STATE_KEY,
      'expired'
    );


    this.openExpiredDialog();
  }


  // ================================================================
  // RESTORE STATE
  // ================================================================

  private recomputeFromElapsedTime(): void {

    const persisted =
      (
        sessionStorage.getItem(
          this.STATE_KEY
        ) as SessionState | null
      ) ?? 'active';


    // --------------------------------------------------------------
    // EXPIRED
    // --------------------------------------------------------------

    if (
      persisted === 'expired'
    ) {

      if (
        this.sessionState$.value !==
        'expired'
      ) {

        this.sessionState$.next(
          'expired'
        );
      }


      this.openExpiredDialog();

      return;
    }


    // --------------------------------------------------------------
    // WARNING
    // --------------------------------------------------------------

    if (
      persisted === 'warning'
    ) {

      const warningStarted =
        Number(
          sessionStorage.getItem(
            this.WARNING_STARTED_KEY
          )
        ) || Date.now();


      const remaining =
        this.WARNING_DURATION -
        (
          Date.now() -
          warningStarted
        );


      if (
        remaining <= 0
      ) {

        this.enterExpired();

      } else if (
        this.sessionState$.value !==
        'warning'
      ) {

        this.enterWarning(
          remaining
        );
      }


      return;
    }


    // --------------------------------------------------------------
    // ACTIVE
    // --------------------------------------------------------------

    const lastActivity =
      Number(
        sessionStorage.getItem(
          this.LAST_ACTIVITY_KEY
        )
      ) || Date.now();


    const elapsedSinceActivity =
      Date.now() -
      lastActivity;


    if (
      elapsedSinceActivity >=
      this.INACTIVITY_LIMIT
    ) {

      const remaining =
        this.INACTIVITY_LIMIT +
        this.WARNING_DURATION -
        elapsedSinceActivity;


      if (
        remaining <= 0
      ) {

        this.enterExpired();

      } else {

        this.enterWarning(
          remaining
        );
      }

    } else if (
      this.sessionState$.value !==
      'active'
    ) {

      this.resetInactivityTimer();
    }
  }


  // ================================================================
  // EXISTING PUBLIC VALIDATION API
  //
  // IMPORTANT:
  // KEEP THIS METHOD.
  //
  // Existing FASM pages + validate-session.interceptor.ts call it.
  //
  // The difference is that SessionManager no longer invokes this
  // automatically on every NavigationStart.
  // ================================================================

  public validateAndContinue():
    Observable<boolean> {

    // --------------------------------------------------------------
    // Existing validation already running
    // --------------------------------------------------------------

    if (
      this.validateInFlight
    ) {

      return from(
        this.validateInFlight
      );
    }


    // --------------------------------------------------------------
    // Reuse very recent successful validation
    // --------------------------------------------------------------

    const now =
      Date.now();


    if (
      this.lastValidate &&
      this.lastValidate.valid &&
      now -
      this.lastValidate.at <
      this.VALIDATE_CACHE_MS
    ) {

      return of(true);
    }


    // --------------------------------------------------------------
    // Run validation
    // --------------------------------------------------------------

    this.validateInFlight =
      firstValueFrom(
        this.runValidateAndContinue().pipe(

          tap(
            valid => {

              if (valid) {

                this.lastValidate = {
                  at: Date.now(),
                  valid: true
                };
              }

            }
          )

        )
      ).then(
        valid => {

          this.validateInFlight =
            null;

          return valid;
        }
      );


    return from(
      this.validateInFlight
    );
  }


  // ================================================================
  // ACTUAL SERVER VALIDATION
  // ================================================================

  private runValidateAndContinue():
    Observable<boolean> {

    return this.api
      .get<any>(
        'tokens/validateTokens'
      )
      .pipe(

        map(
          res => {

            if (
              res &&
              this.authService.isSuccess(
                res.success
              )
            ) {

              /*
               * Keep existing behavior for components/interceptor
               * that explicitly request validation.
               */

              if (res.IG_URL) {

                this.authService.setIgUrl(
                  res.IG_URL
                );
              }


              this.authService
                .persistSessionData(
                  res
                );


              this.authService
                .setTokensFromValidateResponse(
                  res
                );


              this.authService
                .syncTokensFromCookies();


              /*
               * Do NOT recreate the session manager here.
               *
               * The manager may already be running.
               */
              if (!this.started) {

                this.start();

              }


              return true;
            }


            console.warn(
              'validateTokens success:false'
            );


            void this.performLogout();


            return false;
          }
        ),


        catchError(
          err => {

            console.warn(
              'validateTokens error:',
              err?.status,
              err
            );


            if (
              err?.status === 401 ||
              err?.status === 403
            ) {

              void this.performLogout();

              return of(false);
            }


            /*
             * Network/server transient error:
             * don't immediately terminate the session.
             */

            if (!this.started) {

              this.start();

            }


            return of(true);
          }
        )
      );
  }


  // ================================================================
  // USER INITIATED CONTINUE
  // ================================================================

  public async staySignedIn(): Promise<void> {

    this.isRefreshing$.next(
      true
    );


    const {
      rotated,
      stillValid,
      transientError
    } = await this.attemptRefresh();


    this.isRefreshing$.next(
      false
    );


    if (
      rotated ||
      stillValid
    ) {

      this.dialog.closeAll();

      this.isExpiredDialogOpen =
        false;


      this.restartSessionLifecycle();

      return;
    }


    if (
      transientError
    ) {

      this.isRefreshing$.next(
        false
      );

      return;
    }


    await this.performLogout();
  }


  // ================================================================
  // RESUME AFTER EXPIRED DIALOG
  // ================================================================

  public resumeAfterCheck(): void {

    this.isExpiredDialogOpen =
      false;

    this.restartSessionLifecycle();
  }


  // ================================================================
  // RESTART LIFECYCLE
  // ================================================================

  private restartSessionLifecycle(): void {

    clearTimeout(
      this.activityTimer
    );

    clearTimeout(
      this.warningTimer
    );

    clearTimeout(
      this.refreshTimer
    );


    this.autoExtendedDuringWarning =
      false;

    this.autoExtendedDuringExpired =
      false;


    this.isRefreshing$.next(
      false
    );


    this.activityWindow =
      new Array(
        this.getWindowSize()
      ).fill(false);


    this.saveActivityWindow();


    sessionStorage.setItem(
      this.LAST_ACTIVITY_KEY,
      String(Date.now())
    );


    this.resetInactivityTimer();

    this.scheduleNextRefresh();
  }


  // ================================================================
  // BACKGROUND REFRESH
  // ================================================================

  private scheduleNextRefresh(): void {

    clearTimeout(
      this.refreshTimer
    );


    this.refreshTimer =
      setTimeout(
        async () => {

          if (
            this.activityWindow.some(
              value => value
            )
          ) {

            const {
              rotated,
              stillValid,
              transientError
            } = await this.attemptRefresh();

            // console.log('Background refresh result:', { rotated, stillValid, transientError });
            if (
              !rotated &&
              !stillValid
              // &&
              // !transientError
            ) {
              // console.log('if inner refresh result:', { rotated, stillValid });
              await this.performLogout();

              return;
            }
            // console.log('Outer  refresh result:', { rotated, stillValid });


            // --------------------------------------------------------
            // Token rotation succeeded
            // --------------------------------------------------------

            if (
              rotated
            ) {

              this.activityWindow =
                new Array(
                  this.getWindowSize()
                ).fill(false);


              this.saveActivityWindow();


              /*
               * Do not dismiss dialogs silently.
               */
              if (
                this.sessionState$.value ===
                'active'
              ) {

                this.resetInactivityTimer();
              }


            } else if (
              !transientError
            ) {

              this.activityWindow.shift();

              this.activityWindow.push(
                false
              );

              this.saveActivityWindow();
            }
          }


          this.scheduleNextRefresh();

        },
        this.REFRESH_INTERVAL
      );
  }


  // ================================================================
  // REFRESH DEDUPLICATION
  // ================================================================

  private attemptRefresh():
    Promise<RefreshResult> {

    if (
      this.refreshInFlight
    ) {

      return this.refreshInFlight;
    }


    this.refreshInFlight =
      this.doRefresh().finally(
        () => {

          this.refreshInFlight =
            null;
        }
      );


    return this.refreshInFlight;
  }


  // ================================================================
  // REFRESH API
  // ================================================================

  private async doRefresh():
    Promise<RefreshResult> {

    try {

      const resp: any =
        await firstValueFrom(
          this.api.get(
            'tokens/refresh'
          )
        );


      const rotated =
        resp?.success === true &&
        resp?.message?.includes(
          'Tokens rotated successfully'
        );


      const stillValid =
        resp?.success === true &&
        resp?.message?.includes(
          'Tokens are still valid'
        );
      // console.log('Refresh API response:', resp, { rotated, stillValid });

      if (
        resp?.IG_URL
      ) {

        this.authService.setIgUrl(
          resp.IG_URL
        );
      }


      return {
        rotated,
        stillValid
      };


    } catch (err: any) {

      console.error(
        'Refresh API error:',
        err
      );


      const status =
        err?.status;


      const transientError =
        status === 0 ||
        status === undefined ||
        status >= 500;


      return {
        rotated: false,
        stillValid: false,
        transientError
      };
    }
  }


  // ================================================================
  // EXPIRED DIALOG
  // ================================================================

  private openExpiredDialog(): void {

    if (
      this.isExpiredDialogOpen
    ) {

      return;
    }


    try {

      const ref =
        this.dialog.open(
          SessionExpiredDialogComponent as any,
          {
            disableClose: true,
            autoFocus: false,
            restoreFocus: false
          }
        );


      this.isExpiredDialogOpen =
        true;


      ref.afterClosed()
        .subscribe(
          () => {

            this.isExpiredDialogOpen =
              false;

          }
        );


    } catch (err) {

      console.error(
        'Error opening session-expired dialog:',
        err
      );
    }
  }


  // ================================================================
  // LOGOUT
  // ================================================================

  public async performLogout(): Promise<void> {

    if (
      this.logoutInProgress
    ) {

      return;
    }


    this.logoutInProgress =
      true;


    this.dialog.closeAll();

    this.isExpiredDialogOpen =
      false;


    const igUrl =
      this.authService.getIgUrl();


    this.clearSession();


    this.syncChannel?.postMessage({
      type: 'logout'
    });


    this.ngZone.run(
      async () => {

        try {

          await firstValueFrom(
            this.api.igLogout()
          );

        } catch (error) {

          console.error(
            'Logout API error:',
            error
          );

        } finally {

          sessionStorage.clear();
          localStorage.clear();


          if (
            igUrl
          ) {

            console.log(
              'Logged out. Redirecting to IG URL:',
              igUrl
            );


            window.location.href =
              igUrl;

          } else {

            this.router.navigate([
              '/login'
            ]);
          }
        }
      }
    );
  }


  // ================================================================
  // CLEANUP
  // ================================================================

  public clearSession(): void {

    [
      'mousemove',
      'keydown',
      'scroll',
      'click'
    ].forEach(
      eventName => {

        window.removeEventListener(
          eventName,
          this.activityListener
        );

      }
    );


    document.removeEventListener(
      'visibilitychange',
      this.visibilityListener
    );


    clearTimeout(
      this.activityTimer
    );

    clearTimeout(
      this.warningTimer
    );

    clearTimeout(
      this.refreshTimer
    );


    sessionStorage.removeItem(
      this.ACTIVITY_WINDOW_KEY
    );

    sessionStorage.removeItem(
      this.LAST_ACTIVITY_KEY
    );

    sessionStorage.removeItem(
      this.WARNING_STARTED_KEY
    );

    sessionStorage.removeItem(
      this.STATE_KEY
    );


    this.sessionState$.next(
      'active'
    );

    this.showWarning$.next(
      false
    );

    this.isRefreshing$.next(
      false
    );


    this.autoExtendedDuringWarning =
      false;

    this.autoExtendedDuringExpired =
      false;


    this.started =
      false;
  }
}
