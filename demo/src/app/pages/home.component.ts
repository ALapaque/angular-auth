import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@amaurylapaque/angular-auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- ============ HERO ============ -->
    <section class="hero dotgrid" aria-labelledby="hero-title">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="container hero-inner">
        <span class="kicker kicker-bracket">&#64;amaurylapaque/angular-auth · v1.0</span>
        <h1 id="hero-title" class="hero-title">
          One auth contract.<br />
          <span class="text-gradient">Every provider.</span>
        </h1>
        <p class="lede hero-lede">
          A thin, stable façade over OIDC, MSAL, Firebase, Supabase, JWT and Mock.
          Swap the underlying SDK by changing a single line in your bootstrap —
          every component keeps injecting the same <code>AuthService</code>.
        </p>

        <div class="hero-actions cluster">
          @if (auth.isAuthenticated()) {
            <a class="btn btn-accent" routerLink="/profile">
              Open your profile
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </a>
          } @else {
            <button type="button" class="btn btn-accent" (click)="auth.login()">
              Try it — sign in
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
          }
          <a class="btn" routerLink="/docs">Read the docs</a>
        </div>

        <div class="hero-install" role="group" aria-label="Install command">
          <span class="hero-install-prompt" aria-hidden="true">$</span>
          <code>npm i @amaurylapaque/angular-auth</code>
          <span class="badge badge-soft">MIT · SSR-safe</span>
        </div>

        <ul class="hero-chips" aria-label="Supported providers">
          <li><span class="chip-dot chip-dot-1"></span>OIDC</li>
          <li><span class="chip-dot chip-dot-2"></span>MSAL</li>
          <li><span class="chip-dot chip-dot-3"></span>Firebase</li>
          <li><span class="chip-dot chip-dot-4"></span>Supabase</li>
          <li><span class="chip-dot chip-dot-5"></span>JWT</li>
          <li><span class="chip-dot chip-dot-6"></span>Mock</li>
        </ul>
      </div>
    </section>

    <!-- ============ BENTO FEATURES ============ -->
    <section class="section" aria-labelledby="features-title">
      <div class="container">
        <header class="section-head">
          <span class="kicker kicker-dot">Why it holds up</span>
          <h2 id="features-title">Built like a contract, not a wrapper.</h2>
          <p class="lede">
            Everything your app touches — guards, interceptors, signals —
            stays identical as you migrate between providers.
          </p>
        </header>

        <div class="bento">
          <!-- Code snippet — big tile -->
          <article class="bento-tile tile-code card card-inverse">
            <header class="tile-code-head">
              <span class="kicker">main.ts</span>
              <span class="badge badge-accent">1 line to swap</span>
            </header>
            <pre><code><span class="tok-kw">import</span> &#123; bootstrapApplication &#125; <span class="tok-kw">from</span> <span class="tok-str">'&#64;angular/platform-browser'</span>;
<span class="tok-kw">import</span> &#123; provideAuth, provideOidc &#125; <span class="tok-kw">from</span> <span class="tok-str">'@amaurylapaque/angular-auth'</span>;

