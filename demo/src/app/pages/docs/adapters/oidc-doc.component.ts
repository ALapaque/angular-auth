import { Component } from '@angular/core';

import { CodeBlockComponent } from '../code-block.component';
import { PackageInstallComponent } from '../package-install.component';

@Component({
  selector: 'app-docs-oidc',
  standalone: true,
  imports: [CodeBlockComponent, PackageInstallComponent],
  template: `
    <h1>OIDC adapter</h1>
    <p class="lede">
      Works with any OpenID Connect–compliant issuer: Auth0, Keycloak, Okta,
      AWS Cognito, Zitadel, Authentik, Google Identity, Entra External ID.
    </p>

    <div class="callout">
      <div>
        <p><strong>What you get.</strong> PKCE by default, silent refresh
          via iframe or refresh tokens, SSR-safe initialisation, and the
          same <code>AuthService</code> surface every other adapter
          exposes.</p>
        <p class="muted" style="margin-top: var(--sp-2);">
          Peer dep: <code>angular-auth-oidc-client</code> — installed
          alongside <code>&#64;amaurylapaque/angular-auth</code>.
        </p>
      </div>
    </div>

    <h2>Install</h2>
    <app-package-install [groups]="installGroups" />

    <h2>Bootstrap — the shape</h2>
    <p>
      Every issuer plugs in with the same call. Only three fields are
      mandatory: <code>authority</code>, <code>clientId</code> and
      <code>redirectUrl</code>.
    </p>
    <app-code [code]="bootstrap" title="main.ts" />

    <h2>Configuration</h2>
    <table class="params">
      <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>authority</code></td><td>string</td><td>Issuer URL (e.g. <code>https://tenant.auth0.com</code>, <code>https://keycloak/realms/my-app</code>).</td></tr>
        <tr><td><code>clientId</code></td><td>string</td><td>OAuth client id registered in the issuer.</td></tr>
        <tr><td><code>redirectUrl</code></td><td>string</td><td>Where the issuer redirects back after login. Usually <code>window.location.origin</code>.</td></tr>
        <tr><td><code>postLogoutRedirectUri</code></td><td>string?</td><td>Where the issuer redirects after logout. Defaults to <code>redirectUrl</code>.</td></tr>
        <tr><td><code>scope</code></td><td>string?</td><td>Space-separated scopes. Default: <code>openid profile email</code>.</td></tr>
        <tr><td><code>responseType</code></td><td>string?</td><td>Default: <code>code</code> (authorization-code flow with PKCE).</td></tr>
        <tr><td><code>extra</code></td><td>Partial&lt;OpenIdConfiguration&gt;</td><td>Any field of the underlying SDK's config, merged last.</td></tr>
      </tbody>
    </table>

    <!-- ================= AUTH0 ================= -->
    <h2 id="auth0">Walkthrough — Auth0</h2>
    <p>
      Auth0 is the simplest to wire: the Dashboard gives you everything
      the adapter needs in under a minute.
    </p>

    <ol class="steps">
      <li>
        <h4>Create a Single Page Application</h4>
        <p>
          In the Auth0 Dashboard go to <strong>Applications → Applications</strong>
          and hit <em>Create application</em>. Pick
          <em>Single Page Web Applications</em>. Your tenant domain is
          visible at the top — e.g. <code>your-tenant.eu.auth0.com</code>.
        </p>
      </li>
      <li>
        <h4>Allow your app's URLs</h4>
        <p>
          Under the application's <em>Settings</em> tab, set:
        </p>
        <ul>
          <li><strong>Allowed Callback URLs:</strong> <code>http://localhost:4200, https://yourapp.com</code></li>
          <li><strong>Allowed Logout URLs:</strong> same values</li>
          <li><strong>Allowed Web Origins:</strong> same values</li>
        </ul>
        <p class="muted">
          Without these, the redirect back from
          <code>/authorize</code> lands on a generic error page.
        </p>
      </li>
      <li>
        <h4>Enable refresh tokens (optional)</h4>
        <p>
          If you want silent token refresh without iframe, scroll down
          to <em>Refresh Token Rotation</em> and flip it on. Then add
          <code>offline_access</code> to your scope list.
        </p>
      </li>
      <li>
        <h4>Bootstrap the adapter</h4>
        <p>
          Copy the <em>Domain</em> to <code>authority</code> (prefix with
          <code>https://</code>) and the <em>Client ID</em> to
          <code>clientId</code>.
        </p>
      </li>
    </ol>

    <app-code [code]="auth0Sample" title="main.ts — Auth0" />

    <h3>Calling a protected API</h3>
    <p>
      Auth0 issues API-specific access tokens when you pass an
      <code>audience</code>. Add it via <code>extra.customParamsAuthRequest</code>
      so the SDK forwards it on every <code>/authorize</code> call:
    </p>
    <app-code [code]="auth0Api" />
    <p>
      Then list the API origin in <code>provideAuth(..., &#123; protectedResourceUrls &#125;)</code>
      so <code>authInterceptor</code> automatically attaches the token.
    </p>

    <div class="callout callout-warning">
      <div>
        <p><strong>Gotcha — organizations.</strong> If your tenant uses
          Auth0 Organizations, add
          <code>customParamsAuthRequest: &#123; organization: 'org_xxx' &#125;</code>
          to pin the login to a single org.</p>
      </div>
    </div>

    <!-- ================= KEYCLOAK ================= -->
    <h2 id="keycloak">Walkthrough — Keycloak</h2>
    <p>
      Keycloak is the reference self-hosted OIDC server. Everything the
      adapter needs lives under your realm's <em>Clients</em> section.
    </p>

    <ol class="steps">
      <li>
        <h4>Pick (or create) a realm</h4>
        <p>
          In the Keycloak admin console, select the realm you want your
          Angular app to sign into. The authority URL is then
          <code>https://&lt;keycloak-host&gt;/realms/&lt;realm-name&gt;</code>
          — that's what you pass as <code>authority</code>.
        </p>
      </li>
      <li>
        <h4>Create a public client</h4>
        <p>
          Under <em>Clients</em> → <em>Create client</em>:
        </p>
        <ul>
          <li><strong>Client type:</strong> <code>OpenID Connect</code></li>
          <li><strong>Client ID:</strong> anything (e.g. <code>frontend</code>) — this becomes your <code>clientId</code>.</li>
          <li>Leave <em>Client authentication</em> <strong>off</strong> (public client, no secret).</li>
          <li>Enable <em>Standard flow</em> (authorization code). Disable <em>Direct access grants</em>.</li>
        </ul>
      </li>
      <li>
        <h4>Allow your app's URLs</h4>
        <p>
          On the client's <em>Settings</em> page, set:
        </p>
        <ul>
          <li><strong>Valid redirect URIs:</strong> <code>http://localhost:4200/*</code> and your prod origin.</li>
          <li><strong>Web origins:</strong> <code>+</code> (means "same as redirect URIs") or the explicit origins.</li>
        </ul>
        <p>
          Under <em>Advanced</em> → <em>Advanced Settings</em>, set
          <em>Proof Key for Code Exchange Code Challenge Method</em> to
          <code>S256</code>.
        </p>
      </li>
      <li>
        <h4>Bootstrap the adapter</h4>
        <p>
          Authority is the realm URL, client id is whatever you named
          the client. No secret, no extra config required.
        </p>
      </li>
    </ol>

    <app-code [code]="keycloakSample" title="main.ts — Keycloak" />

    <h3>Mapping Keycloak roles</h3>
    <p>
      Keycloak exposes realm roles on the token under
      <code>realm_access.roles</code>. The OIDC adapter reads them
      automatically, so <code>auth.user()?.roles</code> is populated
      without extra configuration:
    </p>
    <app-code [code]="keycloakRoles" />
    <p class="muted">
      Client-level roles live under <code>resource_access[clientId].roles</code>.
      Reach for them via <code>auth.user()?.raw</code> if you need them.
    </p>

    <div class="callout callout-warning">
      <div>
        <p><strong>Silent refresh behind Keycloak.</strong> Default
          Keycloak sessions rely on the <code>KEYCLOAK_SESSION</code> cookie;
          browsers that block third-party cookies (Safari, Firefox
          strict mode) will break iframe refresh. Either host Keycloak
          on the same site as your app, or enable refresh-token rotation
          and add <code>offline_access</code> to <code>scope</code>.</p>
      </div>
    </div>

    <!-- ================= OKTA ================= -->
    <h2 id="okta">Walkthrough — Okta</h2>
    <p>
      Create a <em>Single-Page App</em> integration in the Okta Admin
      Console. Copy the Okta domain (e.g.
      <code>dev-12345.okta.com</code>) and the generated Client ID.
    </p>
    <app-code [code]="oktaSample" title="main.ts — Okta" />
    <p class="muted">
      Okta serves its OIDC metadata under
      <code>/oauth2/default/.well-known/openid-configuration</code>, so
      the authority includes <code>/oauth2/default</code>.
    </p>

    <!-- ================= COGNITO ================= -->
    <h2 id="cognito">Walkthrough — AWS Cognito</h2>
    <p>
      In the Cognito console, open your User Pool, go to <em>App
      integration</em> and create (or edit) an <em>App client</em> with
      <em>Public client</em> and <em>Allowed OAuth Flows = Authorization
      code grant</em>. Add your origin to the Callback + Sign-out URLs.
    </p>
    <app-code [code]="cognitoSample" title="main.ts — Cognito" />
    <div class="callout callout-warning">
      <div>
        <p><strong>Cognito logout.</strong> Cognito's
          <code>/oauth2/logout</code> requires a
          <code>logout_uri</code> query param. Set
          <code>postLogoutRedirectUri</code> explicitly — the adapter
          forwards it as <code>logout_uri</code>.</p>
      </div>
    </div>

    <!-- ================= CLAIMS ================= -->
    <h2>Claim mapping</h2>
    <p>
      The adapter produces the unified <code>AuthUser</code> shape from
      whichever claims your issuer emits:
    </p>
    <table class="params">
      <thead><tr><th>AuthUser field</th><th>Claim source</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td><code>sub</code></td></tr>
        <tr><td><code>email</code></td><td><code>email</code></td></tr>
        <tr><td><code>name</code></td><td><code>name</code> → <code>preferred_username</code></td></tr>
        <tr><td><code>picture</code></td><td><code>picture</code></td></tr>
        <tr><td><code>roles</code></td><td><code>realm_access.roles</code> (Keycloak) → <code>roles</code> → <code>cognito:groups</code></td></tr>
        <tr><td><code>raw</code></td><td>the full decoded ID token payload</td></tr>
      </tbody>
    </table>
    <p>
      Need a non-standard claim? Read it from
      <code>auth.user()?.raw</code> — the original payload is always
      preserved.
    </p>

    <!-- ================= TROUBLESHOOTING ================= -->
    <h2>Troubleshooting</h2>
    <table class="params">
      <thead><tr><th>Symptom</th><th>Usual cause</th></tr></thead>
      <tbody>
        <tr><td>Redirect returns with <code>invalid_redirect_uri</code></td><td>The URL you're bootstrapping from isn't in the issuer's allowed list — match it character-for-character, including trailing slash.</td></tr>
        <tr><td><code>getAccessToken()</code> always returns <code>null</code></td><td>Your scope doesn't include <code>offline_access</code> or an audience the issuer recognises; or the iframe silent refresh is blocked (see Safari note above).</td></tr>
        <tr><td>User is signed in but <code>roles</code> is empty</td><td>Your issuer puts roles under a non-standard claim — read <code>auth.user()?.raw</code> and map it yourself, or configure a mapper in the issuer.</td></tr>
        <tr><td>CORS error on <code>/token</code></td><td>The issuer's CORS allowed origins don't include your app origin (common with self-hosted Keycloak).</td></tr>
      </tbody>
    </table>
  `,
  styles: [
    `
      table.params {
        width: 100%;
        border-collapse: collapse;
        margin: var(--sp-4) 0 var(--sp-6);
        font-size: var(--fs-sm);
      }
      .params th, .params td {
        text-align: left;
        padding: var(--sp-3) var(--sp-4);
        border-bottom: var(--border-w) solid var(--border);
        vertical-align: top;
      }
      .params th {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        font-weight: 500;
        color: var(--text-subtle);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        background: var(--surface-2);
      }
    `,
  ],
})
export class DocsOidcComponent {
  readonly installGroups = [
    { packages: '@amaurylapaque/angular-auth angular-auth-oidc-client' },
  ] as const;

