import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthUser } from './auth-user';
import { LoginOptions, LogoutOptions, TokenOptions } from './auth-options';

/**
 * Contract every concrete provider (OIDC, MSAL, Firebase, JWT, Mock...)
 * must satisfy. Kept deliberately narrow: adapters translate from their
 * native SDK to this unified surface.
 */
export interface AuthProvider {
  readonly user$: Observable<AuthUser | null>;
  readonly isAuthenticated$: Observable<boolean>;
  readonly isLoading$: Observable<boolean>;

  /** Bootstrap the underlying SDK. Safe to call multiple times. */
  init(): Promise<void>;

  login(options?: LoginOptions): Promise<void>;
  logout(options?: LogoutOptions): Promise<void>;

  getAccessToken(options?: TokenOptions): Promise<string | null>;

  /**
   * Only relevant for redirect-based flows. Adapters that use popups,
   * native SDK bootstrap or no redirect at all can leave it undefined.
   */
  handleRedirectCallback?(): Promise<void>;
}

export const AUTH_PROVIDER = new InjectionToken<AuthProvider>('AUTH_PROVIDER');
