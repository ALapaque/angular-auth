import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CodeBlockComponent } from './code-block.component';

@Component({
  selector: 'app-docs-install',
  standalone: true,
  imports: [CodeBlockComponent, RouterLink],
  template: `
    <h1>Install &amp; bootstrap</h1>

    <h2>1. Install the package</h2>
    <app-code [code]="npmInstall" lang="bash" />
    <p>
      Then install only the SDK(s) for the adapter(s) you actually use — all
      of them are declared as optional peer dependencies.
    </p>
    <app-code [code]="peerSdks" lang="bash" />

    <h2>2. Bootstrap</h2>
    <p>The composition root always has the same shape: three providers.</p>
    <app-code [code]="bootstrap" />

    <p>The helpers in the snippet above do exactly what you'd expect:</p>
    <ul>
      <li><code>provideHttpClient(withInterceptors([authInterceptor]))</code> — attaches bearer tokens to outgoing requests whose URL matches <code>protectedResourceUrls</code>.</li>
      <li><code>provideAuth(adapter, config)</code> — registers the <code>AUTH_PROVIDER</code>, runs <code>init()</code> inside <code>APP_INITIALIZER</code>, and exposes <code>AuthCoreConfig</code> to the guard and interceptor.</li>
      <li><code>provideXxx(&#123; ... &#125;)</code> — picks the concrete adapter. Swap this one line to change providers.</li>
    </ul>

    <h2>3. Use <code>AuthService</code></h2>
    <p>
      <code>AuthService</code> is <code>providedIn: 'root'</code> and exposes
      both signals (<code>user()</code>, <code>isAuthenticated()</code>,
      <code>isLoading()</code>) and observables (<code>user$</code>,
      <code>isAuthenticated$</code>, <code>isLoading$</code>).
    </p>
    <app-code [code]="component" />

    <h2>4. Protect routes with <code>authGuard</code></h2>
    <app-code [code]="guard" />
    <p>
      When hit by an unauthenticated user, the guard either redirects to
      <code>AuthCoreConfig.loginRedirectUrl</code> (if configured) or calls
      <code>AuthService.login()</code> with the current URL as
      <code>redirectUrl</code>.
    </p>

    <h2>5. Picking an adapter per environment</h2>
    <p>Real apps rarely hard-code the adapter. Drive it from a config value:</p>
    <app-code [code]="envSwitch" />
    <p>
      See <a routerLink="/docs/adapters/oidc">OIDC</a>,
      <a routerLink="/docs/adapters/msal">MSAL</a>,
      <a routerLink="/docs/adapters/firebase">Firebase</a>,
      <a routerLink="/docs/adapters/supabase">Supabase</a>,
      <a routerLink="/docs/adapters/jwt">JWT</a>, and
      <a routerLink="/docs/adapters/mock">Mock</a> for per-adapter setup.
    </p>
  `,
})
export class DocsInstallComponent {
  readonly npmInstall = 'npm install generic-angular-auth';

  readonly peerSdks = `# OIDC (Auth0, Keycloak, Okta, Cognito, ...)
npm install angular-auth-oidc-client

# MSAL (Azure AD / Entra ID)
npm install @azure/msal-browser @azure/msal-angular

# Firebase
npm install firebase

# Supabase
npm install @supabase/supabase-js

# JWT and Mock have no extra peer dependencies`;

  readonly bootstrap = `// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  provideAuth,
  provideOidc,
  authInterceptor,
} from 'generic-angular-auth';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
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
});`;

  readonly component = `import { Component, inject } from '@angular/core';
import { AuthService } from 'generic-angular-auth';

@Component({
  standalone: true,
  template: \`
    @if (auth.isLoading()) {
      <p>Loading…</p>
    } @else if (auth.isAuthenticated()) {
      <p>Hello {{ auth.user()?.name }}</p>
      <button (click)="auth.logout()">Logout</button>
    } @else {
      <button (click)="auth.login()">Login</button>
    }
  \`,
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
}`;

  readonly guard = `// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from 'generic-angular-auth';

export const routes: Routes = [
  {
    path: 'private',
    canActivate: [authGuard],
    loadComponent: () => import('./private.component').then(m => m.PrivateComponent),
  },
];`;

  readonly envSwitch = `import { environment } from './environments/environment';
import {
  provideOidc, provideMsal, provideFirebase,
  provideSupabase, provideJwt, provideMock,
} from 'generic-angular-auth';

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
});`;
}
