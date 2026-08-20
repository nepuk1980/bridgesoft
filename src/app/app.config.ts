import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNgxSkeletonLoader } from 'ngx-skeleton-loader';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { igtokenInterceptor } from './interceptors/igtoken.interceptor';
import { captureInitialUrl } from './sso-url';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([igtokenInterceptor, authInterceptor])),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    provideNgxSkeletonLoader({
      theme: {
        extendsFromRoot: true,
        height: '1.875rem',
      },
    }),

    {
      // Capture the original URL (carrying the SSO values) before any
      // navigation redirects can rewrite it.
      provide: APP_INITIALIZER,
      useFactory: captureInitialUrl,
      multi: true,
    },

    // Add this
    CookieService
  ],
};