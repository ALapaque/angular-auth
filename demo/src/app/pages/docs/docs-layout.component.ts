import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="docs">
      <aside>
        <h3>Getting started</h3>
        <ul>
          <li><a routerLink="/docs" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Overview</a></li>
          <li><a routerLink="/docs/install" routerLinkActive="active">Install & bootstrap</a></li>
          <li><a routerLink="/docs/guards-interceptors" routerLinkActive="active">Guards & interceptors</a></li>
        </ul>
        <h3>Adapters</h3>
        <ul>
          <li><a routerLink="/docs/adapters/oidc" routerLinkActive="active">OIDC</a></li>
          <li><a routerLink="/docs/adapters/msal" routerLinkActive="active">MSAL</a></li>
          <li><a routerLink="/docs/adapters/firebase" routerLinkActive="active">Firebase</a></li>
          <li><a routerLink="/docs/adapters/supabase" routerLinkActive="active">Supabase</a></li>
          <li><a routerLink="/docs/adapters/jwt" routerLinkActive="active">JWT (custom backend)</a></li>
          <li><a routerLink="/docs/adapters/mock" routerLinkActive="active">Mock</a></li>
        </ul>
        <h3>Advanced</h3>
        <ul>
          <li><a routerLink="/docs/custom" routerLinkActive="active">Writing your own adapter</a></li>
          <li><a routerLink="/docs/api" routerLinkActive="active">API reference</a></li>
        </ul>
      </aside>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .docs {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 2rem;
        margin-top: 1rem;
      }
      @media (max-width: 720px) {
        .docs { grid-template-columns: 1fr; }
      }
      aside h3 {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.6;
        margin: 1rem 0 0.4rem;
      }
      aside ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      aside li { padding: 0.15rem 0; }
      aside a { text-decoration: none; }
      aside a.active {
        font-weight: 600;
        text-decoration: underline;
      }
      main :first-child { margin-top: 0; }
    `,
  ],
})
export class DocsLayoutComponent {}
