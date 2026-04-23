import { TestBed } from '@angular/core/testing';
import {
  AuthenticatedResult,
  LoginResponse,
  OidcSecurityService,
  UserDataResult,
} from 'angular-auth-oidc-client';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OidcAuthAdapter } from './oidc.adapter';

function fakeOidc(opts: {
  user?: Record<string, unknown> | null;
  authenticated?: boolean;
}): { service: OidcSecurityService; userData$: BehaviorSubject<UserDataResult>; isAuth$: BehaviorSubject<AuthenticatedResult> } {
  const userData$ = new BehaviorSubject<UserDataResult>({
    userData: opts.user ?? null,
    allUserData: [],
  });
  const isAuth$ = new BehaviorSubject<AuthenticatedResult>({
    isAuthenticated: opts.authenticated ?? false,
    allConfigsAuthenticated: [],
  });
  return {
    service: {
      userData$,
      isAuthenticated$: isAuth$,
      checkAuth: vi.fn().mockReturnValue(of({ isAuthenticated: opts.authenticated ?? false } as LoginResponse)),
      authorize: vi.fn(),
      logoff: vi.fn().mockReturnValue(of(null)),
      getAccessToken: vi.fn().mockReturnValue(of('tok-abc')),
    } as unknown as OidcSecurityService,
    userData$,
    isAuth$,
  };
}

function setup(opts: Parameters<typeof fakeOidc>[0]) {
  const fake = fakeOidc(opts);
  TestBed.configureTestingModule({
    providers: [
      { provide: OidcSecurityService, useValue: fake.service },
      OidcAuthAdapter,
    ],
  });
  return { adapter: TestBed.inject(OidcAuthAdapter), fake };
}

describe('OidcAuthAdapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps OIDC claims to AuthUser with Keycloak-style roles', async () => {
    const { adapter } = setup({
      user: {
        sub: 'u-1',
        email: 'a@b.c',
        name: 'Alice',
        realm_access: { roles: ['admin', 'viewer'] },
      },
      authenticated: true,
    });
    await adapter.init();
    const user = await firstValueFrom(adapter.user$);
    expect(user?.id).toBe('u-1');
    expect(user?.roles).toEqual(['admin', 'viewer']);
  });

  it('maps Cognito groups as roles', async () => {
    const { adapter } = setup({
      user: { sub: 'u-1', 'cognito:groups': ['editors'] },
      authenticated: true,
    });
    await adapter.init();
    expect((await firstValueFrom(adapter.user$))?.roles).toEqual(['editors']);
  });

  it('login() delegates to authorize() with forwarded params', async () => {
    const { adapter, fake } = setup({});
    await adapter.init();
    await adapter.login({ redirectUrl: '/back', extra: { login_hint: 'alice' } });
    expect(fake.service.authorize).toHaveBeenCalledWith(undefined, {
      customParams: { login_hint: 'alice' },
      redirectUrl: '/back',
    });
  });

  it('getAccessToken() returns the SDK token', async () => {
    const { adapter } = setup({ authenticated: true });
    await adapter.init();
    expect(await adapter.getAccessToken()).toBe('tok-abc');
  });

  it('init() only runs checkAuth once even on repeated calls', async () => {
    const { adapter, fake } = setup({});
    await adapter.init();
    await adapter.init();
    await adapter.init();
    expect(fake.service.checkAuth).toHaveBeenCalledTimes(1);
  });
});
