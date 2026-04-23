import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { MOCK_ADAPTER_CONFIG } from '../adapters/mock/mock-config';
import { MockAuthAdapter } from '../adapters/mock/mock.adapter';
import { AUTH_PROVIDER } from './auth-provider';
import { AuthService } from './auth.service';

describe('AuthService façade', () => {
  function configure() {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MOCK_ADAPTER_CONFIG,
          useValue: { user: { id: 'u-1', name: 'Alice' } },
        },
        MockAuthAdapter,
        { provide: AUTH_PROVIDER, useExisting: MockAuthAdapter },
      ],
    });
  }

  it('delegates to the underlying provider', async () => {
    configure();
    const auth = TestBed.inject(AuthService);

    await auth.init();
    expect(auth.isAuthenticated()).toBe(false);

    await auth.login();
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.user()?.id).toBe('u-1');

    await auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('hasValidSession() resolves with the current auth state', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MOCK_ADAPTER_CONFIG,
          useValue: { startAuthenticated: true, user: { id: 'u-1' } },
        },
        MockAuthAdapter,
        { provide: AUTH_PROVIDER, useExisting: MockAuthAdapter },
      ],
    });
    const auth = TestBed.inject(AuthService);
    expect(await auth.hasValidSession()).toBe(true);
  });
});
