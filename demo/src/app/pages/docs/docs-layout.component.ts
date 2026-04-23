import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container docs">
      <aside class="docs-nav" aria-label="Documentation">
        <h4>Getting started</h4>
        <ul>
          <li><a routerLink="/docs" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Overview</a></li>
          <li><a routerLink="/docs/install" routerLinkActive="is-active">Install &amp; bootstrap</a></li>
          <li><a routerLink="/docs/guards-interceptors" routerLinkActive="is-active">Guards &amp; interceptors</a></li>
        </ul>
        <h4>Adapters</h4>
        <ul>
          <li><a routerLink="/docs/adapters/oidc" routerLinkActive="is-active">OIDC</a></li>
          <li><a routerLink="/docs/adapters/msal" routerLinkActive="is-active">MSAL</a></li>
          <li><a routerLink="/docs/adapters/firebase" routerLinkActive="is-active">Firebase</a></li>
          <li><a routerLink="/docs/adapters/supabase" routerLinkActive="is-active">Supabase</a></li>
          <li><a routerLink="/docs/adapters/jwt" routerLinkActive="is-active">JWT (custom backend)</a></li>
          <li><a routerLink="/docs/adapters/mock" routerLinkActive="is-active">Mock</a></li>
        </ul>
        <h4>Advanced</h4>
        <ul>
          <li><a routerLink="/docs/custom" routerLinkActive="is-active">Writing your own adapter</a></li>
          <li><a routerLink="/docs/security" routerLinkActive="is-active">Security</a></li>
          <li><a routerLink="/docs/api" routerLinkActive="is-active">API reference</a></li>
        </ul>
      </aside>
      <main class="docs-main prose">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .docs {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        gap: var(--sp-10);
        padding-block: var(--sp-10) var(--sp-12);
        align-items: start;
      }
      @media (max-width: 900px) {
        .docs { grid-template-columns: 1fr; gap: var(--sp-6); }
      }

      .docs-nav {
        position: sticky;
        top: calc(var(--nav-h) + var(--sp-6));
        max-height: calc(100vh - var(--nav-h) - var(--sp-10));
        overflow-y: auto;
        padding-right: var(--sp-3);
      }
      @media (max-width: 900px) {
        .docs-nav {
          position: static;
          max-height: none;
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--sp-4);
        }
      }

      .docs-nav h4 {
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-subtle);
        font-weight: 600;
        margin: var(--sp-5) 0 var(--sp-2);
      }
      .docs-nav h4:first-child { margin-top: 0; }

      .docs-nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
      }

      .docs-nav a {
        display: block;
        padding: var(--sp-2) var(--sp-3);
        color: var(--text-muted);
        font-size: var(--fs-sm);
        border-radius: var(--r-sm);
        text-decoration: none;
        transition: color var(--dur-fast) var(--ease-out),
                    background var(--dur-fast) var(--ease-out);
      }
      .docs-nav a:hover {
        color: var(--text);
        background: var(--surface-hover);
        text-decoration: none;
      }
      .docs-nav a.is-active {
        color: var(--accent);
        background: var(--accent-soft);
        font-weight: 500;
      }

      .docs-main { min-width: 0; }
      .docs-main > :first-child { margin-top: 0; }
    `,
  ],
})
export class DocsLayoutComponent {}
