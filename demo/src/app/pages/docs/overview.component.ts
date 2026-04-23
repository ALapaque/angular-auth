import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CodeBlockComponent } from './code-block.component';

interface QuickLink {
  readonly kicker: string;
  readonly title: string;
  readonly note: string;
  readonly route: string;
}

interface AdapterLink {
  readonly mark: string;
  readonly name: string;
  readonly covers: string;
  readonly peer: string;
  readonly route: string;
}

@Component({
  selector: 'app-docs-overview',
  standalone: true,
  imports: [CodeBlockComponent, RouterLink],
  template: `
    <header class="docs-intro">
      <span class="kicker kicker-bracket">Documentation</span>
      <h1>&#64;amaurylapaque/angular-auth</h1>
      <p class="lede">
        One <code>AuthService</code>, one guard, one interceptor. Swap the
        auth provider — OIDC, MSAL, Firebase, Supabase, JWT, Mock — by
        changing a single line in your bootstrap.
      </p>
      <div class="cluster">
        <a class="btn btn-accent" routerLink="/docs/install">Start here</a>
        <a class="btn" routerLink="/docs/api">API reference</a>
      </div>
    </header>

    <!-- Quick links bento -->
    <section class="docs-quicklinks" aria-label="Quick links">
      @for (link of quickLinks; track link.route) {
        <a class="card card-interactive ql" [routerLink]="link.route">
          <span class="kicker">{{ link.kicker }}</span>
          <h3>{{ link.title }}</h3>
          <p class="muted">{{ link.note }}</p>
          <span class="ql-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </span>
        </a>
      }
    </section>

    <!-- Why -->
    <section class="docs-section">
      <span class="kicker kicker-dot">Why</span>
      <h2>Decouple your app from the SDK.</h2>
      <p>
        Angular apps tend to couple to whichever auth SDK was picked on day
        one. Migrating from Keycloak to Auth0, or supporting both during a
        transition, forces every component that reads <code>user</code> or
        calls <code>getAccessToken()</code> to change. This library puts a
        thin, stable contract in front of the SDK so the rest of the app
        never has to know.
      </p>
    </section>

    <!-- Adapters -->
    <section class="docs-section" aria-labelledby="adapters-heading">
      <span class="kicker kicker-dot">Adapters at a glance</span>
      <h2 id="adapters-heading">Six providers, one API.</h2>
      <p class="muted">
        Install only the SDK you actually use — each adapter's peer
        dependencies are optional.
      </p>
      <div class="docs-adapters">
        @for (a of adapters; track a.mark) {
          <a class="card card-interactive docs-adapter" [routerLink]="a.route">
            <header class="docs-adapter-head">
              <span class="adapter-mark" [attr.data-mark]="a.mark">{{ a.mark }}</span>
              <h3>{{ a.name }}</h3>
            </header>
            <p class="muted">{{ a.covers }}</p>
            <footer class="docs-adapter-foot">
              <span class="hint">peer</span>
              <code>{{ a.peer }}</code>
            </footer>
          </a>
        }
      </div>
    </section>

    <!-- 30 second tour -->
    <section class="docs-section" aria-labelledby="tour-heading">
      <span class="kicker kicker-dot">30-second tour</span>
      <h2 id="tour-heading">Bootstrap once, inject anywhere.</h2>

      <h3 class="docs-tour-sub">1. Wire the provider in <code>main.ts</code></h3>
      <app-code [code]="bootstrapSample" />

      <h3 class="docs-tour-sub">2. Read it from any component</h3>
      <app-code [code]="useInComponentSample" />

      <p>
        Read on for the full
        <a routerLink="/docs/install">install &amp; bootstrap guide</a>, or
        jump to an <a routerLink="/docs/adapters/oidc">adapter page</a>.
      </p>
    </section>
  `,
  styles: [
    `
      :host { display: block; }

      .docs-intro {
        display: flex;
        flex-direction: column;
        gap: var(--sp-4);
        padding-bottom: var(--sp-10);
        border-bottom: var(--border-w) solid var(--border);
        margin-bottom: var(--sp-12);
      }
      .docs-intro h1 {
        margin: var(--sp-2) 0 var(--sp-1);
        font-size: clamp(1.625rem, 4vw + 0.5rem, 3rem);
        letter-spacing: var(--tracking-tight);
        overflow-wrap: anywhere;
        hyphens: auto;
      }
      .docs-intro .lede { max-width: 60ch; }
      .docs-intro .cluster { margin-top: var(--sp-3); }

      /* ============ QUICK LINKS ============ */
      .docs-quicklinks {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--sp-5);
        margin-bottom: var(--sp-16);
      }
      .ql {
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
        text-decoration: none;
        color: var(--text);
        position: relative;
      }
      .ql:hover { text-decoration: none; }
      .ql h3 { font-size: var(--fs-lg); }
      .ql p { font-size: var(--fs-sm); }
      .ql-arrow {
        position: absolute;
        top: var(--sp-6); right: var(--sp-6);
        width: 28px; height: 28px;
        display: grid; place-items: center;
        border-radius: 50%;
        background: var(--surface-2);
        border: var(--border-w) solid var(--border);
        color: var(--text-muted);
        transition: transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
      }
      .ql:hover .ql-arrow {
        background: var(--accent);
        color: #fff;
        transform: translate(2px, -2px);
        border-color: var(--accent);
      }

      /* ============ SECTIONS ============ */
      .docs-section {
        margin: var(--sp-16) 0;
        display: flex;
        flex-direction: column;
        gap: var(--sp-4);
      }
      .docs-section h2 {
        font-size: clamp(1.5rem, 1.5vw + 0.8rem, 2rem);
        letter-spacing: var(--tracking-tight);
      }
      .docs-section p { max-width: 62ch; }

      /* ============ ADAPTERS ============ */
      .docs-adapters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: var(--sp-4);
        margin-top: var(--sp-3);
      }
      .docs-adapter {
        text-decoration: none;
        color: var(--text);
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
      }
      .docs-adapter:hover { text-decoration: none; }
      .docs-adapter-head {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
      }
      .docs-adapter-head h3 { font-size: var(--fs-lg); }

      .adapter-mark {
        display: grid;
        place-items: center;
        width: 40px; height: 40px;
        font-family: var(--font-mono);
        font-size: var(--fs-sm);
        font-weight: 600;
        border-radius: var(--r-sm);
        border: var(--border-w-strong) solid var(--border);
        background: var(--surface-2);
        color: var(--text);
      }
      .adapter-mark[data-mark='OI'] { background: color-mix(in srgb, #a855f7 14%, var(--surface)); border-color: color-mix(in srgb, #a855f7 35%, var(--border)); color: var(--accent); }
      .adapter-mark[data-mark='MS'] { background: color-mix(in srgb, #6366f1 14%, var(--surface)); border-color: color-mix(in srgb, #6366f1 35%, var(--border)); color: #6366f1; }
      .adapter-mark[data-mark='FB'] { background: color-mix(in srgb, #f59e0b 14%, var(--surface)); border-color: color-mix(in srgb, #f59e0b 35%, var(--border)); color: #b45309; }
      .adapter-mark[data-mark='SB'] { background: color-mix(in srgb, #10b981 14%, var(--surface)); border-color: color-mix(in srgb, #10b981 35%, var(--border)); color: #047857; }
      .adapter-mark[data-mark='JW'] { background: color-mix(in srgb, #06b6d4 14%, var(--surface)); border-color: color-mix(in srgb, #06b6d4 35%, var(--border)); color: var(--accent-cyan); }
      .adapter-mark[data-mark='MK'] { background: var(--surface-2); border-color: var(--border); color: var(--text-muted); }

      .docs-adapter-foot {
        margin-top: auto;
        padding-top: var(--sp-3);
        border-top: var(--border-w) solid var(--border-subtle);
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        font-size: var(--fs-xs);
      }
      .docs-adapter-foot code {
        padding: var(--sp-1) var(--sp-2);
        font-size: var(--fs-xs);
      }

      /* ============ TOUR ============ */
      .docs-tour-sub {
        margin-top: var(--sp-8);
        font-size: var(--fs-lg);
        font-family: var(--font-display);
      }
      .docs-tour-sub code {
        font-family: var(--font-mono);
        font-size: 0.85em;
      }
    `,
  ],
})
export class DocsOverviewComponent {
  readonly quickLinks: readonly QuickLink[] = [
    {
      kicker: '01 · setup',
      title: 'Install & bootstrap',
      note: 'Peer dependencies, provideAuth, HTTP interceptor wiring.',
      route: '/docs/install',
    },
    {
      kicker: '02 · routing',
      title: 'Guards & interceptors',
      note: 'Protect routes with authGuard, attach tokens with authInterceptor.',
      route: '/docs/guards-interceptors',
    },
    {
      kicker: '03 · api',
      title: 'API reference',
      note: 'Full AuthService surface: signals, methods, options.',
      route: '/docs/api',
    },
    {
      kicker: '04 · safety',
      title: 'Security',
      note: 'Token storage, refresh, SSR considerations, CSRF.',
      route: '/docs/security',
    },
  ];

  readonly adapters: readonly AdapterLink[] = [
    { mark: 'OI', name: 'OIDC',     covers: 'Auth0, Keycloak, Okta, Cognito, Zitadel, Authentik, Google…', peer: 'angular-auth-oidc-client', route: '/docs/adapters/oidc' },
    { mark: 'MS', name: 'MSAL',     covers: 'Azure AD / Entra ID', peer: '@azure/msal-angular', route: '/docs/adapters/msal' },
    { mark: 'FB', name: 'Firebase', covers: 'Firebase Authentication', peer: 'firebase', route: '/docs/adapters/firebase' },
    { mark: 'SB', name: 'Supabase', covers: 'Password, OTP, OAuth providers', peer: '@supabase/supabase-js', route: '/docs/adapters/supabase' },
    { mark: 'JW', name: 'JWT',      covers: 'Your own backend — anything that issues a JWT pair', peer: '— HttpClient only', route: '/docs/adapters/jwt' },
    { mark: 'MK', name: 'Mock',     covers: 'Dev, demos and tests — in-memory', peer: '— zero deps', route: '/docs/adapters/mock' },
  ];

  readonly bootstrapSample = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth, provideOidc, authInterceptor } from '@amaurylapaque/angular-auth';

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
