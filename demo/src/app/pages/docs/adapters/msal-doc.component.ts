import { Component } from '@angular/core';

import { CodeBlockComponent } from '../code-block.component';

@Component({
  selector: 'app-docs-msal',
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <h1>MSAL adapter</h1>
    <p class="lede">
      Azure AD / Entra ID (workforce and External ID) via the official
      <code>&#64;azure/msal-angular</code> bindings.
    </p>

    <h2>Install</h2>
    <app-code [code]="install" lang="bash" />

    <h2>Bootstrap</h2>
    <app-code [code]="bootstrap" />

    <h2>Configuration</h2>
    <table class="params">
      <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>clientId</code></td><td>string</td><td>App registration client id.</td></tr>
        <tr><td><code>authority</code></td><td>string</td><td>Tenant URL, e.g. <code>https://login.microsoftonline.com/&lt;tenant-id&gt;</code>. Use <code>common</code>, <code>organizations</code> or <code>consumers</code> for multi-tenant.</td></tr>
        <tr><td><code>redirectUri</code></td><td>string</td><td>Where Entra redirects after login.</td></tr>
        <tr><td><code>postLogoutRedirectUri</code></td><td>string?</td><td>Defaults to <code>redirectUri</code>.</td></tr>
        <tr><td><code>scopes</code></td><td>string[]?</td><td>Default scopes for login and silent token acquisition, e.g. <code>['User.Read']</code>.</td></tr>
        <tr><td><code>interactionType</code></td><td><code>'redirect' | 'popup'</code></td><td>Default: <code>redirect</code>.</td></tr>
        <tr><td><code>instance</code></td><td>IPublicClientApplication?</td><td>Pre-built MSAL client. Useful for advanced cache configurations; other fields are ignored when set.</td></tr>
      </tbody>
    </table>

    <h2>Examples</h2>
    <h3>Single tenant</h3>
    <app-code [code]="singleTenant" />

    <h3>Multi-tenant (workforce)</h3>
    <app-code [code]="multiTenant" />

    <h3>Requesting additional scopes per call</h3>
    <app-code [code]="extraScopes" />

    <h2>Notes</h2>
    <ul>
      <li>The adapter calls <code>initialize()</code> + <code>handleRedirectObservable()</code> inside <code>init()</code>; you don't need to wire MSAL's default module guards manually.</li>
      <li><code>acquireTokenSilent</code> failures are caught and surface as <code>null</code> from <code>getAccessToken()</code>. Callers can retry with <code>login()</code> if they need interaction.</li>
      <li>When the user has multiple cached accounts, the adapter keeps the first one active unless a fresh <code>LOGIN_SUCCESS</code> event points elsewhere.</li>
    </ul>
  `,
  styles: [
    `
      table.params { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.88rem; }
      .params th, .params td { text-align: left; padding: 0.35rem 0.55rem; border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent); vertical-align: top; }
      .params th { font-weight: 600; opacity: 0.75; }
    `,
  ],
})
export class DocsMsalComponent {
  readonly install = 'npm install @azure/msal-browser @azure/msal-angular';

  readonly bootstrap = `import { provideAuth, provideMsal } from '@amaurylapaque/angular-auth';

provideAuth(
  provideMsal({
    clientId: '00000000-0000-0000-0000-000000000000',
    authority: 'https://login.microsoftonline.com/<tenant-id>',
    redirectUri: window.location.origin,
    scopes: ['User.Read'],
  }),
);`;

  readonly singleTenant = `provideMsal({
  clientId: '00000000-0000-0000-0000-000000000000',
  authority: 'https://login.microsoftonline.com/contoso.onmicrosoft.com',
  redirectUri: window.location.origin,
  scopes: ['User.Read'],
  interactionType: 'redirect',
});`;

  readonly multiTenant = `provideMsal({
  clientId: '00000000-0000-0000-0000-000000000000',
  authority: 'https://login.microsoftonline.com/organizations',
  redirectUri: window.location.origin,
  scopes: ['User.Read'],
});`;

  readonly extraScopes = `// request a token for a specific API resource
const token = await auth.getAccessToken({
  scopes: ['api://api-id/.default'],
  forceRefresh: true,
});`;
}
