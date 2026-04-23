import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { AuthProvider } from '../../core/auth-provider';
import { AuthUser } from '../../core/auth-user';
import {
  LoginOptions,
  LogoutOptions,
  TokenOptions,
} from '../../core/auth-options';
import { MOCK_ADAPTER_CONFIG } from './mock-config';

const DEFAULT_USER: AuthUser = {
  id: 'mock-user',
  email: 'mock@example.com',
  name: 'Mock User',
  roles: ['user'],
};

/**
 * In-memory adapter intended for dev servers, Storybook and E2E tests.
 * Never ship this to production.
 */
@Injectable()
export class MockAuthAdapter implements AuthProvider {
  private readonly config = inject(MOCK_ADAPTER_CONFIG);

  private readonly user_ = new BehaviorSubject<AuthUser | null>(
    this.config.startAuthenticated ? this.config.user ?? DEFAULT_USER : null,
  );
  private readonly loading_ = new BehaviorSubject<boolean>(false);

  readonly user$: Observable<AuthUser | null> = this.user_.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.user_.pipe(map((u) => u !== null));
  readonly isLoading$: Observable<boolean> = this.loading_.asObservable();

  async init(): Promise<void> {
    await this.delay();
  }

  async login(options?: LoginOptions): Promise<void> {
    this.loading_.next(true);
    await this.delay();
    const override = options?.extra?.['user'] as AuthUser | undefined;
    this.user_.next(override ?? this.config.user ?? DEFAULT_USER);
    this.loading_.next(false);
  }

  async logout(_options?: LogoutOptions): Promise<void> {
    this.loading_.next(true);
    await this.delay();
    this.user_.next(null);
    this.loading_.next(false);
  }

  async getAccessToken(_options?: TokenOptions): Promise<string | null> {
    if (!this.user_.value) return null;
    return this.config.accessToken ?? 'mock-access-token';
  }

  /** Test helper: flip the authenticated state synchronously. */
  setUser(user: AuthUser | null): void {
    this.user_.next(user);
  }

  private delay(): Promise<void> {
    const ms = this.config.latencyMs ?? 0;
    return ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
  }
}
