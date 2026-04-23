# generic-angular-auth

[![npm version](https://img.shields.io/npm/v/generic-angular-auth.svg)](https://www.npmjs.com/package/generic-angular-auth)
[![npm downloads](https://img.shields.io/npm/dm/generic-angular-auth.svg)](https://www.npmjs.com/package/generic-angular-auth)
[![license](https://img.shields.io/npm/l/generic-angular-auth.svg)](./LICENSE)

Pluggable Angular authentication layer. One `AuthService` façade, one `authGuard`, one `authInterceptor` — switch the underlying provider (OIDC, MSAL, Firebase, Supabase, JWT, Mock) by changing a single line in your bootstrap.

**Documentation:**
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — design, DI model, invariants, trade-offs
- [`docs/ADAPTERS.md`](./docs/ADAPTERS.md) — per-adapter implementation notes
- [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) — local dev, writing a new adapter, tests, release
- [`SECURITY.md`](./SECURITY.md) — vulnerability disclosure and token-storage guidance
- [`CHANGELOG.md`](./CHANGELOG.md)
- In-app docs site — `npm run demo` then open `/docs` for integration guides with copy-pasteable snippets

## Why

Angular apps tend to couple to whichever auth SDK was picked on day one. When the team wants to migrate from, say, Keycloak to Auth0, or support both during a transition, every component that reads `user$` or `getAccessToken()` needs to change. This package puts a thin, stable contract in front of the SDK so the rest of the app never has to know.

## Install

```bash
npm install generic-angular-auth

# then install only the SDK(s) for the adapter(s) you actually use
npm install angular-auth-oidc-client         # for OIDC (Auth0, Keycloak, Okta, Cognito, ...)
npm install @azure/msal-browser @azure/msal-angular   # for MSAL
npm install firebase                         # for Firebase
npm install @supabase/supabase-js            # for Supabase
# JWT and Mock adapters have no extra peer deps
```

## Core concept

```
┌─────────────────────────────────────────┐
│  Your components / services / guards    │
│     inject(AuthService)                 │
└──────────────────┬──────────────────────┘
                   │   unified contract
                   ▼
            ┌──────────────┐
            │ AuthProvider │  interface
            └──────┬───────┘
      ┌───────┬────┴─────┬──────────┬─────────┬────────┐
      ▼       ▼          ▼          ▼         ▼        ▼
    OIDC    MSAL     Firebase   Supabase    JWT      Mock
```

Components only ever touch `AuthService`. Swapping the provider is a single-file change in the app bootstrap.

## Bootstrap

`provideAuth(<adapter>, <config>)` installs everything:

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideAuth,
  provideOidc,
  authInterceptor,
} from 'generic-angular-auth';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAuth(
      provideOidc({
        authority: 'https://your-tenant.auth0.com',
        clientId: 'abc123',
        redirectUrl: window.location.origin,
      }),
      {
        protectedResourceUrls: ['https://api.example.com'],
      },
    ),
  ],
});
```

## Using it in a component

```ts
import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthService } from 'generic-angular-auth';

@Component({
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (auth.isAuthenticated()) {
      <p>Hello {{ auth.user()?.name }}</p>
      <button (click)="auth.logout()">Logout</button>
    } @else {
      <button (click)="auth.login()">Login</button>
    }
  `,
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
}
```

## Route protection

```ts
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from 'generic-angular-auth';

export const routes: Routes = [
  { path: 'private', loadComponent: () => import('./private.component'), canActivate: [authGuard] },
];
```

## Adapters

### 1. OIDC — Auth0, Keycloak, Okta, Cognito, Zitadel, Authentik, ...

Any spec-compliant OpenID Connect issuer.

```ts
provideAuth(
  provideOidc({
    authority: 'https://your-tenant.auth0.com',    // Auth0
    // authority: 'https://keycloak/realms/my-app', // Keycloak
    // authority: 'https://cognito-idp.<region>.amazonaws.com/<pool>', // Cognito
    clientId: 'abc123',
    redirectUrl: window.location.origin,
    scope: 'openid profile email offline_access',
  }),
);
```

### 2. MSAL — Azure AD / Entra ID

```ts
provideAuth(
  provideMsal({
    clientId: '00000000-0000-0000-0000-000000000000',
    authority: 'https://login.microsoftonline.com/<tenant-id>',
    redirectUri: window.location.origin,
    scopes: ['User.Read'],
    interactionType: 'redirect', // or 'popup'
  }),
);
```

### 3. Firebase

```ts
import { GoogleAuthProvider } from 'firebase/auth';

provideAuth(
  provideFirebase({
    firebaseOptions: {
      apiKey: '...',
      authDomain: '...',
      projectId: '...',
    },
    defaultStrategy: { type: 'popup', provider: new GoogleAuthProvider() },
  }),
);
```

Email-password, custom token and anonymous login are all supported — pick a strategy at config time or pass it per call via `login({ extra: { strategy: {...} } })`.

### 4. Supabase

```ts
provideAuth(
  provideSupabase({
    url: 'https://xyz.supabase.co',
    anonKey: '...',
    defaultStrategy: { type: 'password', email: 'a@b.c', password: 'secret' },
    // or { type: 'oauth', provider: 'github' }
    // or { type: 'otp', email: 'a@b.c' }  (magic link)
  }),
);
```

The adapter wraps `@supabase/supabase-js` — OAuth providers (github, google, discord…), password, OTP and session refresh all go through the unified `AuthService`.

### 5. JWT — custom backend

```ts
provideAuth(
  provideJwt({
    loginUrl: 'https://api.example.com/auth/login',
    refreshUrl: 'https://api.example.com/auth/refresh',
    logoutUrl: 'https://api.example.com/auth/logout',
    storage: 'local',
  }),
);

// usage:
auth.login({ extra: { email: 'foo@bar.com', password: 'secret' } });
```

`mapLoginResponse` and `mapUser` let you adapt any backend shape without changing the call sites.

### 6. Mock — dev & tests

```ts
provideAuth(
  provideMock({
    startAuthenticated: true,
    user: { id: 'u1', name: 'Alice', email: 'alice@test.dev', roles: ['admin'] },
  }),
);
```

Injecting `MockAuthAdapter` in a test gives you `setUser(user | null)` for flipping state synchronously between scenarios.

## Switching providers in practice

In most teams the choice is an environment concern, not a code concern:

```ts
// bootstrap helper
import { environment } from './environments/environment';

function authFeature() {
  switch (environment.auth.kind) {
    case 'oidc':     return provideOidc(environment.auth.config);
    case 'msal':     return provideMsal(environment.auth.config);
    case 'firebase': return provideFirebase(environment.auth.config);
    case 'supabase': return provideSupabase(environment.auth.config);
    case 'jwt':      return provideJwt(environment.auth.config);
    case 'mock':     return provideMock(environment.auth.config);
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAuth(authFeature()),
  ],
});
```

## Writing your own adapter

Implement `AuthProvider`, expose a `provideXxx()` that wires it behind the `AUTH_PROVIDER` token:

```ts
@Injectable()
class MyAdapter implements AuthProvider {
  readonly user$ = /* ... */;
  readonly isAuthenticated$ = /* ... */;
  readonly isLoading$ = /* ... */;
  init(): Promise<void> { /* ... */ }
  login(): Promise<void> { /* ... */ }
  logout(): Promise<void> { /* ... */ }
  getAccessToken(): Promise<string | null> { /* ... */ }
}

export function provideMyAdapter(config: MyConfig): AuthAdapterFeature {
  return {
    providers: [
      { provide: MY_CONFIG, useValue: config },
      MyAdapter,
      { provide: AUTH_PROVIDER, useExisting: MyAdapter },
    ],
  };
}
```

## Running the demo

A minimal standalone Angular app lives under `demo/`. It boots with the **Mock** adapter so it runs offline with no credentials — switching providers is a single line in `demo/src/app/app.config.ts`. The demo also ships with a live **adapter switcher** in the UI (backed by localStorage + reload) showing how different Mock configurations behave with the exact same components.

```bash
npm install
npm run demo         # ng serve demo → http://localhost:4200
npm run demo:build   # production build into dist/demo
```

## Running the test suite

```bash
npm test             # Vitest + @analogjs/vitest-angular, jsdom
npm run test:watch
```

Current coverage (42 specs): every adapter has its own spec with the upstream SDK mocked via `vi.mock` — `MockAuthAdapter`, `JwtAuthAdapter` (login / refresh / expiry / storage / custom response mapping), `OidcAuthAdapter` (Keycloak + Cognito claim shapes), `MsalAuthAdapter` (event subjects, redirect vs popup, silent token), `FirebaseAuthAdapter` (auth state, strategies, id token), `SupabaseAuthAdapter` (session hydration, `onAuthStateChange`, password / OAuth / OTP strategies, refresh). Plus `AuthService` façade and `authInterceptor` matching rules.

## Security

> Full details in [`SECURITY.md`](./SECURITY.md). Quick summary for integrators:

- **Never use `protectedResourceUrls: ['*']` in production.** It leaks your users' tokens to every domain you call — including third-party APIs, CDNs and analytics. Always list your own API origins explicitly.
- **`localStorage` is readable by any script on your origin.** A single XSS vulnerability exfiltrates every stored token. The JWT adapter defaults to `local` for DX; switch to `storage: 'session'` (per-tab) or `storage: 'memory'` (no persistence) for high-sensitivity apps, or move auth to HttpOnly server cookies.
- **Register redirect URIs strictly at your identity provider.** Never accept open redirects.
- **Review `npm audit` output** before every release. CI runs it automatically via `.github/workflows/ci.yml`.
- **Report vulnerabilities privately** via the GitHub security advisory link in `SECURITY.md` — never in a public issue.

## What's out of scope (for now)

- SAML / CAS — protocol support belongs in a separate adapter
- Passkeys / WebAuthn — planned, but spec is still shifting
- Server-side session renewal strategies — each adapter uses its SDK's defaults
