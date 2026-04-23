import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { authInterceptor, provideAuth } from 'generic-angular-auth';

import { getSelectedAdapter } from './adapter-selection';
import { routes } from './app.routes';

// Real apps pick a single provider at bootstrap (from env vars or config).
// The demo reads the user's last choice from localStorage so the "Switch
// provider" dropdown can bounce the app between adapters via a page reload.
const selected = getSelectedAdapter();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAuth(selected.build(), {
      protectedResourceUrls: ['https://api.example.com'],
    }),
  ],
};
