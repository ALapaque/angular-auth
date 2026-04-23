import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';

import { AuthProvider } from '../../core/auth-provider';
import { AuthUser } from '../../core/auth-user';
import {
  LoginOptions,
  LogoutOptions,
  TokenOptions,
} from '../../core/auth-options';
import { JWT_ADAPTER_CONFIG, JwtAdapterConfig, JwtTokens } from './jwt-config';

const DEFAULT_STORAGE_KEY = 'generic-auth.jwt';

/**
 * Stateless-token adapter for home-grown backends that issue JWTs.
 * Login posts credentials to `loginUrl`; the returned token is stored and
 * refreshed on demand via `refreshUrl` when close to expiry.
 */
@Injectable()
export class JwtAuthAdapter implements AuthProvider {
  private readonly http = inject(HttpClient);
  private readonly config = inject(JWT_ADAPTER_CONFIG);

  private readonly tokens_ = new BehaviorSubject<JwtTokens | null>(null);
  private readonly loading_ = new BehaviorSubject<boolean>(true);

  readonly user$: Observable<AuthUser | null> = this.tokens_.pipe(
    map((t) => (t ? this.decodeUser(t.accessToken) : null)),
  );
  readonly isAuthenticated$: Observable<boolean> = this.tokens_.pipe(
    map((t) => t !== null && !isExpired(t)),
  );
  readonly isLoading$: Observable<boolean> = this.loading_.asObservable();

  private initPromise?: Promise<void>;

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      const stored = this.readStorage();
      if (stored && !isExpired(stored)) {
        this.tokens_.next(stored);
      } else if (stored && stored.refreshToken && this.config.refreshUrl) {
        try {
          await this.refresh(stored.refreshToken);
        } catch {
          this.writeStorage(null);
        }
      }
      this.loading_.next(false);
    })();
    return this.initPromise;
  }

  async login(options?: LoginOptions): Promise<void> {
    const body = (options?.extra ?? {}) as Record<string, unknown>;
    const response = await firstValueFrom(this.http.post(this.config.loginUrl, body));
    const tokens = (this.config.mapLoginResponse ?? defaultMap)(response);
    this.apply(tokens);
  }

  async logout(_options?: LogoutOptions): Promise<void> {
    if (this.config.logoutUrl) {
      try {
        await firstValueFrom(this.http.post(this.config.logoutUrl, {}));
      } catch {
        // Best-effort: still clear client state even if the server call fails.
      }
    }
    this.apply(null);
  }

  async getAccessToken(options?: TokenOptions): Promise<string | null> {
    const current = this.tokens_.value;
    if (!current) return null;

    const expiringSoon = current.expiresAt && current.expiresAt * 1000 - Date.now() < 30_000;
    if ((options?.forceRefresh || expiringSoon) && current.refreshToken && this.config.refreshUrl) {
      try {
        await this.refresh(current.refreshToken);
      } catch {
        this.apply(null);
        return null;
      }
    }
    return this.tokens_.value?.accessToken ?? null;
  }

  private async refresh(refreshToken: string): Promise<void> {
    if (!this.config.refreshUrl) return;
    const response = await firstValueFrom(
      this.http.post(this.config.refreshUrl, { refreshToken }),
    );
    const mapper =
      this.config.mapRefreshResponse ?? this.config.mapLoginResponse ?? defaultMap;
    this.apply(mapper(response));
  }

  private apply(tokens: JwtTokens | null): void {
    const normalized = tokens ? withDerivedExpiry(tokens) : null;
    this.tokens_.next(normalized);
    this.writeStorage(normalized);
  }

  private decodeUser(accessToken: string): AuthUser | null {
    const claims = decodeJwt(accessToken);
    if (!claims) return null;
    const mapper = this.config.mapUser ?? defaultUserMapper;
    return mapper(claims);
  }

  private readStorage(): JwtTokens | null {
    const store = this.getStore();
    if (!store) return null;
    try {
      const raw = store.getItem(this.storageKey());
      if (!raw) return null;
      return JSON.parse(raw) as JwtTokens;
    } catch {
      // Storage may be disabled (private mode, iframe sandbox, quota),
      // and stored content may be corrupted. In both cases treat as empty.
      return null;
    }
  }

  private writeStorage(tokens: JwtTokens | null): void {
    const store = this.getStore();
    if (!store) return;
    const key = this.storageKey();
    try {
      if (!tokens) {
        store.removeItem(key);
      } else {
        store.setItem(key, JSON.stringify(tokens));
      }
    } catch {
      // Quota exceeded or storage disabled — silently give up rather than
      // crashing the auth flow. Consumers opting in to 'local'/'session'
      // storage accept this trade-off; use `storage: 'memory'` to make
      // persistence failure explicit.
    }
  }

  private storageKey(): string {
    return this.config.storageKey ?? DEFAULT_STORAGE_KEY;
  }

  private getStore(): Storage | null {
    if (this.config.storage === 'memory') return null;
    // Server-side rendering, web workers, or any environment where the DOM
    // globals are not available yet.
    if (typeof window === 'undefined') return null;
    try {
      return this.config.storage === 'session' ? window.sessionStorage : window.localStorage;
    } catch {
      // Some browsers throw when accessing storage with strict privacy settings.
      return null;
    }
  }
}

function defaultMap(response: unknown): JwtTokens {
  if (!response || typeof response !== 'object') {
    throw new Error('JwtAuthAdapter: login/refresh response is not an object.');
  }
  const body = response as Record<string, unknown>;
  const access = body['accessToken'] ?? body['access_token'] ?? body['token'];
  if (typeof access !== 'string') {
    throw new Error('JwtAuthAdapter: no access token in response (accessToken | access_token | token).');
  }
  const refresh = body['refreshToken'] ?? body['refresh_token'];
  const expires = body['expiresAt'] ?? body['expires_at'] ?? body['exp'];
  return {
    accessToken: access,
    refreshToken: typeof refresh === 'string' ? refresh : undefined,
    expiresAt: typeof expires === 'number' ? expires : undefined,
  };
}

function withDerivedExpiry(tokens: JwtTokens): JwtTokens {
  if (tokens.expiresAt) return tokens;
  const claims = decodeJwt(tokens.accessToken);
  const exp = claims && typeof claims['exp'] === 'number' ? (claims['exp'] as number) : undefined;
  return exp ? { ...tokens, expiresAt: exp } : tokens;
}

function isExpired(tokens: JwtTokens): boolean {
  if (!tokens.expiresAt) return false;
  return tokens.expiresAt * 1000 <= Date.now();
}

function decodeJwt(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2 || typeof atob !== 'function') return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const decoded = decodeURIComponent(
      binary
        .split('')
        .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function defaultUserMapper(claims: Record<string, unknown>): AuthUser | null {
  const sub = claims['sub'];
  if (typeof sub !== 'string') return null;
  const rolesClaim = claims['roles'] ?? claims['authorities'];
  const roles = Array.isArray(rolesClaim)
    ? rolesClaim.filter((r): r is string => typeof r === 'string')
    : undefined;
  return {
    id: sub,
    email: typeof claims['email'] === 'string' ? (claims['email'] as string) : undefined,
    name: typeof claims['name'] === 'string' ? (claims['name'] as string) : undefined,
    roles,
    raw: claims,
  };
}