  readonly bootstrap = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth, provideOidc, authInterceptor } from '@amaurylapaque/angular-auth';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAuth(
      provideOidc({
        authority: 'https://your-issuer.example.com',
        clientId: 'your-client-id',
        redirectUrl: window.location.origin,
        scope: 'openid profile email offline_access',
      }),
      { protectedResourceUrls: ['https://api.example.com'] },
    ),
  ],
});`;

  readonly auth0Sample = `import { provideAuth, provideOidc } from '@amaurylapaque/angular-auth';

provideAuth(
  provideOidc({
    authority: 'https://your-tenant.eu.auth0.com',
    clientId: 'abc123',
    redirectUrl: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    scope: 'openid profile email offline_access',
  }),
  { protectedResourceUrls: ['https://api.example.com'] },
);`;

  readonly auth0Api = `provideOidc({
  authority: 'https://your-tenant.eu.auth0.com',
  clientId: 'abc123',
  redirectUrl: window.location.origin,
  scope: 'openid profile email offline_access read:orders',
  extra: {
    customParamsAuthRequest: {
      audience: 'https://api.example.com',
    },
  },
});`;

  readonly keycloakSample = `import { provideAuth, provideOidc } from '@amaurylapaque/angular-auth';

provideAuth(
  provideOidc({
    authority: 'https://keycloak.example.com/realms/my-app',
    clientId: 'frontend',
    redirectUrl: window.location.origin,
    postLogoutRedirectUri: \`\${window.location.origin}/logged-out\`,
    scope: 'openid profile email',
  }),
);`;

  readonly keycloakRoles = `@Component({ /* ... */ })
export class AdminPanelComponent {
  private readonly auth = inject(AuthService);
  readonly isAdmin = computed(
    () => this.auth.user()?.roles?.includes('admin') ?? false,
  );
}`;

  readonly oktaSample = `provideOidc({
  authority: 'https://dev-12345.okta.com/oauth2/default',
  clientId: '0oabcde12345',
  redirectUrl: window.location.origin,
  scope: 'openid profile email offline_access',
});`;

  readonly cognitoSample = `provideOidc({
  authority:
    'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_XXXXXXX',
  clientId: '7xxxxxxxxxxxxxxxxxxxxxxxxx',
  redirectUrl: window.location.origin,
  postLogoutRedirectUri: window.location.origin,
  scope: 'openid profile email',
});`;
}
