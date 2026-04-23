import { Injectable, OnDestroy, inject } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { AuthProvider } from '../../core/auth-provider';
import { AuthUser } from '../../core/auth-user';
import {
  LoginOptions,
  LogoutOptions,
  TokenOptions,
} from '../../core/auth-options';
import {
  FIREBASE_ADAPTER_CONFIG,
  FirebaseLoginStrategy,
} from './firebase-config';

@Injectable()
export class FirebaseAuthAdapter implements AuthProvider, OnDestroy {
  private readonly config = inject(FIREBASE_ADAPTER_CONFIG);

  private app?: FirebaseApp;
  private auth?: Auth;
  private initPromise?: Promise<void>;
  private unsubscribe?: () => void;

  private readonly user_ = new BehaviorSubject<User | null>(null);
  private readonly loading_ = new BehaviorSubject<boolean>(true);

  readonly user$: Observable<AuthUser | null> = this.user_.pipe(map(toAuthUser));
  readonly isAuthenticated$: Observable<boolean> = this.user_.pipe(
    map((user) => user !== null),
  );
  readonly isLoading$: Observable<boolean> = this.loading_.asObservable();

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.app = initializeApp(this.config.firebaseOptions);
      this.auth = getAuth(this.app);
      try {
        await getRedirectResult(this.auth);
      } catch {
        // Not a redirect callback — ignore.
      }
      await new Promise<void>((resolve) => {
        this.unsubscribe = onAuthStateChanged(this.auth!, (user) => {
          this.user_.next(user);
          this.loading_.next(false);
          resolve();
        });
      });
    })();

    return this.initPromise;
  }

  async login(options?: LoginOptions): Promise<void> {
    const auth = this.requireAuth();
    const strategy =
      (options?.extra?.['strategy'] as FirebaseLoginStrategy | undefined) ??
      this.config.defaultStrategy;
    if (!strategy) {
      throw new Error(
        'FirebaseAuthAdapter: no login strategy configured. Pass `defaultStrategy` to provideFirebase() or LoginOptions.extra.strategy.',
      );
    }
    switch (strategy.type) {
      case 'email-password':
        await signInWithEmailAndPassword(auth, strategy.email, strategy.password);
        return;
      case 'popup':
        await signInWithPopup(auth, strategy.provider);
        return;
      case 'redirect':
        await signInWithRedirect(auth, strategy.provider);
        return;
      case 'custom':
        await signInWithCustomToken(auth, strategy.token);
        return;
      case 'anonymous':
        await signInAnonymously(auth);
        return;
    }
  }

  async logout(_options?: LogoutOptions): Promise<void> {
    await signOut(this.requireAuth());
  }

  async getAccessToken(options?: TokenOptions): Promise<string | null> {
    const user = this.requireAuth().currentUser;
    if (!user) return null;
    return user.getIdToken(options?.forceRefresh ?? false);
  }

  async handleRedirectCallback(): Promise<void> {
    await getRedirectResult(this.requireAuth());
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }

  private requireAuth(): Auth {
    if (!this.auth) {
      throw new Error('FirebaseAuthAdapter: init() must complete before use.');
    }
    return this.auth;
  }
}

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email ?? undefined,
    name: user.displayName ?? undefined,
    picture: user.photoURL ?? undefined,
    raw: {
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      providerId: user.providerId,
      tenantId: user.tenantId,
    },
  };
}
