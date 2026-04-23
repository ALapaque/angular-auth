import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from 'generic-angular-auth';

import { AdapterSwitcherComponent } from './adapter-switcher.component';
import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    AdapterSwitcherComponent,
    ThemeToggleComponent,
  ],
  template: `
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="nav" role="banner">
      <div class="container nav-inner">
        <a class="brand" routerLink="/">
          <span class="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </span>
          <span class="brand-text">
            <span class="brand-title">generic-angular-auth</span>
            <span class="brand-sub">live demo</span>
          </span>
        </a>

        <nav class="nav-links" aria-label="Primary">
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/profile" routerLinkActive="is-active">Profile</a>
          <a routerLink="/docs" routerLinkActive="is-active">Docs</a>
        </nav>

        <div class="nav-right">
          <app-adapter-switcher />
          <span class="divider" aria-hidden="true"></span>
          @if (auth.isLoading()) {
            <span class="badge badge-dot muted">Loading</span>
          } @else if (auth.isAuthenticated()) {
            <span class="badge badge-success badge-dot">{{ auth.user()?.name || 'Signed in' }}</span>
            <button type="button" class="btn btn-sm" (click)="auth.logout()">Logout</button>
          } @else {
            <span class="badge badge-dot">Guest</span>
            <button type="button" class="btn btn-sm btn-primary" (click)="auth.login()">Login</button>
          }
          <app-theme-toggle />
          <a
            class="btn btn-ghost btn-icon"
            href="https://github.com/alapaque/angular-auth"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            title="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <main id="main" class="page" role="main">
      <router-outlet />
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <span class="muted">Open-source — MIT. Swap adapters without touching your app.</span>
        <a href="https://github.com/alapaque/angular-auth" target="_blank" rel="noopener noreferrer">github.com/alapaque/angular-auth</a>
      </div>
    </footer>
  `,
  styles: [
    `
      :host { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; }

      .skip-link {
        position: absolute;
        top: -999px;
        left: var(--sp-4);
        background: var(--accent);
        color: var(--accent-contrast);
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--r-sm);
        z-index: 100;
      }
      .skip-link:focus { top: var(--sp-3); }

      .nav {
        position: sticky;
        top: 0;
        z-index: 40;
        background: color-mix(in srgb, var(--bg) 85%, transparent);
        backdrop-filter: saturate(180%) blur(12px);
        -webkit-backdrop-filter: saturate(180%) blur(12px);
        border-bottom: 1px solid var(--border);
      }

      .nav-inner {
        display: flex;
        align-items: center;
        gap: var(--sp-6);
        height: var(--nav-h);
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-3);
        color: var(--text);
        text-decoration: none;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .brand:hover { color: var(--text); text-decoration: none; }
      .brand-mark {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        color: var(--accent-contrast);
        background: linear-gradient(135deg, var(--accent), var(--accent-hover));
        border-radius: var(--r-md);
        box-shadow: var(--shadow-sm);
      }
      .brand-text { display: flex; flex-direction: column; line-height: 1.1; }
      .brand-title { font-size: var(--fs-sm); font-weight: 600; }
      .brand-sub {
        font-size: var(--fs-xs);
        color: var(--text-subtle);
        font-weight: 400;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: var(--sp-1);
        margin-inline: auto;
      }
      .nav-links a {
        position: relative;
        padding: var(--sp-2) var(--sp-3);
        color: var(--text-muted);
        font-size: var(--fs-sm);
        font-weight: 500;
        border-radius: var(--r-md);
        text-decoration: none;
        transition: color var(--dur-fast) var(--ease-out),
                    background var(--dur-fast) var(--ease-out);
      }
      .nav-links a:hover { color: var(--text); background: var(--surface-hover); text-decoration: none; }
      .nav-links a.is-active { color: var(--text); background: var(--surface-2); }

      .nav-right {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
      }
      .divider {
        width: 1px;
        height: 24px;
        background: var(--border);
      }

      @media (max-width: 960px) {
        .nav-inner { gap: var(--sp-3); flex-wrap: wrap; height: auto; padding-block: var(--sp-3); }
        .nav-links { order: 3; margin-inline: 0; width: 100%; overflow-x: auto; }
        .brand-sub { display: none; }
        .divider { display: none; }
      }

      .page {
        flex: 1 1 auto;
        width: 100%;
      }

      .site-footer {
        border-top: 1px solid var(--border);
        padding: var(--sp-8) 0;
        margin-top: var(--sp-16);
        color: var(--text-subtle);
        font-size: var(--fs-sm);
      }
      .footer-inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--sp-4);
        flex-wrap: wrap;
      }
    `,
  ],
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly authState = computed(() => ({
    loading: this.auth.isLoading(),
    authenticated: this.auth.isAuthenticated(),
    user: this.auth.user(),
  }));
}
