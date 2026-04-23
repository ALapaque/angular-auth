import { TestBed } from '@angular/core/testing';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SUPABASE_ADAPTER_CONFIG, SupabaseAdapterConfig } from './supabase-config';
import { SupabaseAuthAdapter } from './supabase.adapter';

type FakeClient = Pick<SupabaseClient, 'auth'> & {
  auth: {
    getSession: ReturnType<typeof vi.fn>;
    onAuthStateChange: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signInWithOtp: ReturnType<typeof vi.fn>;
    signInWithOAuth: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    refreshSession: ReturnType<typeof vi.fn>;
  };
};

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u-1',
    email: 'a@b.c',
    app_metadata: { roles: ['admin'] },
    user_metadata: { full_name: 'Alice' },
    aud: 'authenticated',
    created_at: '2024-01-01',
    ...overrides,
  } as User;
}

function makeSession(user: User = makeUser()): Session {
  return {
    access_token: 'token-abc',
    refresh_token: 'refresh-abc',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user,
  } as Session;
}

function makeFakeClient(initial: Session | null): {
  client: FakeClient;
  emitAuth: (session: Session | null) => void;
} {
  let authHandler: (event: string, session: Session | null) => void = () => undefined;
  const client: FakeClient = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: initial }, error: null }),
      onAuthStateChange: vi.fn().mockImplementation((cb) => {
        authHandler = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } }, error: null };
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      refreshSession: vi.fn().mockResolvedValue({
        data: { session: { ...makeSession(), access_token: 'token-refreshed' } },
        error: null,
      }),
    },
  };
  return {
    client,
    emitAuth: (session) => authHandler('SIGNED_IN', session),
  };
}

function setup(
  initialSession: Session | null,
  extraConfig: Partial<SupabaseAdapterConfig> = {},
): { adapter: SupabaseAuthAdapter; fake: ReturnType<typeof makeFakeClient> } {
  const fake = makeFakeClient(initialSession);

  TestBed.configureTestingModule({
    providers: [
      {
        provide: SUPABASE_ADAPTER_CONFIG,
        useValue: {
          url: 'https://example.supabase.co',
          anonKey: 'anon',
          ...extraConfig,
        } satisfies SupabaseAdapterConfig,
      },
      SupabaseAuthAdapter,
    ],
  });

  const adapter = TestBed.inject(SupabaseAuthAdapter);
  adapter.setClient(fake.client as unknown as SupabaseClient);
  return { adapter, fake };
}

describe('SupabaseAuthAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hydrates user$ from the initial session', async () => {
    const { adapter } = setup(makeSession());
    await adapter.init();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(true);
    const user = await firstValueFrom(adapter.user$);
    expect(user?.id).toBe('u-1');
    expect(user?.name).toBe('Alice');
    expect(user?.roles).toEqual(['admin']);
  });

  it('reacts to onAuthStateChange emissions', async () => {
    const { adapter, fake } = setup(null);
    await adapter.init();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);

    fake.emitAuth(makeSession(makeUser({ id: 'u-9' })));
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(true);
    expect((await firstValueFrom(adapter.user$))?.id).toBe('u-9');

    fake.emitAuth(null);
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
  });

  it('routes password login to signInWithPassword', async () => {
    const { adapter, fake } = setup(null, {
      defaultStrategy: {
        type: 'password',
        email: 'a@b.c',
        password: 'secret',
      },
    });
    await adapter.init();
    await adapter.login();
    expect(fake.client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.c',
      password: 'secret',
    });
  });

  it('routes OAuth login via LoginOptions.extra.strategy', async () => {
    const { adapter, fake } = setup(null);
    await adapter.init();
    await adapter.login({
      extra: { strategy: { type: 'oauth', provider: 'github' } },
    });
    expect(fake.client.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: { redirectTo: undefined, scopes: undefined },
    });
  });

  it('throws when no strategy is configured', async () => {
    const { adapter } = setup(null);
    await adapter.init();
    await expect(adapter.login()).rejects.toThrow(/no login strategy/);
  });

  it('getAccessToken() returns the current session token', async () => {
    const { adapter } = setup(makeSession());
    await adapter.init();
    expect(await adapter.getAccessToken()).toBe('token-abc');
  });

  it('getAccessToken({ forceRefresh: true }) refreshes via the SDK', async () => {
    const { adapter, fake } = setup(makeSession());
    await adapter.init();
    const token = await adapter.getAccessToken({ forceRefresh: true });
    expect(fake.client.auth.refreshSession).toHaveBeenCalled();
    expect(token).toBe('token-refreshed');
  });

  it('logout() calls signOut', async () => {
    const { adapter, fake } = setup(makeSession());
    await adapter.init();
    await adapter.logout();
    expect(fake.client.auth.signOut).toHaveBeenCalled();
  });
});
