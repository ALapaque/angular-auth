import { Injectable, OnDestroy, inject } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  AccountInfo,
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
  PopupRequest,
  RedirectRequest,
  SilentRequest,
} from '@azure/msal-browser';
import {
  BehaviorSubject,
  Observable,
  Subject,
  firstValueFrom,
  map,
  takeUntil,
} from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthProvider } from '../../core/auth-provider';
import { AuthUser } from '../../core/auth-user';
import {
  LoginOptions,
  LogoutOptions,
  TokenOptions,
} from '../../core/auth-options';
import { MSAL_ADAPTER_CONFIG } from './msal-config';

@Injectable()
export class MsalAuthAdapter implements AuthProvider, OnDestroy {
  private readonly msal = inject(MsalService);
  private readonly broadcast = inject(MsalBroadcastService);
  private readonly config = inject(MSAL_ADAPTER_CONFIG);

  private readonly destroy$ = new Subject<void>();
  private readonly account$ = new BehaviorSubject<AccountInfo | null>(null);
  private readonly loading$ = new BehaviorSubject<boolean>(true);
  private initPromise?: Promise<void>;

  readonly user$: Observable<AuthUser | null> = this.account$.pipe(
    map((account) => toAuthUser(account)),
  );
  readonly isAuthenticated$: Observable<boolean> = this.account$.pipe(
    map((account) => account !== null),
  );
  readonly isLoading$: Observable<boolean> = this.loading$.asObservable();

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      await firstValueFrom(this.msal.initialize());
      const result = await firstValueFrom(this.msal.handleRedirectObservable());
      if (result?.account) {
        this.msal.instance.setActiveAccount(result.account);
      }
      this.refreshAccount();

      this.broadcast.msalSubject$
        .pipe(
          filter(
            (msg: EventMessage) =>
              msg.eventType === EventType.LOGIN_SUCCESS ||
              msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
              msg.eventType === EventType.LOGOUT_SUCCESS ||
              msg.eventType === EventType.ACTIVE_ACCOUNT_CHANGED,
          ),
          takeUntil(this.destroy$),
        )
        .subscribe((msg) => {
          const payload = msg.payload as AuthenticationResult | undefined;
          if (payload?.account) {
            this.msal.instance.setActiveAccount(payload.account);
          }
          this.refreshAccount();
        });

      this.broadcast.inProgress$
        .pipe(takeUntil(this.destroy$))
        .subscribe((status) => this.loading$.next(status !== InteractionStatus.None));
    })();

    return this.initPromise;
  }

  async login(options?: LoginOptions): Promise<void> {
    const scopes = options?.scopes ?? this.config.scopes ?? ['openid', 'profile', 'email'];
    if (this.config.interactionType === 'popup') {
      const request: PopupRequest = { scopes, ...(options?.extra ?? {}) };
      const result = await firstValueFrom(this.msal.loginPopup(request));
      if (result?.account) this.msal.instance.setActiveAccount(result.account);
      this.refreshAccount();
      return;
    }
    const request: RedirectRequest = {
      scopes,
      redirectStartPage: options?.redirectUrl,
      ...(options?.extra ?? {}),
    };
    await firstValueFrom(this.msal.loginRedirect(request));
  }

  async logout(options?: LogoutOptions): Promise<void> {
    if (this.config.interactionType === 'popup') {
      await firstValueFrom(
        this.msal.logoutPopup({ postLogoutRedirectUri: options?.redirectUrl }),
      );
    } else {
      await firstValueFrom(
        this.msal.logoutRedirect({ postLogoutRedirectUri: options?.redirectUrl }),
      );
    }
    this.refreshAccount();
  }

  async getAccessToken(options?: TokenOptions): Promise<string | null> {
    const account = this.msal.instance.getActiveAccount();
    if (!account) return null;

    const request: SilentRequest = {
      account,
      scopes: options?.scopes ?? this.config.scopes ?? ['openid'],
      forceRefresh: options?.forceRefresh,
    };
    try {
      const result = await firstValueFrom(this.msal.acquireTokenSilent(request));
      return result?.accessToken ?? null;
    } catch {
      return null;
    }
  }

  async handleRedirectCallback(): Promise<void> {
    await firstValueFrom(this.msal.handleRedirectObservable());
    this.refreshAccount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private refreshAccount(): void {
    const active = this.msal.instance.getActiveAccount();
    const [first] = this.msal.instance.getAllAccounts();
    this.account$.next(active ?? first ?? null);
  }
}

function toAuthUser(account: AccountInfo | null): AuthUser | null {
  if (!account) return null;
  const claims = (account.idTokenClaims ?? {}) as Record<string, unknown>;
  const rolesClaim = claims['roles'];
  const groupsClaim = claims['groups'];
  const roles = Array.isArray(rolesClaim)
    ? rolesClaim.filter((r): r is string => typeof r === 'string')
    : Array.isArray(groupsClaim)
      ? groupsClaim.filter((g): g is string => typeof g === 'string')
      : undefined;

  return {
    id: account.homeAccountId || account.localAccountId,
    email: account.username,
    name: account.name,
    roles,
    raw: { ...claims, account },
  };
}
