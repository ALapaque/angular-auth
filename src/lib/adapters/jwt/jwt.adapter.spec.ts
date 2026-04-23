import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { JWT_ADAPTER_CONFIG, JwtAdapterConfig } from './jwt-config';
import { JwtAuthAdapter } from './jwt.adapter';

const LOGIN_URL = 'https://api.test/auth/login';
const REFRESH_URL = 'https://api.test/auth/refresh';
const LOGOUT_URL = 'https://api.test/auth/logout';

// Minimal HS256 JWT (unsigned payload — signature irrelevant, we only parse).
function jwt(payload: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

function base64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function setup(config: Partial<JwtAdapterConfig> = {}): {
  adapter: JwtAuthAdapter;
  http: HttpTestingController;
} {
  localStorage.clear();
  sessionStorage.clear();

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: JWT_ADAPTER_CONFIG,
        useValue: {
          loginUrl: LOGIN_URL,
          refreshUrl: REFRESH_URL,
          logoutUrl: LOGOUT_URL,
          storage: 'local',
          ...config,
        } satisfies JwtAdapterConfig,
      },
      JwtAuthAdapter,
    ],
  });

  return {
    adapter: TestBed.inject(JwtAuthAdapter),
    http: TestBed.inject(HttpTestingController),
  };
}

describe('JwtAuthAdapter', () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts unauthenticated when storage is empty', async () => {
    const { adapter, http } = setup();
    await adapter.init();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
    http.verify();
  });

  it('posts credentials to loginUrl and stores returned tokens', async () => {
    const { adapter, http } = setup();
    await adapter.init();

    const promise = adapter.login({ extra: { email: 'a@b.c', password: 'pw' } });

    const req = http.expectOne(LOGIN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@b.c', password: 'pw' });
    req.flush({
      accessToken: jwt({ sub: 'u-1', email: 'a@b.c', exp: secondsFromNow(3600) }),
      refreshToken: 'r-1',
    });

    await promise;

    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(true);
    const user = await firstValueFrom(adapter.user$);
    expect(user?.id).toBe('u-1');
    expect(user?.email).toBe('a@b.c');
    http.verify();
  });

  it('auto-refreshes when getAccessToken() is called near expiry', async () => {
    const { adapter, http } = setup();
    await adapter.init();

    const loginP = adapter.login({ extra: {} });
    http.expectOne(LOGIN_URL).flush({
      accessToken: jwt({ sub: 'u-1', exp: secondsFromNow(10) }), // expires in 10s (< 30s threshold)
      refreshToken: 'r-1',
    });
    await loginP;

    const tokenP = adapter.getAccessToken();

    const refreshReq = http.expectOne(REFRESH_URL);
    expect(refreshReq.request.body).toEqual({ refreshToken: 'r-1' });
    refreshReq.flush({
      accessToken: jwt({ sub: 'u-1', exp: secondsFromNow(3600) }),
      refreshToken: 'r-2',
    });

    const fresh = await tokenP;
    expect(fresh).toBeTruthy();
    // Next call should not refresh again (plenty of time left).
    const sameToken = await adapter.getAccessToken();
    expect(sameToken).toBe(fresh);
    http.verify();
  });

  it('forceRefresh triggers a refresh even when the token is fresh', async () => {
    const { adapter, http } = setup();
    await adapter.init();

    const loginP = adapter.login({ extra: {} });
    http.expectOne(LOGIN_URL).flush({
      accessToken: jwt({ sub: 'u-1', exp: secondsFromNow(3600) }),
      refreshToken: 'r-1',
    });
    await loginP;

    const tokenP = adapter.getAccessToken({ forceRefresh: true });
    http.expectOne(REFRESH_URL).flush({
      accessToken: jwt({ sub: 'u-1', exp: secondsFromNow(3600) }),
      refreshToken: 'r-2',
    });
    await tokenP;
    http.verify();
  });

  it('restores a session from localStorage on init', async () => {
    const { adapter, http } = setup();
    const token = jwt({ sub: 'u-42', exp: secondsFromNow(3600) });
    localStorage.setItem(
      'generic-auth.jwt',
      JSON.stringify({ accessToken: token, refreshToken: 'r', expiresAt: secondsFromNow(3600) }),
    );

    await adapter.init();

    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(true);
    expect((await firstValueFrom(adapter.user$))?.id).toBe('u-42');
    http.verify();
  });

  it('calls logoutUrl and clears state on logout', async () => {
    const { adapter, http } = setup();
    await adapter.init();

    const loginP = adapter.login({ extra: {} });
    http.expectOne(LOGIN_URL).flush({
      accessToken: jwt({ sub: 'u-1', exp: secondsFromNow(3600) }),
    });
    await loginP;

    const logoutP = adapter.logout();
    const logoutReq = http.expectOne(LOGOUT_URL);
    expect(logoutReq.request.method).toBe('POST');
    logoutReq.flush({});
    await logoutP;

    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
    expect(localStorage.getItem('generic-auth.jwt')).toBeNull();
    http.verify();
  });

  it('respects a custom mapLoginResponse for non-standard backends', async () => {
    const { adapter, http } = setup({
      mapLoginResponse: (r) => {
        const data = (r as { data: { jwt: string } }).data;
        return { accessToken: data.jwt };
      },
    });
    await adapter.init();

    const p = adapter.login({ extra: {} });
    http.expectOne(LOGIN_URL).flush({
      data: { jwt: jwt({ sub: 'u-9', exp: secondsFromNow(3600) }) },
    });
    await p;

    expect((await firstValueFrom(adapter.user$))?.id).toBe('u-9');
    http.verify();
  });
});

function secondsFromNow(seconds: number): number {
  return Math.floor(Date.now() / 1000) + seconds;
}

beforeEach(() => {
  // Fresh per-test DOM storages handled by setup() clearing, but guard here too.
  localStorage.clear();
});
