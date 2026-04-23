import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CodeBlockComponent } from './code-block.component';

@Component({
  selector: 'app-docs-overview',
  standalone: true,
  imports: [CodeBlockComponent, RouterLink],
  template: `
    <h1>Overview</h1>
    <p class="lede">
      One Angular service, one guard, one interceptor — swap the auth provider
      (OIDC, MSAL, Firebase, Supabase, JWT, Mock) by changing a single line at
      bootstrap.
    </p>

    <h2>Why</h2>
    <p>
      Angular apps tend to couple to whichever auth SDK was picked on day one.
      Migrating from Keycloak to Auth0, or supporting both during a transition,
      forces every component that reads <code>user</code> or calls
      <code>getAccessToken()</code> to change. This library puts a thin,
      stable contract in front of the SDK so the rest of the app never has
      to know.
    </p>

    <h2>At a glance</h2>
    <div class="surface-muted adapters-table">
      <table>
        <thead>
          <tr>
            <th>Adapter</th>
            <th>Covers</th>
            <th>Peer SDK</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><a routerLink="/docs/adapters/oidc">OIDC</a></td><td>Auth0, Keycloak, Okta, Cognito, Zitadel, Authentik, Google…</td><td><code>angular-auth-oidc-client</code></td></tr>
          <tr><td><a routerLink="/docs/adapters/msal">MSAL</a></td><td>Azure AD / Entra ID</td><td><code>&#64;azure/msal-angular</code></td></tr>
          <tr><td><a routerLink="/docs/adapters/firebase">Firebase</a></td><td>Firebase Authentication</td><td><code>firebase</code></td></tr>
          <tr><td><a routerLink="/docs/adapters/supabase">Supabase</a></td><td>Supabase Auth (password / OTP / OAuth)</td><td><code>&#64;supabase/supabase-js</code></td></tr>
          <tr><td><a routerLink="/docs/adapters/jwt">JWT</a></td><td>Your own backend</td><td>— (HttpClient only)</td></tr>
          <tr><td><a routerLink="/docs/adapters/mock">Mock</a></td><td>Dev &amp; tests</td><td>— (in-memory)</td></tr>
        </tbody>
      </table>
    </div>

    <h2>30-second tour</h2>
    <app-code [code]="bootstrapSample" />
    <app-code [code]="useInComponentSample" />
    <p>
      Read on for the full <a routerLink="/docs/install">install &amp;
      bootstrap</a> guide, or jump to an adapter page.
    </p>
  `,
  styles: [
    `
      .adapters-table {
        padding: 0;
        overflow: hidden;
      }
      .adapters-table table { font-size: var(--fs-sm); }
    `,
  ],
})
export class DocsOverviewComponent {
  readonly bootstrapSample = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth, provideOidc, authInterceptor } from 'generic-angular-auth';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAuth(
      provideOidc({
        authority: 'https://your-tenant.auth0.com',
        clientId: 'abc123',
        redirectUrl: window.location.origin,
      }),
      { protectedResourceUrls: ['https://api.example.com'] },
    ),
  ],
});`;

  readonly useInComponentSample = `@Component({ /* ... */ })
export class HeaderComponent {
  readonly auth = inject(AuthService);
  // auth.user() / auth.isAuthenticated() — signals
  // auth.login() / auth.logout() / auth.getAccessToken()
}`;
}
