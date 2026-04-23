import { TestBed } from '@angular/core/testing';
import type { Auth, User } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted mocks for firebase/app and firebase/auth.
const mocks = vi.hoisted(() => {
  const state: {
    currentUser: User | null;
    authStateCb: ((user: User | null) => void) | null;
    auth: Auth | null;
  } = { currentUser: null, authStateCb: null, auth: null };

  return {
    state,
    initializeApp: vi.fn(() => ({})),
    getAuth: vi.fn(() => {
      // Proxy so `auth.currentUser` always reflects the latest mock state.
      state.auth = new Proxy({} as Auth, {
        get: (_t, prop) => (prop === 'currentUser' ? state.currentUser : undefined),
      });
      return state.auth;
    }),
    onAuthStateChanged: vi.fn((_auth: Auth, cb: (u: User | null) => void) => {
      state.authStateCb = cb;
      // Mirror Firebase behaviour: emit current state immediately.
      queueMicrotask(() => cb(state.currentUser));
      return () => {
        state.authStateCb = null;
      };
    }),
    getRedirectResult: vi.fn().mockResolvedValue(null),
    signInWithEmailAndPassword: vi.fn(async (_auth: Auth, email: string) => {
      const user = { uid: 'u-1', email, getIdToken: vi.fn().mockResolvedValue('fb-token') } as unknown as User;
      state.currentUser = user;
      state.authStateCb?.(user);
      return { user };
    }),
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(),
    signInWithCustomToken: vi.fn(),
    signInAnonymously: vi.fn(),
    signOut: vi.fn(async () => {
      mocks.state.currentUser = null;
      mocks.state.authStateCb?.(null);
    }),
  };
});

vi.mock('firebase/app', () => ({
  initializeApp: mocks.initializeApp,
}));

vi.mock('firebase/auth', () => ({
  getAuth: mocks.getAuth,
  onAuthStateChanged: mocks.onAuthStateChanged,
  getRedirectResult: mocks.getRedirectResult,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signInWithPopup: mocks.signInWithPopup,
  signInWithRedirect: mocks.signInWithRedirect,
  signInWithCustomToken: mocks.signInWithCustomToken,
  signInAnonymously: mocks.signInAnonymously,
  signOut: mocks.signOut,
}));

import {
  FIREBASE_ADAPTER_CONFIG,
  FirebaseAdapterConfig,
} from './firebase-config';
import { FirebaseAuthAdapter } from './firebase.adapter';

function setup(config: Partial<FirebaseAdapterConfig> = {}) {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: FIREBASE_ADAPTER_CONFIG,
        useValue: {
          firebaseOptions: { apiKey: 'x', authDomain: 'y', projectId: 'z' },
          ...config,
        } satisfies FirebaseAdapterConfig,
      },
      FirebaseAuthAdapter,
    ],
  });
  return TestBed.inject(FirebaseAuthAdapter);
}

describe('FirebaseAuthAdapter', () => {
  beforeEach(() => {
    mocks.state.currentUser = null;
    mocks.state.authStateCb = null;
    vi.clearAllMocks();
  });

  it('init() bootstraps the Firebase app and resolves once auth state arrives', async () => {
    const adapter = setup();
    await adapter.init();
    expect(mocks.initializeApp).toHaveBeenCalled();
    expect(mocks.getAuth).toHaveBeenCalled();
    expect(mocks.onAuthStateChanged).toHaveBeenCalled();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
  });

  it('login() with email-password updates the user stream', async () => {
    const adapter = setup({
      defaultStrategy: { type: 'email-password', email: 'a@b.c', password: 'pw' },
    });
    await adapter.init();
    await adapter.login();
    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalled();
    const user = await firstValueFrom(adapter.user$);
    expect(user?.id).toBe('u-1');
    expect(user?.email).toBe('a@b.c');
  });

  it('throws when no strategy is configured', async () => {
    const adapter = setup();
    await adapter.init();
    await expect(adapter.login()).rejects.toThrow(/no login strategy/);
  });

  it('getAccessToken() calls user.getIdToken()', async () => {
    const adapter = setup({
      defaultStrategy: { type: 'email-password', email: 'a@b.c', password: 'pw' },
    });
    await adapter.init();
    await adapter.login();
    expect(await adapter.getAccessToken()).toBe('fb-token');
  });

  it('logout() clears the user', async () => {
    const adapter = setup({
      defaultStrategy: { type: 'email-password', email: 'a@b.c', password: 'pw' },
    });
    await adapter.init();
    await adapter.login();
    await adapter.logout();
    expect(mocks.signOut).toHaveBeenCalled();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
  });
});
