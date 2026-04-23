# Architecture

`generic-angular-auth` is an abstraction + a family of adapters. This document explains the design, the invariants every adapter must honour, and the trade-offs that shape the public surface.

## 1. Design goals

1. **Stable surface for the application.** Components, guards and interceptors depend on one service (`AuthService`) and one DI token (`AUTH_PROVIDER`). Swapping the underlying auth SDK never requires touching feature code.
2. **Thin adapters.** Each adapter does only two jobs: (a) bootstrap and own its SDK, (b) translate SDK-specific state and calls into the unified `AuthProvider` contract. No business logic, no cross-provider shims.
3. **Pay only for what you use.** Every SDK peer dependency is declared as `optional`. Installing `generic-angular-auth` alone pulls in nothing beyond Angular and RxJS.
4. **Escape hatch by default.** `AuthUser.raw` preserves the original claims object so callers can reach provider-specific data without forking the adapter.

## 2. Module graph

```
  ┌────────────────────────────────────────────────────────────────┐
  │ application code (components, guards, interceptors, services)  │
  └────────────────────────────┬───────────────────────────────────┘
                               │  injects AuthService
                               ▼
  ┌────────────────────────────────────────────────────────────────┐
  │ core/                                                          │
  │   AuthService            (facade, signals + observables)       │
  │   AUTH_PROVIDER          (DI token)                            │
  │   AuthProvider           (interface adapters implement)        │
  │   authGuard, authInterceptor                                   │
  │   provideAuth()          (composition root)                    │
  │   AUTH_CORE_CONFIG       (interceptor / guard config)          │
  └────────────────────────────┬───────────────────────────────────┘
                               │  { provide: AUTH_PROVIDER, useExisting: XxxAdapter }
                               ▼
  ┌────────────────────────────────────────────────────────────────┐
  │ adapters/                                                      │
  │   oidc/      (wraps angular-auth-oidc-client)                  │
  │   msal/      (wraps @azure/msal-angular)                       │
  │   firebase/  (wraps firebase/auth)                             │
  │   supabase/  (wraps @supabase/supabase-js)                     │
  │   jwt/       (HttpClient-only, no external SDK)                │
  │   mock/      (no SDK, purely in-memory)                        │
  └────────────────────────────────────────────────────────────────┘
```

Dependency direction is strict: adapters depend on core, never the other way around. Core never imports from an adapter.

## 3. The `AuthProvider` contract

```ts
export interface AuthProvider {
  readonly user$: Observable<AuthUser | null>;
  readonly isAuthenticated$: Observable<boolean>;
  readonly isLoading$: Observable<boolean>;

  init(): Promise<void>;
  login(options?: LoginOptions): Promise<void>;
  logout(options?: LogoutOptions): Promise<void>;
  getAccessToken(options?: TokenOptions): Promise<string | null>;
  handleRedirectCallback?(): Promise<void>;
}
```

Invariants every adapter must honour:

| Invariant | Why |
|---|---|
| `init()` is **idempotent** and safe to call multiple times. | `APP_INITIALIZER` triggers one call; guards trigger another before routing. |
| `user$` and `isAuthenticated$` are **BehaviorSubject-style**: subscribers receive the current value immediately. | Guards and components read the current state synchronously via `firstValueFrom`. |
| `isAuthenticated$` never emits `undefined`. Before the first resolution, the adapter emits `false`. | Prevents guards from blocking forever on providers that have no session. |
| `isLoading$` emits `true` while `init()` is unresolved or during active redirects/popups, `false` otherwise. | Components show a spinner during bootstrap, not a flash of "unauthenticated" UI. |
| `getAccessToken()` returns `null` (never throws) when there is no session or the refresh fails. | Callers (notably the interceptor) check for `null` instead of wrapping every call in try/catch. |
| `login()` **does not** resolve until the session is fully established **or** the flow has handed the tab off to an external redirect. | Callers can `await login()` and then read `isAuthenticated()` safely in flows that don't redirect. |
| `logout()` clears the in-memory state synchronously and resolves after the provider has acknowledged it. | Components update immediately; backend calls complete before the promise settles. |
| `AuthUser.id` is **always** a stable identifier (never a display name). | Rules that key off user id — cache keys, analytics events — stay correct across providers. |

## 4. Bootstrap lifecycle

```
bootstrapApplication(AppComponent, { providers: [provideAuth(provideXxx(...))] })
        │
        ▼
Angular resolves AuthService singleton (providedIn: 'root')
        │
        ▼
APP_INITIALIZER runs  →  AuthService.init()  →  AuthProvider.init()
                                                     │
                                                     ├── bootstrap SDK (e.g. initializeApp, createClient)
                                                     ├── handle potential redirect callback
                                                     └── seed user$ / isAuthenticated$ / isLoading$
        │
        ▼
Routes resolve; authGuard may call init() again (no-op) then firstValueFrom(isAuthenticated$)
        │
        ▼
Components read auth.user() / auth.isAuthenticated() signals
```

