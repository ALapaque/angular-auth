import { Component } from '@angular/core';

import { CodeBlockComponent } from '../code-block.component';

@Component({
  selector: 'app-docs-jwt',
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <h1>JWT adapter (custom backend)</h1>
    <p class="lede">
      For home-grown APIs that issue JWTs. No external SDK — the adapter
      talks to your login / refresh / logout endpoints directly via
      <code>HttpClient</code>.
    </p>

    <h2>Prerequisite</h2>
    <p>
      Your app must call <code>provideHttpClient()</code>. Because the adapter
      uses <code>HttpClient</code> internally, this is already the case if
      you follow the <a href="/docs/install" routerLink="/docs/install">bootstrap guide</a>.
    </p>

    <h2>Bootstrap</h2>
    <app-code [code]="bootstrap" />

    <h2>Expected response shape</h2>
    <p>Out of the box, the adapter accepts any of these key spellings:</p>
    <app-code [code]="responseShape" lang="json" />
    <p>
      <code>expiresAt</code> is optional — if absent, it is derived from the
      JWT's <code>exp</code> claim. A 30-second safety window triggers a
      silent refresh when <code>getAccessToken()</code> is called.
    </p>

    <h2>Non-standard shapes</h2>
    <p>Use <code>mapLoginResponse</code> to adapt any server response:</p>
    <app-code [code]="customMap" />

    <h2>Configuration</h2>
    <table class="params">
      <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>loginUrl</code></td><td>string</td><td>POST target for credentials.</td></tr>
        <tr><td><code>refreshUrl</code></td><td>string?</td><td>POST target for refresh. Body: <code>&#123; refreshToken &#125;</code>. Omit to disable refresh.</td></tr>
        <tr><td><code>logoutUrl</code></td><td>string?</td><td>POST on logout. Omit for client-only sign-out.</td></tr>
        <tr><td><code>storage</code></td><td><code>'local' | 'session' | 'memory'</code></td><td>Where tokens are persisted. Default: <code>local</code>.</td></tr>
        <tr><td><code>storageKey</code></td><td>string?</td><td>Key used in storage. Default: <code>generic-auth.jwt</code>.</td></tr>
        <tr><td><code>mapLoginResponse</code></td><td>(res) =&gt; JwtTokens</td><td>Adapt custom response shape.</td></tr>
        <tr><td><code>mapRefreshResponse</code></td><td>(res) =&gt; JwtTokens</td><td>Same, for refresh. Defaults to <code>mapLoginResponse</code>.</td></tr>
        <tr><td><code>mapUser</code></td><td>(claims) =&gt; AuthUser</td><td>Adapt JWT claims to <code>AuthUser</code>.</td></tr>
      </tbody>
    </table>

    <h2>Usage</h2>
    <app-code [code]="usage" />

    <h2>Notes</h2>
    <ul>
      <li><code>memory</code> storage drops the session on reload — useful for highly-sensitive apps or test suites.</li>
      <li>If the refresh call fails, the adapter clears the session and returns <code>null</code> from <code>getAccessToken()</code>; the guard will then trigger a fresh login.</li>
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
export class DocsJwtComponent {
  readonly bootstrap = `import { provideAuth, provideJwt } from 'generic-angular-auth';

provideAuth(
  provideJwt({
    loginUrl: 'https://api.example.com/auth/login',
    refreshUrl: 'https://api.example.com/auth/refresh',
    logoutUrl: 'https://api.example.com/auth/logout',
  }),
);`;

  readonly responseShape = `{
  "accessToken":  "eyJ...",   // or "access_token" / "token"
  "refreshToken": "rf_...",   // or "refresh_token"
  "expiresAt":    1714512000  // or "expires_at" / "exp"
}`;

  readonly customMap = `provideJwt({
  loginUrl: '/api/auth/login',
  mapLoginResponse: (raw) => {
    const { data } = raw as { data: { jwt: string; refresh: string } };
    return { accessToken: data.jwt, refreshToken: data.refresh };
  },
  mapUser: (claims) => ({
    id: claims.userId as string,
    email: claims.userEmail as string,
    roles: (claims.permissions as string[]) ?? [],
  }),
});`;

  readonly usage = `// Login — the 'extra' fields become the POST body
await auth.login({ extra: { email, password } });

// Read the current state
auth.isAuthenticated();     // true
auth.user();                // { id, email, name, roles, raw }
await auth.getAccessToken(); // string

// Force refresh
await auth.getAccessToken({ forceRefresh: true });`;
}
