import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { AuthUser } from '../../core/auth-user';
import { MOCK_ADAPTER_CONFIG, MockAdapterConfig } from './mock-config';
import { MockAuthAdapter } from './mock.adapter';

function setup(config: MockAdapterConfig = {}): MockAuthAdapter {
  TestBed.configureTestingModule({
    providers: [
      { provide: MOCK_ADAPTER_CONFIG, useValue: config },
      MockAuthAdapter,
    ],
  });
  return TestBed.inject(MockAuthAdapter);
}

describe('MockAuthAdapter', () => {
  it('starts anonymous by default', async () => {
    const adapter = setup();
    await adapter.init();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
    expect(await firstValueFrom(adapter.user$)).toBeNull();
  });

  it('honours startAuthenticated', async () => {
    const user: AuthUser = { id: 'u-42', email: 'alice@test.dev' };
    const adapter = setup({ startAuthenticated: true, user });
    await adapter.init();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(true);
    expect(await firstValueFrom(adapter.user$)).toEqual(user);
  });

  it('transitions through login() and logout()', async () => {
    const adapter = setup();
    await adapter.init();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);

    await adapter.login();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(true);

    await adapter.logout();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
  });

  it('accepts a per-call user override via LoginOptions.extra.user', async () => {
    const adapter = setup();
    const custom: AuthUser = { id: 'u-7', name: 'Bob' };
    await adapter.login({ extra: { user: custom } });
    expect(await firstValueFrom(adapter.user$)).toEqual(custom);
  });

  it('returns the configured access token only while authenticated', async () => {
    const adapter = setup({ accessToken: 'tok-123' });
    expect(await adapter.getAccessToken()).toBeNull();
    await adapter.login();
    expect(await adapter.getAccessToken()).toBe('tok-123');
    await adapter.logout();
    expect(await adapter.getAccessToken()).toBeNull();
  });

  it('setUser() flips state synchronously for tests', async () => {
    const adapter = setup();
    adapter.setUser({ id: 'seed' });
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(true);
    adapter.setUser(null);
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
  });
});