Because `init()` is awaited inside `APP_INITIALIZER`, components never see an uninitialised `AuthService`.

## 5. Why `AuthAdapterFeature` instead of a plain array of providers

`provideAuth(<feature>, <config>)` takes one opaque `AuthAdapterFeature` rather than raw providers. Two reasons:

- **Enforces one provider at a time.** An application cannot accidentally register two adapters — the `provideXxx()` helpers always alias `AUTH_PROVIDER` to a single class, and `provideAuth()` funnels them through one entrypoint.
- **Keeps room for adapter-specific `EnvironmentProviders`.** OIDC in particular returns `EnvironmentProviders` from `angular-auth-oidc-client.provideAuth()`. The feature type is `Array<Provider | EnvironmentProviders>` and `makeEnvironmentProviders([...])` accepts both.

## 6. Config layering

There are three levels of configuration, from lowest to highest precedence:

1. **Adapter defaults** — hard-coded in each `provideXxx()`. Example: OIDC sets `silentRenew: true`, MSAL defaults to `redirect`.
2. **Adapter config** — the object you pass to `provideXxx({ ... })`. Supersedes defaults.
3. **Per-call options** — `login({ scopes: [...] })`, `getAccessToken({ forceRefresh: true })`. Supersedes the adapter config for that call only.

Plus one cross-cutting config for the core helpers:

- `AuthCoreConfig` — `protectedResourceUrls` (for `authInterceptor`), `loginRedirectUrl` (for `authGuard`).

## 7. Escape hatches

The abstraction is intentionally narrow. For anything outside the contract:

- **Raw claims:** `auth.user()?.raw` holds the provider-native shape (Keycloak realm access, MSAL `idTokenClaims`, Firebase `emailVerified`, etc.).
- **Direct SDK access:** all adapters are regular `@Injectable()` classes; `inject(OidcAuthAdapter)` then `.oidc` (the underlying `OidcSecurityService`) is supported when the application genuinely needs provider-specific APIs. Keep these calls out of shared components — isolate them behind a service you own so the abstraction isn't leaking through your UI.
- **Extra login params:** `login({ extra: { ... } })`. Adapters forward `extra` to the SDK verbatim; shape depends on the provider (customParams for OIDC, strategy for Firebase/Supabase, any MSAL request field, body fields for JWT).

## 8. Threading and async behaviour

Angular's `inject()` is zone-aware but the library makes no assumption about zone.js: everything that would traditionally live in an observable is also exposed as a signal via `toSignal()`, so zoneless applications work out of the box.

Redirect flows (OIDC, MSAL, Firebase `signInWithRedirect`, Supabase OAuth) navigate away from the tab; the subsequent bootstrap calls `handleRedirectCallback()` (either implicitly, via `init()`, or explicitly in the application) to settle the session.

Popup flows resolve `login()` only after the popup closes; silent token acquisition runs as part of `getAccessToken()`.

## 9. Known trade-offs

- **Lowest-common-denominator API.** `AuthProvider` covers login / logout / access token / user. Provider-specific features (Auth0 passwordless, MSAL on-behalf-of, Firebase phone auth, Supabase RLS helpers) are **not** part of the abstraction. They stay reachable via the direct SDK but the unified contract does not try to encompass them.
- **Single active session per bootstrap.** Applications that need simultaneous Auth0 + MSAL sessions (e.g. B2B + B2C) should instantiate multiple named injection contexts; the library does not model multi-tenant sessions by itself.
- **Token refresh ownership.** We let the underlying SDK own refresh (`angular-auth-oidc-client` silent renew, MSAL silent acquisition, Firebase auto-refresh, Supabase auto-refresh). The JWT adapter is the only one where the library refreshes directly, because there is no SDK behind it.

## 10. Testing strategy

- **Adapter specs** use `vi.mock` (Firebase) or fake DI values (OIDC, MSAL, Supabase) to isolate the adapter from its SDK. Contract compliance is verified per adapter, not through a shared test suite — provider behaviours differ enough that a shared battery would become a pile of conditional branches.
- **Core specs** use `MockAuthAdapter` as the `AUTH_PROVIDER` to exercise `AuthService`, `authInterceptor` and downstream logic without touching a real SDK.
- **No e2e in-tree.** The demo app is the e2e harness; it runs against `MockAuthAdapter` so it needs no credentials.
