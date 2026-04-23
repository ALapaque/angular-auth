import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CodeBlockComponent } from './code-block.component';

@Component({
  selector: 'app-docs-security',
  standalone: true,
  imports: [CodeBlockComponent, RouterLink],
  template: `
    <h1>Security considerations</h1>
    <p class="lede">
      This library exposes authentication primitives that handle highly
      sensitive secrets (access tokens, refresh tokens, id tokens). The
      decisions below materially affect your security posture — read them
      before shipping to production.
    </p>

    <h2>1. Token storage</h2>
    <p>
      Adapters delegate token storage to the underlying SDK, with the
      following defaults:
    </p>
    <table class="params">
      <thead><tr><th>Adapter</th><th>Default storage</th><th>Override via</th></tr></thead>
      <tbody>
        <tr><td>OIDC</td><td>SDK default (session storage)</td><td><code>angular-auth-oidc-client</code> config</td></tr>
        <tr><td>MSAL</td><td><code>localStorage</code></td><td>pre-built <code>PublicClientApplication</code></td></tr>
        <tr><td>Firebase</td><td><code>localStorage</code> (IndexedDB fallback)</td><td><code>firebase/auth</code></td></tr>
        <tr><td>Supabase</td><td><code>localStorage</code></td><td><code>clientOptions.auth</code></td></tr>
        <tr><td><strong>JWT</strong></td><td><strong><code>localStorage</code></strong></td><td><code>provideJwt(&#123; storage &#125;)</code></td></tr>
        <tr><td>Mock</td><td>In-memory only</td><td>n/a</td></tr>
      </tbody>
    </table>

    <div class="warning">
      <strong>⚠ <code>localStorage</code> is readable by every script running on
      your origin.</strong> A single XSS vulnerability in your application or
      any third-party script loaded on the page can exfiltrate every token
      stored there. Mitigations, ordered by strength:
      <ol>
        <li>
          <strong>Move auth server-side.</strong> Issue session cookies
          (<code>HttpOnly; Secure; SameSite=Lax</code>) from your backend and
          add the <code>Authorization</code> header on a proxy, not in the browser.
        </li>
        <li>
          <strong>Use <code>storage: 'memory'</code></strong> in the JWT adapter
          when tokens do not need to survive a reload. Users sign in again on
          each refresh but nothing is persisted to disk.
        </li>
        <li>
          <strong>Use <code>storage: 'session'</code></strong> to scope tokens
          to the current tab.
        </li>
        <li>
          <strong>Tighten your Content-Security-Policy.</strong>
          <code>default-src 'self'</code> with a strict
          <code>script-src</code> dramatically reduces XSS blast radius.
        </li>
      </ol>
    </div>

    <h2>2. HTTP interceptor — the <code>'*'</code> wildcard</h2>
    <p>
      <code>AuthCoreConfig.protectedResourceUrls: ['*']</code> attaches the
      access token to <strong>every</strong> outgoing HTTP request, including
      third-party APIs, CDNs and analytics endpoints. This is almost never
      what you want.
    </p>
    <div class="warning">
      <strong>⚠ Never ship <code>['*']</code> to production.</strong> Always
      enumerate your own API origins.
    </div>
    <app-code [code]="protectedUrls" />

    <h2>3. Redirect URIs</h2>
    <p>
      OIDC, MSAL, Firebase and Supabase authenticate through redirects to a
      URL you configure. <strong>Always register the exact URL</strong> at
      the identity provider and reject any other value at the provider side.
      Without strict whitelisting, an attacker can forge an authorisation
      response that lands on a malicious domain and steals the code.
    </p>

    <h2>4. Server-Side Rendering</h2>
    <p>
      All adapters are client-only. The JWT adapter guards access to
      <code>window</code>, <code>localStorage</code> and <code>atob</code> so
      the server boot does not crash — but authenticated routes will only
      render content on the client. If you use Angular Universal / SSR:
    </p>
    <ul>
      <li>Do not make authenticated pages SSR-rendered. Render a shell and hydrate on the client.</li>
      <li>For same-origin session cookies, read authentication server-side from the incoming request and pass user info via transfer state.</li>
    </ul>

    <h2>5. Dependency hygiene</h2>
    <p>
      Every identity-provider SDK is declared as an <strong>optional</strong>
      peer dependency. Installing <code>&#64;amaurylapaque/angular-auth</code> alone
      pulls in nothing beyond Angular and RxJS, minimising your supply-chain
      surface.
    </p>
    <p>
      CI runs <code>npm audit --omit=dev</code> on every push. Review any
      high-severity advisories promptly and pin the library at a known-good
      major version.
    </p>

    <h2>6. Reporting a vulnerability</h2>
    <p>
      Do not open a public GitHub issue. Use the repository's security
      advisory:
    </p>
    <app-code code="https://github.com/ALapaque/angular-auth/security/advisories/new" lang="url" />
    <p>
      Full policy in
      <a href="https://github.com/ALapaque/angular-auth/blob/main/SECURITY.md">SECURITY.md</a>.
    </p>

    <p>
      Need more context? Head to
      <a routerLink="/docs/install">install &amp; bootstrap</a> or the
      <a routerLink="/docs/adapters/jwt">JWT adapter</a> page for concrete
      snippets.
    </p>
  `,
  styles: [
    `
      .lede { font-size: 1.05rem; opacity: 0.85; }
      table.params { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.88rem; }
      .params th, .params td { text-align: left; padding: 0.35rem 0.55rem; border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent); vertical-align: top; }
      .params th { font-weight: 600; opacity: 0.75; }
      .warning {
        padding: 0.75rem 1rem;
        border-left: 3px solid #c33;
        background: color-mix(in srgb, #c33 10%, transparent);
        margin: 1rem 0;
        border-radius: 0 4px 4px 0;
      }
      .warning ol { margin: 0.5rem 0 0; padding-left: 1.2rem; }
      .warning li { margin: 0.3rem 0; }
    `,
  ],
})
export class DocsSecurityComponent {
  readonly protectedUrls = `provideAuth(adapter, {
  protectedResourceUrls: [
    'https://api.example.com',
    'https://orders.example.com',
  ],
});`;
}
