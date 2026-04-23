import { InjectionToken } from '@angular/core';

import { AuthUser } from '../../core/auth-user';

export interface JwtTokens {
  accessToken: string;
  refreshToken?: string;
  /** Unix seconds when the access token expires. Optional; derived from JWT `exp` if omitted. */
  expiresAt?: number;
}

export interface JwtLoginPayload {
  [key: string]: unknown;
}

export interface JwtAdapterConfig {
  /** Full URL to POST login credentials to. Expected to return `JwtTokens` (or a shape mapped via `mapLoginResponse`). */
  loginUrl: string;
  /** Full URL to POST the refresh token to. Expected to return refreshed `JwtTokens`. */
  refreshUrl?: string;
  /** Optional logout endpoint. If omitted, logout is purely client-side. */
  logoutUrl?: string;
  /** Storage key used for persisting tokens. */
  storageKey?: string;
  /** sessionStorage keeps tokens per tab; localStorage survives browser restarts. */
  storage?: 'local' | 'session' | 'memory';
  /** Map a custom login response to the unified `JwtTokens` shape. */
  mapLoginResponse?: (response: unknown) => JwtTokens;
  /** Map a custom refresh response to the unified `JwtTokens` shape. Defaults to `mapLoginResponse`. */
  mapRefreshResponse?: (response: unknown) => JwtTokens;
  /** Map a decoded JWT payload to an `AuthUser`. Default maps `sub`, `email`, `name`, `roles`. */
  mapUser?: (claims: Record<string, unknown>) => AuthUser | null;
}

export const JWT_ADAPTER_CONFIG = new InjectionToken<JwtAdapterConfig>('JWT_ADAPTER_CONFIG');