bootstrapApplication(AppComponent, &#123;
  providers: [
    provideAuth(provideOidc(oidcConfig)),
    <span class="tok-com">// swap once to migrate — nothing else changes</span>
    <span class="tok-com">// provideAuth(provideMsal(msalConfig)),</span>
    <span class="tok-com">// provideAuth(provideFirebase(firebaseConfig)),</span>
  ],
&#125;);</code></pre>
            <p class="tile-code-foot muted">
              Every component keeps <code>inject(AuthService)</code>.
              The contract is the only thing that touches your code.
            </p>
          </article>

          <!-- Signals -->
          <article class="bento-tile card tile-b">
            <span class="kicker">01 · Reactive</span>
            <h3>Signals-first</h3>
            <p class="muted">
              <code>isAuthenticated()</code>, <code>user()</code> and
              <code>isLoading()</code> are signals — read them anywhere,
              no RxJS required.
            </p>
          </article>

          <!-- SSR -->
          <article class="bento-tile card tile-c">
            <span class="kicker">02 · Rendering</span>
            <h3>SSR-safe by default</h3>
            <p class="muted">
              Guarded against <code>window</code>, <code>document</code> and
              <code>localStorage</code> so hydration never throws.
            </p>
          </article>

          <!-- Guards + interceptors -->
          <article class="bento-tile card tile-d">
            <span class="kicker">03 · Framework fit</span>
            <h3>Guards and interceptors, wired.</h3>
            <p class="muted">
              <code>authGuard()</code> protects your routes,
              <code>authInterceptor</code> attaches access tokens to
              outbound HTTP — both installed by <code>provideAuth(...)</code>.
            </p>
          </article>

          <!-- Tree-shakeable -->
          <article class="bento-tile card tile-e">
            <span class="kicker">04 · Bundle</span>
            <h3>Only what you ship.</h3>
            <p class="muted">
              Adapters are tree-shakeable and peer deps are optional —
              install <code>&#64;supabase/supabase-js</code> only if you
              actually use Supabase.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- ============ ADAPTERS ============ -->
    <section class="section-sm" aria-labelledby="adapters-title">
      <div class="container">
        <header class="section-head">
          <span class="kicker kicker-dot">Six adapters, one API</span>
          <h2 id="adapters-title">Bring the SDK you already trust.</h2>
          <p class="lede">
            Each adapter is a thin bridge between its SDK and the shared
            <code>AuthProvider</code> contract. Mix them, migrate between
            them, or fall back to Mock for tests.
          </p>
        </header>

        <div class="adapter-grid">
          @for (a of adapters; track a.key) {
            <a class="adapter-card card card-interactive" [routerLink]="a.route">
              <header class="adapter-head">
                <span class="adapter-mark" [attr.data-mark]="a.mark">{{ a.mark }}</span>
                <span class="badge">{{ a.tag }}</span>
              </header>
              <h3>{{ a.name }}</h3>
              <p class="muted">{{ a.note }}</p>
              <span class="adapter-link">
                <code>{{ a.provide }}</code>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- ============ QUICKSTART ============ -->
    <section class="section" aria-labelledby="quickstart-title">
      <div class="container quickstart-inner">
        <div class="quickstart-head">
          <span class="kicker kicker-dot">Three steps</span>
          <h2 id="quickstart-title">From zero to signed-in.</h2>
          <p class="muted">
            Install the package, pick an adapter in your bootstrap,
            inject the service. That's the whole API surface you need to
            learn.
          </p>
          <a class="btn btn-primary" routerLink="/docs/install">
            Full install guide
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </a>
        </div>

        <ol class="steps quickstart-steps">
          <li>
            <h4>Install the package</h4>
            <p>Add <code>&#64;amaurylapaque/angular-auth</code>, plus the peer SDK for
              the adapter you plan to use — e.g.
              <code>angular-auth-oidc-client</code> for OIDC.</p>
          </li>
          <li>
            <h4>Provide an adapter</h4>
            <p>Call <code>provideAuth(provideXxx(config))</code> inside
              <code>bootstrapApplication</code>. Guards and the HTTP
              interceptor come with it.</p>
          </li>
          <li>
            <h4>Inject <code>AuthService</code></h4>
            <p>Read <code>user()</code>, call <code>login()</code> and
              <code>logout()</code>, await <code>getAccessToken()</code> —
              the same surface, regardless of provider.</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ============ FINAL CTA ============ -->
    <section class="section-sm" aria-labelledby="cta-title">
      <div class="container">
        <div class="cta card card-glass">
          <div class="cta-copy">
            <span class="kicker kicker-bracket">next steps</span>
            <h2 id="cta-title">Swap providers this afternoon.</h2>
            <p class="muted">
              Browse the in-app docs for integration guides, copy-pasteable
              snippets and the full architecture notes — or jump straight
              to the source on GitHub.
            </p>
          </div>
          <div class="cta-actions cluster">
            <a class="btn btn-accent" routerLink="/docs">Read the docs</a>
            <a
              class="btn"
              href="https://github.com/ALapaque/angular-auth"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }

      /* ============ HERO ============ */
      .hero {
        position: relative;
        overflow: hidden;
        padding-block: clamp(4.5rem, 8vw, 8rem) clamp(4rem, 7vw, 6.5rem);
        border-bottom: var(--border-w) solid var(--border);
      }
      .hero-glow {
        position: absolute;
        inset: -10% -10% auto -10%;
        height: 140%;
        background: var(--grad-glow);
        filter: blur(40px);
        opacity: 0.55;
        pointer-events: none;
        z-index: 0;
      }
      .hero-inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: var(--sp-6);
        max-width: 920px;
      }
      .hero-title {
        font-size: var(--fs-display);
        line-height: 1;
        letter-spacing: var(--tracking-tight);
        font-weight: 700;
        margin: var(--sp-2) 0 var(--sp-1);
      }
      .hero-lede { font-size: clamp(1.125rem, 1vw + 0.85rem, 1.375rem); max-width: 62ch; }

      .hero-actions { margin-top: var(--sp-4); }

      .hero-install {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-3);
        flex-wrap: wrap;
        padding: var(--sp-3) var(--sp-4);
        background: var(--surface);
        border: var(--border-w-strong) solid var(--border);
        border-radius: var(--r-md);
        font-family: var(--font-mono);
        font-size: var(--fs-sm);
        width: fit-content;
      }
      .hero-install-prompt { color: var(--accent); font-weight: 600; }
      .hero-install code {
        padding: 0;
        background: transparent;
        border: none;
        color: var(--text);
      }

      .hero-chips {
        list-style: none;
        padding: 0;
        margin: var(--sp-3) 0 0;
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-5);
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        color: var(--text-muted);
      }
      .hero-chips li { display: inline-flex; align-items: center; gap: var(--sp-2); }
      .chip-dot {
        width: 8px; height: 8px; border-radius: 50%;
        box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 18%, transparent);
      }
      .chip-dot-1 { background: #a855f7; color: #a855f7; }
      .chip-dot-2 { background: #6366f1; color: #6366f1; }
      .chip-dot-3 { background: #f59e0b; color: #f59e0b; }
      .chip-dot-4 { background: #10b981; color: #10b981; }
      .chip-dot-5 { background: #06b6d4; color: #06b6d4; }
      .chip-dot-6 { background: #737373; color: #737373; }

      /* ============ SECTION HEAD ============ */
      .section-head {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        max-width: 720px;
        margin-bottom: var(--sp-12);
      }
      .section-head h2 { margin-top: var(--sp-1); }

      /* ============ BENTO ============ */
      .bento {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: var(--sp-5);
      }
      .bento-tile {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
      }
      .bento-tile h3 { letter-spacing: var(--tracking-snug); }

      /* Code tile — spans 4 cols, 2 rows */
      .tile-code {
        grid-column: span 4;
        grid-row: span 2;
        padding: var(--sp-8);
      }
      .tile-code-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-3);
        padding-bottom: var(--sp-4);
        border-bottom: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 15%, transparent);
      }
      .tile-code .kicker { color: color-mix(in srgb, var(--surface-strong-text) 60%, transparent); }
      .tile-code pre {
        flex: 1;
        font-size: clamp(0.8125rem, 0.6vw + 0.7rem, 0.9375rem);
        line-height: 1.7;
        color: color-mix(in srgb, var(--surface-strong-text) 92%, transparent);
        white-space: pre;
        overflow-x: auto;
        padding: var(--sp-5) 0;
      }
      .tile-code .tok-kw { color: #c084fc; font-weight: 500; }
      .tile-code .tok-str { color: #5eead4; }
      .tile-code .tok-com { color: color-mix(in srgb, var(--surface-strong-text) 45%, transparent); font-style: italic; }
      .tile-code code {
        padding: 0;
        background: transparent;
        border: none;
        color: inherit;
      }
      .tile-code-foot {
        padding-top: var(--sp-4);
        border-top: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 15%, transparent);
        font-size: var(--fs-sm);
      }
      .tile-code-foot code {
        background: color-mix(in srgb, var(--surface-strong-text) 10%, transparent);
        border-color: color-mix(in srgb, var(--surface-strong-text) 15%, transparent);
        color: color-mix(in srgb, var(--surface-strong-text) 95%, transparent);
      }

      .tile-b { grid-column: span 2; }
      .tile-c { grid-column: span 2; }
      .tile-d { grid-column: span 3; }
      .tile-e { grid-column: span 3; }

      @media (max-width: 960px) {
        .bento { grid-template-columns: repeat(2, 1fr); }
        .tile-code { grid-column: span 2; grid-row: auto; }
        .tile-b, .tile-c, .tile-d, .tile-e { grid-column: span 2; }
      }
      @media (max-width: 560px) {
        .bento { grid-template-columns: 1fr; }
        .tile-code, .tile-b, .tile-c, .tile-d, .tile-e { grid-column: span 1; }
      }

      /* ============ ADAPTERS ============ */
      .adapter-grid {
        display: grid;
        gap: var(--sp-5);
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }
      .adapter-card {
        text-decoration: none;
        color: var(--text);
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
      }
      .adapter-card:hover { text-decoration: none; }
      .adapter-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-3);
      }
      .adapter-mark {
        display: grid;
        place-items: center;
        width: 44px; height: 44px;
        font-family: var(--font-mono);
        font-size: var(--fs-sm);
        font-weight: 600;
        letter-spacing: 0;
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

      :host-context(:root[data-theme='dark']) .adapter-mark[data-mark='FB'] { color: #fbbf24; }
      :host-context(:root[data-theme='dark']) .adapter-mark[data-mark='SB'] { color: #4ade80; }
      @media (prefers-color-scheme: dark) {
        :host-context(:root:not([data-theme='light'])) .adapter-mark[data-mark='FB'] { color: #fbbf24; }
        :host-context(:root:not([data-theme='light'])) .adapter-mark[data-mark='SB'] { color: #4ade80; }
      }

      .adapter-link {
        margin-top: auto;
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding-top: var(--sp-3);
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        border-top: var(--border-w) solid var(--border-subtle);
      }
      .adapter-link code {
        padding: 0;
        background: transparent;
        border: none;
        color: var(--accent);
        font-size: inherit;
      }
      .adapter-card:hover .adapter-link { color: var(--text); }

      /* ============ QUICKSTART ============ */
      .quickstart-inner {
        display: grid;
        grid-template-columns: minmax(260px, 1fr) 2fr;
        gap: clamp(var(--sp-8), 5vw, var(--sp-16));
        align-items: start;
      }
      .quickstart-head { position: sticky; top: calc(var(--nav-h) + var(--sp-6)); display: flex; flex-direction: column; gap: var(--sp-4); }
      .quickstart-steps { margin: 0; }

      @media (max-width: 860px) {
        .quickstart-inner { grid-template-columns: 1fr; }
        .quickstart-head { position: static; }
      }

      /* ============ FINAL CTA ============ */
      .cta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: clamp(var(--sp-6), 4vw, var(--sp-12));
        flex-wrap: wrap;
        padding: clamp(var(--sp-8), 4vw, var(--sp-12));
      }
      .cta-copy { max-width: 56ch; display: flex; flex-direction: column; gap: var(--sp-3); }
      .cta-actions { flex-shrink: 0; }
    `,
  ],
})
export class HomeComponent {
  readonly auth = inject(AuthService);

  readonly adapters = [
    {
      key: 'oidc',
      mark: 'OI',
      name: 'OIDC',
      tag: 'OAuth 2.1',
      provide: 'provideOidc',
      note: 'Auth0, Keycloak, Okta, Cognito — anything OpenID Connect. Silent refresh handled.',
      route: '/docs/adapters/oidc',
    },
    {
      key: 'msal',
      mark: 'MS',
      name: 'MSAL',
      tag: 'Microsoft',
      provide: 'provideMsal',
      note: 'Azure AD and Entra ID via the official MSAL Angular SDK.',
      route: '/docs/adapters/msal',
    },
    {
      key: 'firebase',
      mark: 'FB',
      name: 'Firebase',
      tag: 'BaaS',
      provide: 'provideFirebase',
      note: 'Google Identity Platform — email/password, Google, custom tokens.',
      route: '/docs/adapters/firebase',
    },
    {
      key: 'supabase',
      mark: 'SB',
      name: 'Supabase',
      tag: 'BaaS',
      provide: 'provideSupabase',
      note: 'Postgres-backed auth with magic links, OAuth providers and session refresh.',
      route: '/docs/adapters/supabase',
    },
    {
      key: 'jwt',
      mark: 'JW',
      name: 'JWT',
      tag: 'Custom',
      provide: 'provideJwt',
      note: 'Bring your own backend — anything that issues a JWT pair works out of the box.',
      route: '/docs/adapters/jwt',
    },
    {
      key: 'mock',
      mark: 'MK',
      name: 'Mock',
      tag: 'Testing',
      provide: 'provideMock',
      note: 'In-memory adapter for tests, demos and local dev. Zero peer dependencies.',
      route: '/docs/adapters/mock',
    },
  ];
}
