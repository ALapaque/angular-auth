import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@amaurylapaque/angular-auth';

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
        <a class="brand" routerLink="/" aria-label="Home">
          <span class="brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <span class="brand-text">
            <span class="brand-name">&#64;amaurylapaque/angular-auth</span>
            <span class="brand-tag">v1.0 · live demo</span>
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
            <span class="badge badge-dot subtle">Loading</span>
          } @else if (auth.isAuthenticated()) {
            <span class="badge badge-success badge-dot">{{ auth.user()?.name || 'Signed in' }}</span>
            <button type="button" class="btn btn-sm" (click)="auth.logout()">Logout</button>
          } @else {
            <button type="button" class="btn btn-sm btn-primary" (click)="auth.login()">Login</button>
          }
          <app-theme-toggle />
          <a
            class="btn btn-ghost btn-icon"
            href="https://github.com/ALapaque/angular-auth"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Repository on GitHub"
            title="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <main id="main" role="main">
      <router-outlet />
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <span>&#64;amaurylapaque/angular-auth · MIT</span>
        </div>
        <nav class="footer-links" aria-label="Footer">
          <a href="https://github.com/ALapaque/angular-auth" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.npmjs.com/package/@amaurylapaque/angular-auth" target="_blank" rel="noopener noreferrer">npm</a>
          <a routerLink="/docs">Docs</a>
          <a routerLink="/docs/security">Security</a>
        </nav>
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
        background: var(--surface-strong);
        color: var(--surface-strong-text);
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--r-sm);
        z-index: 100;
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
      }
      .skip-link:focus { top: var(--sp-3); }

      .nav {
        position: sticky;
        top: 0;
        z-index: 40;
        background: color-mix(in srgb, var(--bg) 82%, transparent);
        backdrop-filter: saturate(180%) blur(14px);
        -webkit-backdrop-filter: saturate(180%) blur(14px);
        border-bottom: var(--border-w) solid var(--border);
      }
      .nav-inner {
        display: flex;
        align-items: center;
        gap: var(--sp-8);
        height: var(--nav-h);
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-3);
        color: var(--text);
        text-decoration: none;
        font-family: var(--font-display);
        letter-spacing: var(--tracking-snug);
      }
      .brand:hover { color: var(--text); text-decoration: none; }
      .brand-mark {
        display: grid; place-items: center;
        width: 34px; height: 34px;
        color: #fff;
        background: var(--grad-primary);
        border-radius: var(--r-sm);
      }
      .brand-text { display: flex; flex-direction: column; line-height: 1.1; }
      .brand-name { font-size: var(--fs-sm); font-weight: 600; }
      .brand-tag {
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        color: var(--text-subtle);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
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
        border-radius: var(--r-sm);
        text-decoration: none;
      }
      .nav-links a:hover { color: var(--text); background: var(--surface-2); text-decoration: none; }
      .nav-links a.is-active {
        color: var(--text);
        background: var(--surface-2);
      }
      .nav-links a.is-active::after {
        content: '';
        position: absolute;
        left: var(--sp-3); right: var(--sp-3);
        bottom: 2px;
        height: 2px;
        background: var(--grad-primary);
        border-radius: 2px;
      }

      .nav-right {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
      }
      .divider { width: 1px; height: 24px; background: var(--border); }

      @media (max-width: 1024px) {
        .nav-inner { gap: var(--sp-3); flex-wrap: wrap; height: auto; padding-block: var(--sp-3); }
        .nav-links { order: 3; margin-inline: 0; width: 100%; overflow-x: auto; }
        .brand-tag { display: none; }
        .divider { display: none; }
      }

      main { flex: 1 1 auto; width: 100%; min-width: 0; }

      .site-footer {
        margin-top: var(--section-gap);
        border-top: var(--border-w) solid var(--border);
        background: var(--surface);
      }
      .footer-inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--sp-5);
        flex-wrap: wrap;
        padding-block: var(--sp-8);
      }
      .footer-brand {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-3);
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        color: var(--text-muted);
      }
      .footer-brand .brand-mark { width: 28px; height: 28px; }
      .footer-links {
        display: flex;
        gap: var(--sp-5);
        font-size: var(--fs-sm);
      }
      .footer-links a {
        color: var(--text-muted);
        text-decoration: none;
      }
      .footer-links a:hover { color: var(--text); text-decoration: underline; }
    `,
  ],
})
export class AppComponent {
  readonly auth = inject(AuthService);
}
