import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from 'generic-angular-auth';

import { ADAPTER_OPTIONS, getSelectedAdapterKey } from '../adapter-selection';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="container container-narrow">
        <span class="eyebrow">
          <span class="eyebrow-dot" aria-hidden="true"></span>
          Pluggable Angular authentication
        </span>
        <h1 class="hero-title">
          One service. One guard. One interceptor.<br />
          <span class="hero-accent">Six providers.</span>
        </h1>
        <p class="hero-sub">
          A thin, stable contract in front of OIDC, MSAL, Firebase, Supabase,
          JWT and a Mock provider — swap the underlying SDK by changing a
          single line at bootstrap.
        </p>
        <div class="hero-cta cluster">
          <a routerLink="/docs/install" class="btn btn-primary">
            Get started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a routerLink="/docs" class="btn">Browse docs</a>
          <a
            class="btn btn-ghost"
            href="https://www.npmjs.com/package/generic-angular-auth"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="14" x="3" y="5" rx="2"/><path d="M7 15V9h3l4 6V9"/></svg>
            npm
          </a>
        </div>
      </div>
    </section>

    <section class="container try-it">
      <div class="card card-interactive try-it-card">
        <div>
          <div class="cluster">
            <span class="badge badge-accent badge-dot">{{ currentAdapterLabel() }}</span>
            @if (auth.isAuthenticated()) {
              <span class="badge badge-success badge-dot">Signed in</span>
            } @else if (auth.isLoading()) {
              <span class="badge">Loading session…</span>
            } @else {
              <span class="badge">Not signed in</span>
            }
          </div>
          <h2 class="try-it-title">Try it live</h2>
          <p class="muted">
            Pick an adapter variant in the top bar, then log in below. The
            <a routerLink="/profile">Profile</a> route is guarded by
            <code>authGuard</code> — try visiting it signed out.
          </p>
        </div>
        <div class="try-it-actions cluster">
          @if (auth.isLoading()) {
            <button type="button" class="btn" disabled>
              <span class="spinner" aria-hidden="true"></span>
              Loading…
            </button>
          } @else if (auth.isAuthenticated()) {
            <div class="stack-sm">
              <p class="stack-sm__inline">
                Signed in as <strong>{{ auth.user()?.name }}</strong>
                @if (auth.user()?.email) {
                  <span class="muted">· {{ auth.user()?.email }}</span>
                }
              </p>
              <div class="cluster">
                <a routerLink="/profile" class="btn btn-primary">View profile</a>
                <button type="button" class="btn" (click)="auth.logout()">Logout</button>
              </div>
            </div>
          } @else {
            <button type="button" class="btn btn-primary" (click)="auth.login()">
              Sign in with current adapter
            </button>
          }
        </div>
      </div>
    </section>

    <section class="container features">
      <h2 class="section-title">Six providers, one API</h2>
      <p class="section-sub muted">
        Each adapter implements the same <code>AuthProvider</code> contract.
        Your components only ever read from <code>AuthService</code>.
      </p>
      <div class="adapter-grid">
        <a routerLink="/docs/adapters/oidc" class="card card-interactive adapter-card">
          <span class="adapter-pill" data-kind="oidc">OIDC</span>
          <h3>Auth0, Keycloak, Okta…</h3>
          <p class="muted">Any spec-compliant OpenID Connect issuer via <code>angular-auth-oidc-client</code>.</p>
        </a>
        <a routerLink="/docs/adapters/msal" class="card card-interactive adapter-card">
          <span class="adapter-pill" data-kind="msal">MSAL</span>
          <h3>Azure AD / Entra ID</h3>
          <p class="muted">Redirect or popup flows, silent token acquisition, via <code>&#64;azure/msal-angular</code>.</p>
        </a>
        <a routerLink="/docs/adapters/firebase" class="card card-interactive adapter-card">
          <span class="adapter-pill" data-kind="firebase">Firebase</span>
          <h3>Firebase Authentication</h3>
          <p class="muted">Password, popup, redirect, custom token and anonymous sign-in out of the box.</p>
        </a>
        <a routerLink="/docs/adapters/supabase" class="card card-interactive adapter-card">
          <span class="adapter-pill" data-kind="supabase">Supabase</span>
          <h3>Supabase Auth</h3>
          <p class="muted">Password, OTP magic link and OAuth providers (GitHub, Google, …).</p>
        </a>
        <a routerLink="/docs/adapters/jwt" class="card card-interactive adapter-card">
          <span class="adapter-pill" data-kind="jwt">JWT</span>
          <h3>Your own backend</h3>
          <p class="muted"><code>HttpClient</code>-only adapter with auto-refresh and configurable storage.</p>
        </a>
        <a routerLink="/docs/adapters/mock" class="card card-interactive adapter-card">
          <span class="adapter-pill" data-kind="mock">Mock</span>
          <h3>Dev &amp; tests</h3>
          <p class="muted">In-memory provider with seedable state — ideal for Storybook and specs.</p>
        </a>
      </div>
    </section>

    <section class="container value-props">
      <div class="value-grid">
        <div class="stack-sm">
          <div class="value-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>Guard &amp; interceptor</h3>
          <p class="muted">Functional <code>authGuard</code> and <code>authInterceptor</code> drop-in for Angular 17+ standalone apps.</p>
        </div>
        <div class="stack-sm">
          <div class="value-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <h3>Signals &amp; observables</h3>
          <p class="muted">Reactive <code>user()</code>, <code>isAuthenticated()</code>, <code>isLoading()</code> — pick whichever your app already uses.</p>
        </div>
        <div class="stack-sm">
          <div class="value-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 9h6v6H9z"/></svg>
          </div>
          <h3>Mock for tests</h3>
          <p class="muted">Deterministic in-memory provider with latency controls and seedable users.</p>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        padding: var(--sp-20) 0 var(--sp-12);
        text-align: left;
        position: relative;
        overflow: hidden;
      }
      .hero::before {
        content: '';
        position: absolute;
        inset: -20% -10% auto -10%;
        height: 420px;
        background:
          radial-gradient(ellipse at 30% 30%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%),
          radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--accent-hover) 12%, transparent), transparent 55%);
        filter: blur(60px);
        z-index: -1;
        opacity: 0.9;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        font-size: var(--fs-xs);
        font-weight: 500;
        color: var(--accent);
        background: var(--accent-soft);
        border: 1px solid var(--accent-border);
        border-radius: var(--r-full);
        padding: var(--sp-1) var(--sp-3);
        letter-spacing: 0.02em;
      }
      .eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
      }

      .hero-title {
        font-size: clamp(2rem, 4.2vw + 0.5rem, 3.5rem);
        line-height: 1.05;
        letter-spacing: -0.025em;
        margin: var(--sp-5) 0 var(--sp-4);
      }
      .hero-accent {
        background: linear-gradient(120deg, var(--accent), var(--accent-hover));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .hero-sub {
        font-size: var(--fs-lg);
        color: var(--text-muted);
        max-width: 60ch;
        margin-bottom: var(--sp-8);
      }
      .hero-cta { gap: var(--sp-3); }

      /* Try it card */
      .try-it { margin: 0 auto; }
      .try-it-card {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: var(--sp-6);
        align-items: center;
        padding: var(--sp-6) var(--sp-7);
      }
      .try-it-title {
        margin: var(--sp-3) 0 var(--sp-2);
        font-size: var(--fs-xl);
      }
      .try-it-actions { justify-content: flex-end; }
      @media (max-width: 780px) {
        .try-it-card { grid-template-columns: 1fr; }
        .try-it-actions { justify-content: flex-start; }
      }
      .stack-sm__inline { margin: 0; font-size: var(--fs-sm); color: var(--text-muted); }

      .spinner {
        display: inline-block;
        width: 14px; height: 14px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 800ms linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Features */
      .features { margin-top: var(--sp-16); }
      .section-title { margin: 0 0 var(--sp-2); font-size: var(--fs-2xl); }
      .section-sub { margin: 0 0 var(--sp-6); max-width: 60ch; }

      .adapter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: var(--sp-4);
      }
      .adapter-card {
        display: block;
        color: inherit;
        text-decoration: none;
      }
      .adapter-card:hover { text-decoration: none; color: inherit; }
      .adapter-card h3 { margin: var(--sp-3) 0 var(--sp-2); font-size: var(--fs-lg); }
      .adapter-card p { margin: 0; font-size: var(--fs-sm); line-height: var(--lh-base); }

      .adapter-pill {
        display: inline-flex;
        align-items: center;
        height: 24px;
        padding: 0 var(--sp-2);
        font-size: var(--fs-xs);
        font-weight: 600;
        letter-spacing: 0.04em;
        border-radius: var(--r-sm);
        color: var(--accent);
        background: var(--accent-soft);
        border: 1px solid var(--accent-border);
      }
      .adapter-pill[data-kind='msal']      { color: #0369a1; background: #e0f2fe; border-color: #bae6fd; }
      .adapter-pill[data-kind='firebase']  { color: #b45309; background: #fef3c7; border-color: #fde68a; }
      .adapter-pill[data-kind='supabase']  { color: #047857; background: #d1fae5; border-color: #a7f3d0; }
      .adapter-pill[data-kind='jwt']       { color: #7c3aed; background: #ede9fe; border-color: #ddd6fe; }
      .adapter-pill[data-kind='mock']      { color: var(--text-muted); background: var(--surface-2); border-color: var(--border); }

      :host-context(:root[data-theme='dark']) .adapter-pill[data-kind='msal'],
      :host-context(:root[data-theme='dark']) .adapter-pill[data-kind='firebase'],
      :host-context(:root[data-theme='dark']) .adapter-pill[data-kind='supabase'],
      :host-context(:root[data-theme='dark']) .adapter-pill[data-kind='jwt'] { /* scoped below */ }

      :host-context(:root[data-theme='dark']) .adapter-pill[data-kind='msal']     { color: #7dd3fc; background: #082f49; border-color: #0c4a6e; }
      :host-context(:root[data-theme='dark']) .adapter-pill[data-kind='firebase'] { color: #fbbf24; background: #3b2a0c; border-color: #78350f; }
      :host-context(:root[data-theme='dark']) .adapter-pill[data-kind='supabase'] { color: #6ee7b7; background: #042f1f; border-color: #065f46; }
      :host-context(:root[data-theme='dark']) .adapter-pill[data-kind='jwt']      { color: #c4b5fd; background: #2e1065; border-color: #4c1d95; }

      @media (prefers-color-scheme: dark) {
        :host-context(:root:not([data-theme='light'])) .adapter-pill[data-kind='msal']     { color: #7dd3fc; background: #082f49; border-color: #0c4a6e; }
        :host-context(:root:not([data-theme='light'])) .adapter-pill[data-kind='firebase'] { color: #fbbf24; background: #3b2a0c; border-color: #78350f; }
        :host-context(:root:not([data-theme='light'])) .adapter-pill[data-kind='supabase'] { color: #6ee7b7; background: #042f1f; border-color: #065f46; }
        :host-context(:root:not([data-theme='light'])) .adapter-pill[data-kind='jwt']      { color: #c4b5fd; background: #2e1065; border-color: #4c1d95; }
      }

      /* Value props */
      .value-props { margin-top: var(--sp-16); }
      .value-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--sp-6);
      }
      .value-icon {
        display: grid; place-items: center;
        width: 36px; height: 36px;
        border-radius: var(--r-md);
        color: var(--accent);
        background: var(--accent-soft);
        border: 1px solid var(--accent-border);
      }
      .value-grid h3 { margin: 0; font-size: var(--fs-md); }
      .value-grid p { margin: 0; font-size: var(--fs-sm); color: var(--text-muted); }

      @media (prefers-reduced-motion: reduce) {
        .spinner { animation: none; }
      }
    `,
  ],
})
export class HomeComponent {
  readonly auth = inject(AuthService);
  readonly currentAdapterLabel = computed(() => {
    const key = getSelectedAdapterKey();
    return ADAPTER_OPTIONS.find((o) => o.key === key)?.label ?? 'Adapter';
  });
}
