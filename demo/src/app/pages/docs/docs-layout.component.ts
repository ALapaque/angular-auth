import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface DocsChild {
  readonly fragment: string;
  readonly label: string;
}

interface DocsItem {
  readonly path: string;
  readonly label: string;
  readonly exact?: boolean;
  readonly children?: readonly DocsChild[];
}

interface DocsGroup {
  readonly kicker: string;
  readonly title: string;
  readonly items: readonly DocsItem[];
}

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container docs-shell">
      <aside class="docs-nav" aria-label="Documentation">
        <div class="docs-nav-inner">
          @for (group of groups; track group.title) {
            <section class="docs-group">
              <header class="docs-group-head">
                <span class="kicker">{{ group.kicker }}</span>
                <h3>{{ group.title }}</h3>
              </header>
              <ul>
                @for (item of group.items; track item.path) {
                  <li>
                    <a
                      [routerLink]="item.path"
                      routerLinkActive="is-active"
                      [routerLinkActiveOptions]="{ exact: !!item.exact }"
                      #rla="routerLinkActive"
                    >
                      <span class="docs-nav-dot" aria-hidden="true"></span>
                      <span>{{ item.label }}</span>
                    </a>
                    @if (item.children?.length && rla.isActive) {
                      <ul class="docs-sub">
                        @for (child of item.children!; track child.fragment) {
                          <li>
                            <a
                              [routerLink]="item.path"
                              [fragment]="child.fragment"
                            >
                              <span class="docs-sub-rule" aria-hidden="true"></span>
                              <span>{{ child.label }}</span>
                            </a>
                          </li>
                        }
                      </ul>
                    }
                  </li>
                }
              </ul>
            </section>
          }

          <a
            class="docs-nav-github"
            href="https://github.com/ALapaque/angular-auth"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
            <span>View source on GitHub</span>
          </a>
        </div>
      </aside>

      <main class="docs-content">
        <article class="prose">
          <router-outlet />
        </article>
      </main>
    </div>
  `,
  styles: [
    `
      :host { display: block; }

      .docs-shell {
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        gap: clamp(var(--sp-8), 4vw, var(--sp-16));
        padding-top: clamp(var(--sp-10), 6vw, var(--sp-16));
        padding-bottom: clamp(var(--sp-10), 6vw, var(--sp-16));
        align-items: start;
      }

      @media (max-width: 900px) {
        .docs-shell {
          grid-template-columns: 1fr;
          gap: var(--sp-8);
        }
      }

      /* ============ SIDEBAR ============ */
      .docs-nav {
        position: sticky;
        top: calc(var(--nav-h) + var(--sp-5));
        max-height: calc(100vh - var(--nav-h) - var(--sp-10));
        overflow-y: auto;
        padding-right: var(--sp-2);
      }
      @media (max-width: 900px) {
        .docs-nav {
          position: static;
          max-height: none;
          overflow: visible;
        }
      }

      .docs-nav-inner {
        display: flex;
        flex-direction: column;
        gap: var(--sp-8);
      }

      .docs-group { display: flex; flex-direction: column; gap: var(--sp-3); }
      .docs-group-head { display: flex; flex-direction: column; gap: var(--sp-1); }
      .docs-group-head h3 {
        font-family: var(--font-display);
        font-size: var(--fs-sm);
        font-weight: 600;
        letter-spacing: var(--tracking-snug);
        color: var(--text);
        margin: 0;
      }

      .docs-group ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
        border-left: var(--border-w) solid var(--border);
      }
      .docs-group a {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-3);
        margin-left: -1px; /* overlap the border so active bar is flush */
        font-size: var(--fs-sm);
        color: var(--text-muted);
        text-decoration: none;
        border-left: 2px solid transparent;
        border-radius: 0 var(--r-xs) var(--r-xs) 0;
        transition:
          color var(--dur-fast) var(--ease-out),
          background var(--dur-fast) var(--ease-out),
          border-color var(--dur-fast) var(--ease-out);
      }
      .docs-group a:hover {
        color: var(--text);
        background: var(--surface-2);
        text-decoration: none;
      }
      .docs-group a:focus-visible {
        outline: none;
        background: var(--surface-2);
        box-shadow: 0 0 0 2px var(--accent);
        border-radius: var(--r-xs);
      }
      .docs-group a.is-active {
        color: var(--text);
        font-weight: 500;
        background: color-mix(in srgb, var(--accent) 10%, transparent);
        border-left-color: var(--accent);
      }
      .docs-nav-dot {
        width: 4px; height: 4px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.5;
      }
      .docs-group a.is-active .docs-nav-dot {
        opacity: 1;
        background: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
      }

      /* ============ NESTED SUB-ITEMS ============ */
      .docs-sub {
        list-style: none;
        padding: 0;
        margin: var(--sp-1) 0 var(--sp-2);
        border-left: none;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .docs-sub a {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-1) var(--sp-3) var(--sp-1) var(--sp-8);
        margin-left: 0;
        font-size: var(--fs-xs);
        font-family: var(--font-mono);
        letter-spacing: 0;
        color: var(--text-subtle);
        border-left: none;
        border-radius: var(--r-xs);
        text-transform: none;
      }
      .docs-sub a:hover {
        color: var(--text);
        background: var(--surface-2);
      }
      .docs-sub-rule {
        display: inline-block;
        width: 10px;
        height: 1px;
        background: currentColor;
        opacity: 0.4;
      }
      .docs-sub a:hover .docs-sub-rule { opacity: 0.8; }

      .docs-nav-github {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-3) var(--sp-4);
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        color: var(--text-muted);
        background: var(--surface);
        border: var(--border-w-strong) solid var(--border);
        border-radius: var(--r-sm);
        text-decoration: none;
        transition:
          color var(--dur-fast) var(--ease-out),
          border-color var(--dur-fast) var(--ease-out),
          background var(--dur-fast) var(--ease-out);
      }
      .docs-nav-github:hover {
        color: var(--text);
        border-color: var(--border-strong);
        text-decoration: none;
      }

      /* ============ CONTENT ============ */
      .docs-content { min-width: 0; }
      .docs-content .prose { max-width: none; }
      .docs-content .prose > :first-child { margin-top: 0; }
    `,
  ],
})
export class DocsLayoutComponent {
  readonly groups: readonly DocsGroup[] = [
    {
      kicker: '01',
      title: 'Getting started',
      items: [
        { path: '/docs', label: 'Overview', exact: true },
        { path: '/docs/install', label: 'Install & bootstrap' },
        { path: '/docs/guards-interceptors', label: 'Guards & interceptors' },
      ],
    },
    {
      kicker: '02',
      title: 'Adapters',
      items: [
        {
          path: '/docs/adapters/oidc',
          label: 'OIDC',
          children: [
            { fragment: 'auth0', label: 'Auth0' },
            { fragment: 'keycloak', label: 'Keycloak' },
            { fragment: 'okta', label: 'Okta' },
            { fragment: 'cognito', label: 'AWS Cognito' },
          ],
        },
        { path: '/docs/adapters/msal', label: 'MSAL' },
        { path: '/docs/adapters/firebase', label: 'Firebase' },
        { path: '/docs/adapters/supabase', label: 'Supabase' },
        { path: '/docs/adapters/jwt', label: 'JWT (custom backend)' },
        { path: '/docs/adapters/mock', label: 'Mock' },
      ],
    },
    {
      kicker: '03',
      title: 'Advanced',
      items: [
        { path: '/docs/custom', label: 'Writing your own adapter' },
        { path: '/docs/security', label: 'Security' },
        { path: '/docs/api', label: 'API reference' },
      ],
    },
  ];
}
