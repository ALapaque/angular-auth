import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import {
  LoginResponse,
  OidcSecurityService,
  UserDataResult,
} from 'angular-auth-oidc-client';

import { AuthProvider } from '../../core/auth-provider';
import { AuthUser } from '../../core/auth-user';
import {
  LoginOptions,
  LogoutOptions,
  TokenOptions,
} from '../../core/auth-options';

/**
 * OIDC adapter built on top of `angular-auth-oidc-client`. Works with any
 * spec-compliant issuer: Auth0, Keycloak, Okta, Cognito, Zitadel, Authentik,
 * Google, Entra External ID, etc.
 */
@Injectable()
export class OidcAuthAdapter implements AuthProvider {
  private readonly oidc = inject(OidcSecurityService);
  private initPromise?: Promise<void>;

  readonly user$: Observable<AuthUser | null> = this.oidc.userData$.pipe(
    map((result: UserDataResult) => toAuthUser(result?.userData)),
  );

  readonly isAuthenticated$: Observable<boolean> = this.oidc.isAuthenticated$.pipe(
    map((result) => result.isAuthenticated),
  );

  readonly isLoading$: Observable<boolean> = this.oidc.isAuthenticated$.pipe(
    map((result) => result.isAuthenticated === undefined),
  );

  init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = firstValueFrom(this.oidc.checkAuth()).then(
        (_: LoginResponse) => undefined,
      );
    }
    return this.initPromise;
  }

  async login(options?: LoginOptions): Promise<void> {
    this.oidc.authorize(undefined, {
      customParams: options?.extra as Record<string, string | number | boolean> | undefined,
      redirectUrl: options?.redirectUrl,
    });
  }

  async logout(options?: LogoutOptions): Promise<void> {
    await firstValueFrom(
      this.oidc.logoff(undefined, {
        customParams: options?.extra as Record<string, string | number | boolean> | undefined,
      }),
    );
  }

  async getAccessToken(_options?: TokenOptions): Promise<string | null> {
    const token = await firstValueFrom(this.oidc.getAccessToken());
    return token || null;
  }

  async handleRedirectCallback(): Promise<void> {
    await firstValueFrom(this.oidc.checkAuth());
  }
}

function toAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const claims = raw as Record<string, unknown>;
  const sub = claims['sub'];
  if (typeof sub !== 'string') {
    return null;
  }
  return {
    id: sub,
    email: typeof claims['email'] === 'string' ? (claims['email'] as string) : undefined,
    name:
      (typeof claims['name'] === 'string' && (claims['name'] as string)) ||
      (typeof claims['preferred_username'] === 'string'
        ? (claims['preferred_username'] as string)
        : undefined),
    picture:
      typeof claims['picture'] === 'string' ? (claims['picture'] as string) : undefined,
    roles: extractRoles(claims),
    raw: claims,
  };
}

function extractRoles(claims: Record<string, unknown>): string[] | undefined {
  // Keycloak: realm_access.roles ; generic: roles ; Cognito: cognito:groups
  const realm = claims['realm_access'];
  if (realm && typeof realm === 'object') {
    const roles = (realm as Record<string, unknown>)['roles'];
    if (Array.isArray(roles)) return roles.filter((r): r is string => typeof r === 'string');
  }
  const direct = claims['roles'];
  if (Array.isArray(direct)) return direct.filter((r): r is string => typeof r === 'string');
  const cognito = claims['cognito:groups'];
  if (Array.isArray(cognito)) return cognito.filter((r): r is string => typeof r === 'string');
  return undefined;
}
