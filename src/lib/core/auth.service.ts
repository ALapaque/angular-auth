import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, firstValueFrom } from 'rxjs';

import { AUTH_PROVIDER, AuthProvider } from './auth-provider';
import { AuthUser } from './auth-user';
import { LoginOptions, LogoutOptions, TokenOptions } from './auth-options';

/**
 * Single façade consumers inject in components and services. Delegates
 * to whichever AuthProvider is wired via provideAuth().
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly provider = inject<AuthProvider>(AUTH_PROVIDER);

  readonly user$: Observable<AuthUser | null> = this.provider.user$;
  readonly isAuthenticated$: Observable<boolean> = this.provider.isAuthenticated$;
  readonly isLoading$: Observable<boolean> = this.provider.isLoading$;

  readonly user = toSignal(this.user$, { initialValue: null });
  readonly isAuthenticated = toSignal(this.isAuthenticated$, { initialValue: false });
  readonly isLoading = toSignal(this.isLoading$, { initialValue: true });

  readonly isAnonymous = computed(() => !this.isLoading() && !this.isAuthenticated());

  init(): Promise<void> {
    return this.provider.init();
  }

  login(options?: LoginOptions): Promise<void> {
    return this.provider.login(options);
  }

  logout(options?: LogoutOptions): Promise<void> {
    return this.provider.logout(options);
  }

  getAccessToken(options?: TokenOptions): Promise<string | null> {
    return this.provider.getAccessToken(options);
  }

  handleRedirectCallback(): Promise<void> {
    return this.provider.handleRedirectCallback?.() ?? Promise.resolve();
  }

  /** Convenience: await the first resolved authenticated state. */
  async hasValidSession(): Promise<boolean> {
    await this.init();
    return firstValueFrom(this.isAuthenticated$);
  }
}
