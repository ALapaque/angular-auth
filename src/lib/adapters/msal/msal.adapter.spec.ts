import { TestBed } from '@angular/core/testing';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  AccountInfo,
  AuthenticationResult,
  EventType,
  InteractionStatus,
  PublicClientApplication,
} from '@azure/msal-browser';
import { BehaviorSubject, Subject, firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MSAL_ADAPTER_CONFIG, MsalAdapterConfig } from './msal-config';
import { MsalAuthAdapter } from './msal.adapter';

function makeAccount(overrides: Partial<AccountInfo> = {}): AccountInfo {
  return {
    homeAccountId: 'h-1',
    environment: 'login.microsoftonline.com',
    tenantId: 't-1',
    username: 'alice@example.com',
    localAccountId: 'l-1',
    name: 'Alice',
    idTokenClaims: { roles: ['contrib'] },
    ...overrides,
  } as AccountInfo;
}

function setup(
  config: MsalAdapterConfig = { interactionType: 'redirect', scopes: ['openid'] },
) {
  const msalSubject$ = new Subject<unknown>();
  const inProgress$ = new BehaviorSubject<InteractionStatus>(InteractionStatus.None);
  let activeAccount: AccountInfo | null = null;
  let allAccounts: AccountInfo[] = [];

  const instance = {
    setActiveAccount: vi.fn((account: AccountInfo | null) => {
      activeAccount = account;
    }),
    getActiveAccount: vi.fn(() => activeAccount),
    getAllAccounts: vi.fn(() => allAccounts),
  } as unknown as PublicClientApplication;

  const msalService = {
    instance,
    initialize: vi.fn().mockReturnValue(of(undefined)),
    handleRedirectObservable: vi.fn().mockReturnValue(of(null as AuthenticationResult | null)),
    loginRedirect: vi.fn().mockReturnValue(of(undefined)),
    loginPopup: vi.fn().mockReturnValue(of({ account: makeAccount() } as AuthenticationResult)),
    logoutRedirect: vi.fn().mockReturnValue(of(undefined)),
    logoutPopup: vi.fn().mockReturnValue(of(undefined)),
    acquireTokenSilent: vi.fn().mockReturnValue(
      of({ accessToken: 'msal-token', account: makeAccount() } as AuthenticationResult),
    ),
  } as unknown as MsalService;

  const broadcast = {
    msalSubject$,
    inProgress$,
  } as unknown as MsalBroadcastService;

  TestBed.configureTestingModule({
    providers: [
      { provide: MsalService, useValue: msalService },
      { provide: MsalBroadcastService, useValue: broadcast },
      { provide: MSAL_ADAPTER_CONFIG, useValue: config },
      MsalAuthAdapter,
    ],
  });

  return {
    adapter: TestBed.inject(MsalAuthAdapter),
    msalService,
    broadcast: { msalSubject$, inProgress$ },
    setAccounts: (accounts: AccountInfo[]) => {
      allAccounts = accounts;
    },
  };
}

describe('MsalAuthAdapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('hydrates user from existing accounts on init', async () => {
    const { adapter, setAccounts } = setup();
    setAccounts([makeAccount()]);
    await adapter.init();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(true);
    expect((await firstValueFrom(adapter.user$))?.email).toBe('alice@example.com');
  });

  it('reacts to LOGIN_SUCCESS events and sets the active account', async () => {
    const { adapter, msalService, broadcast } = setup();
    await adapter.init();
    const account = makeAccount({ homeAccountId: 'h-42' });
    broadcast.msalSubject$.next({
      eventType: EventType.LOGIN_SUCCESS,
      payload: { account } as AuthenticationResult,
    });
    expect(msalService.instance.setActiveAccount).toHaveBeenCalledWith(account);
  });

  it('login() uses loginPopup when interactionType is popup', async () => {
    const { adapter, msalService } = setup({ interactionType: 'popup', scopes: ['User.Read'] });
    await adapter.init();
    await adapter.login();
    expect(msalService.loginPopup).toHaveBeenCalled();
    expect(msalService.loginRedirect).not.toHaveBeenCalled();
  });

  it('login() uses loginRedirect by default', async () => {
    const { adapter, msalService } = setup();
    await adapter.init();
    await adapter.login({ redirectUrl: '/back' });
    expect(msalService.loginRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ redirectStartPage: '/back' }),
    );
  });

  it('getAccessToken() returns null when no active account', async () => {
    const { adapter } = setup();
    await adapter.init();
    expect(await adapter.getAccessToken()).toBeNull();
  });

  it('getAccessToken() returns the silent-acquired token when an account is active', async () => {
    const { adapter, setAccounts, msalService } = setup();
    setAccounts([makeAccount()]);
    await adapter.init();
    // the init sequence sets the first account active via broadcast events; simulate it directly:
    (msalService.instance.setActiveAccount as ReturnType<typeof vi.fn>)(makeAccount());
    expect(await adapter.getAccessToken()).toBe('msal-token');
  });
});
