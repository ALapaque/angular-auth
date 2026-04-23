import { InjectionToken } from '@angular/core';

export interface AuthCoreConfig {
  /**
   * URLs whose outgoing requests should receive a Bearer token when the
   * HTTP interceptor is registered. Matches on startsWith.
   * Use `['*']` to attach to every request (not recommended in production).
   */
  protectedResourceUrls?: string[];

  /**
   * Where to redirect unauthenticated users caught by the auth guard.
   * When omitted the guard simply triggers `login()` with the current URL.
   */
  loginRedirectUrl?: string;
}

export const AUTH_CORE_CONFIG = new InjectionToken<AuthCoreConfig>('AUTH_CORE_CONFIG', {
  providedIn: 'root',
  factory: () => ({}),
});
