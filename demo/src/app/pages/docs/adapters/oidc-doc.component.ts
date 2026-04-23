import { Component } from '@angular/core';

import { CodeBlockComponent } from '../code-block.component';

@Component({
  selector: 'app-docs-oidc',
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <h1>OIDC adapter</h1>
    <p class="lede">
      Works with any OpenID Connect–compliant issuer: Auth0, Keycloak, Okta,
      Cognito, Zitadel, Authentik, Google Identity, Entra External ID.
    </p>

    <h2>Install</h2>
    <app-code [code]="install" lang="bash" />

    <h2>Bootstrap</h2>
    <app-code [code]="bootstrap" />

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

    <h2>Provider-specific examples</h2>
    <h3>Auth0</h3>
    <app-code [code]="auth0Sample" />
    <h3>Keycloak</h3>
    <app-code [code]="keycloakSample" />
    <h3>AWS Cognito</h3>
    <app-code [code]="cognitoSample" />

    <h2>Claim mapping</h2>
    <p>
      <code>sub → id</code>, <code>email</code>, <code>picture</code>,
      <code>name</code> (falls back to <code>preferred_username</code>).
      Roles resolve in this order: <code>realm_access.roles</code> (Keycloak),
      top-level <code>roles</code>, then <code>cognito:groups</code>.
    </p>
    <p>
      Need a non-standard claim? Read it from
      <code>auth.user()?.raw</code> — the original payload is always
      preserved.
    </p>
  `,
  styles: [
    `
      table.params { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.88rem; }
      .params th, .params td { text-align: left; padding: 0.35rem 0.55rem; border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent); vertical-align: top; }
      .params th { font-weight: 600; opacity: 0.75; }
    `,
  ],
})
export class DocsOidcComponent {
  readonly install = 'npm install angular-auth-oidc-client';

  readonly bootstrap = `import { provideAuth, provideOidc } from 'generic-angular-auth';

provideAuth(
  provideOidc({
    authority: 'https://your-tenant.auth0.com',
    clientId: 'abc123',
    redirectUrl: window.location.origin,
    scope: 'openid profile email offline_access',
  }),
);`;

  readonly auth0Sample = `provideOidc({
  authority: 'https://your-tenant.auth0.com',
  clientId: 'abc123',
  redirectUrl: window.location.origin,
  scope: 'openid profile email offline_access',
  extra: {
    customParamsAuthRequest: { audience: 'https://api.example.com' },
  },
});`;

  readonly keycloakSample = `provideOidc({
  authority: 'https://keycloak.example.com/realms/my-realm',
  clientId: 'frontend',
  redirectUrl: window.location.origin,
});`;

  readonly cognitoSample = `provideOidc({
  authority: 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_XXXXX',
  clientId: '7xxxxxxxxxxxx',
  redirectUrl: window.location.origin,
  scope: 'openid profile email',
});`;
}
