# generic-angular-auth

Pluggable Angular authentication layer. One `AuthService` façade, one `authGuard`, one `authInterceptor` — switch the underlying provider (OIDC, MSAL, Firebase, JWT, Mock) by changing a single line in your bootstrap.

## Why

Angular apps tend to couple to whichever auth SDK was picked on day one. When the team wants to migrate from, say, Keycloak to Auth0, or support both during a transition, every component that reads `user$` or `getAccessToken()` needs to change. This package puts a thin, stable contract in front of the SDK so the rest of the app never has to know.

## Install

```bash
npm install generic-angular-auth

# then install only the SDK(s) for the adapter(s) you actually use
npm install angular-auth-oidc-client         # for OIDC (Auth0, Keycloak, Okta, Cognito, ...)
npm install @azure/msal-browser @azure/msal-angular   # for MSAL
npm install firebase                         # for Firebase
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
      ┌───────┬────┴─────┬─────────┬────────┐
      ▼       ▼          ▼         ▼        ▼
    OIDC    MSAL     Firebase    JWT      Mock
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

### 4. JWT — custom backend

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

### 5. Mock — dev & tests

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

A minimal standalone Angular app lives under `demo/`. It boots with the **Mock** adapter so it runs offline with no credentials — switching providers is a single line in `demo/src/app/app.config.ts`.

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

Current coverage: `MockAuthAdapter`, `JwtAuthAdapter` (login / refresh / expiry / storage / custom response mapping), `AuthService` façade, `authInterceptor` (matching rules).

## What's out of scope (for now)

- SAML / CAS — protocol support belongs in a separate adapter
- Passkeys / WebAuthn — planned, but spec is still shifting
- Server-side session renewal strategies — each adapter uses its SDK's defaults
