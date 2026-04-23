import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  authInterceptor,
  provideAuth,
  provideMock,
} from 'generic-angular-auth';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Swap this single line to point at another provider:
    //   provideAuth(provideOidc({ ... }))
    //   provideAuth(provideMsal({ ... }))
    //   provideAuth(provideFirebase({ ... }))
    //   provideAuth(provideJwt({ ... }))
    provideAuth(
      provideMock({
        user: {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          roles: ['admin'],
        },
        latencyMs: 300,
      }),
      {
        protectedResourceUrls: ['https://api.example.com'],
      },
    ),
  ],
};
