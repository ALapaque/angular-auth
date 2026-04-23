import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
  createClient,
} from '@supabase/supabase-js';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { AuthProvider } from '../../core/auth-provider';
import { AuthUser } from '../../core/auth-user';
import {
  LoginOptions,
  LogoutOptions,
  TokenOptions,
} from '../../core/auth-options';
import {
  SUPABASE_ADAPTER_CONFIG,
  SupabaseLoginStrategy,
} from './supabase-config';

@Injectable()
export class SupabaseAuthAdapter implements AuthProvider, OnDestroy {
  private readonly config = inject(SUPABASE_ADAPTER_CONFIG);

  private client?: SupabaseClient;
  private authSubscription?: { unsubscribe: () => void };
  private initPromise?: Promise<void>;

  private readonly session_ = new BehaviorSubject<Session | null>(null);
  private readonly loading_ = new BehaviorSubject<boolean>(true);

  readonly user$: Observable<AuthUser | null> = this.session_.pipe(
    map((session) => toAuthUser(session?.user ?? null)),
  );
  readonly isAuthenticated$: Observable<boolean> = this.session_.pipe(
    map((session) => session !== null),
  );
  readonly isLoading$: Observable<boolean> = this.loading_.asObservable();

  /** @internal — exposed for tests to inject a fake client. */
  setClient(client: SupabaseClient): void {
    this.client = client;
  }

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      if (!this.client) {
        this.client = createClient(this.config.url, this.config.anonKey, this.config.clientOptions);
      }
      const { data } = await this.client.auth.getSession();
      this.session_.next(data.session ?? null);

      const { data: subscription } = this.client.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          this.session_.next(session);
        },
      );
      this.authSubscription = subscription.subscription;

      this.loading_.next(false);
    })();
    return this.initPromise;
  }

  async login(options?: LoginOptions): Promise<void> {
    const strategy =
      (options?.extra?.['strategy'] as SupabaseLoginStrategy | undefined) ??
      this.config.defaultStrategy;
    if (!strategy) {
      throw new Error(
        'SupabaseAuthAdapter: no login strategy. Pass `defaultStrategy` to provideSupabase() or LoginOptions.extra.strategy.',
      );
    }
    const client = this.requireClient();
    switch (strategy.type) {
      case 'password': {
        const { error } = await client.auth.signInWithPassword({
          email: strategy.email,
          password: strategy.password,
        });
        if (error) throw error;
        return;
      }
      case 'otp': {
        const { error } = await client.auth.signInWithOtp({ email: strategy.email });
        if (error) throw error;
        return;
      }
      case 'oauth': {
        const { error } = await client.auth.signInWithOAuth({
          provider: strategy.provider,
          options: { redirectTo: strategy.redirectTo, scopes: strategy.scopes },
        });
        if (error) throw error;
        return;
      }
    }
  }

  async logout(_options?: LogoutOptions): Promise<void> {
    const { error } = await this.requireClient().auth.signOut();
    if (error) throw error;
  }

  async getAccessToken(options?: TokenOptions): Promise<string | null> {
    const client = this.requireClient();
    if (options?.forceRefresh) {
      const { data, error } = await client.auth.refreshSession();
      if (error) return null;
      return data.session?.access_token ?? null;
    }
    const { data } = await client.auth.getSession();
    return data.session?.access_token ?? null;
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  private requireClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('SupabaseAuthAdapter: init() must complete before use.');
    }
    return this.client;
  }
}

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const app = (user.app_metadata ?? {}) as Record<string, unknown>;
  const rolesClaim = app['roles'] ?? app['role'];
  const roles = Array.isArray(rolesClaim)
    ? rolesClaim.filter((r): r is string => typeof r === 'string')
    : typeof rolesClaim === 'string'
      ? [rolesClaim]
      : undefined;

  return {
    id: user.id,
    email: user.email ?? undefined,
    name: typeof meta['full_name'] === 'string' ? (meta['full_name'] as string) : undefined,
    picture: typeof meta['avatar_url'] === 'string' ? (meta['avatar_url'] as string) : undefined,
    roles,
    raw: { user_metadata: meta, app_metadata: app },
  };
}
