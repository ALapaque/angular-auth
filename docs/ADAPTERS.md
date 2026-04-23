# Adapter implementation notes

Technical notes for maintainers. For usage see the README and the in-app docs.

## OIDC (`angular-auth-oidc-client`)

- **Works with:** any OIDC-compliant issuer — Auth0, Keycloak, Okta, Cognito, Zitadel, Authentik, Entra External ID, Google Identity.
- **Why this SDK:** broadest OIDC compatibility in the Angular ecosystem, active maintenance, supports silent renew and refresh tokens.
- **Init:** `checkAuth()` is called once and cached via a `initPromise`. The SDK handles its own redirect callback internally when the URL contains `code=...`.
- **Claim mapping:** `sub → id`; name falls back to `preferred_username` (Keycloak default); roles come from `realm_access.roles` (Keycloak), then top-level `roles`, then `cognito:groups` (Cognito).
- **Known issue:** `angular-auth-oidc-client`'s `authorize()` returns void synchronously — we can't await an actual redirect. Callers expecting `login()` to resolve before navigation change should use popup flows from a different adapter.

## MSAL (`@azure/msal-angular`)

- **Works with:** Azure AD / Entra ID (workforce and External ID).
- **Why this SDK:** official Microsoft bindings; PKCE, on-behalf-of and cache policies come built-in.
- **Init:** `initialize()` then `handleRedirectObservable()` — both must be awaited before touching accounts.
- **Active account:** MSAL supports multiple cached accounts. We default to the result of `handleRedirectObservable` (fresh login) then fall back to the first cached account. `setActiveAccount` is called on every observed `LOGIN_SUCCESS` / `ACQUIRE_TOKEN_SUCCESS` event to keep the SDK's singleton in sync.
- **Silent token:** `acquireTokenSilent` is the canonical read path; failures are swallowed and we return `null` (per contract).
- **Interaction type:** defaults to `redirect`. `popup` is a better UX on desktop but blocked by browsers in iframes.

## Firebase (`firebase/auth`)

- **Works with:** Firebase Authentication — email/password, popup and redirect OAuth providers, anonymous, custom token.
- **Init:** `initializeApp` + `getAuth` + a first `getRedirectResult()` (swallowed on non-callback pages) + `onAuthStateChanged` subscription. We resolve `init()` on the first state emission, which Firebase guarantees to fire once per boot.
- **Strategy pattern:** `login()` dispatches on `strategy.type` because the Firebase SDK has one function per pathway. Strategy can come from config (`defaultStrategy`) or per-call (`options.extra.strategy`).
- **Token:** `user.getIdToken(forceRefresh?)` — Firebase auto-refreshes the ID token ~5 minutes before expiry; `forceRefresh: true` bypasses the cache.
- **Out of scope:** phone auth, multi-factor. Both are reachable by injecting `FirebaseAuthAdapter` and calling `requireAuth()` directly, but they don't fit the unified contract.

## Supabase (`@supabase/supabase-js`)

- **Works with:** any Supabase project (hosted or self-hosted).
- **Init:** `createClient(url, anonKey, opts)` then `getSession()` to hydrate, then `onAuthStateChange` for live updates. Subscription is torn down in `ngOnDestroy`.
- **Strategy pattern:** mirrors Firebase — `password`, `otp` (magic link), `oauth` (github/google/...). Persistent session is kept in localStorage by the SDK.
- **Token refresh:** the SDK refreshes automatically in the background; we only call `refreshSession()` when the caller passes `{ forceRefresh: true }`.
- **Role mapping:** reads `app_metadata.roles` (array or string). `user_metadata.full_name` and `user_metadata.avatar_url` feed `name` and `picture`.

## JWT (custom backend)

- **Works with:** any backend that exposes login / refresh / logout endpoints returning a JWT.
- **No SDK:** implemented entirely with `HttpClient`. Consumers must have `provideHttpClient()` in their app.
- **Response shape:** `accessToken` / `refreshToken` / `expiresAt` by default. `access_token` / `refresh_token` / `exp` are also recognised. Fully custom shapes plug in via `mapLoginResponse` / `mapRefreshResponse`.
- **Expiry:** `expiresAt` is derived from the JWT's `exp` claim if not present in the response. A 30-second safety window triggers silent refresh inside `getAccessToken()`.
- **Storage:** `local` / `session` / `memory`. `memory` disables persistence across reloads; useful in tests.
- **Claim mapping:** same logic as OIDC; pluggable through `mapUser`.

## Mock (in-memory)

- **Works with:** nothing. Pure in-memory state.
- **Use cases:** Storybook, Playwright/Cypress E2E, unit tests of downstream services, local dev with no backend.
- **Test helper:** `MockAuthAdapter.setUser(user | null)` flips state synchronously — injects cleanly into `TestBed` for table-driven tests of feature code.
- **Configurable latency:** `latencyMs` delays every async call, useful to prove loading-state UI without a real slow network.

## Cross-cutting observations

- **Redirect-callback timing.** OIDC, MSAL and Firebase all need to process the URL hash / query **before** Angular router can navigate. The `APP_INITIALIZER` ensures this by awaiting `init()` before the app boots. If you add an adapter with a redirect flow, use the same pattern — do not defer the callback to a route resolver.
- **`isLoading$` emission rules.** Emit `true` while redirects or popups are in flight **and** during `init()`. Emit `false` once the user state is authoritative. Components gate spinner display on this signal; getting it wrong produces a flicker of "not signed in" UI on reload.
- **`user$` rewire after logout.** Every adapter must emit `null` synchronously during `logout()`, before awaiting the server round-trip. Otherwise, components that key off `isAuthenticated` observe a "phantom user" between click and network response.
