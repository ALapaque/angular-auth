import { DOCUMENT, Component, HostListener, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
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

    <header class="nav" role="banner" [class.is-mobile-open]="mobileOpen()">
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

        <button
          type="button"
          class="nav-toggle"
          (click)="toggleMobile()"
          [attr.aria-expanded]="mobileOpen()"
          aria-controls="mobile-drawer"
          [attr.aria-label]="mobileOpen() ? 'Close menu' : 'Open menu'"
        >
          @if (mobileOpen()) {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          }
        </button>
      </div>
    </header>

    <div
      class="mobile-backdrop"
      [class.is-open]="mobileOpen()"
      (click)="closeMobile()"
      aria-hidden="true"
    ></div>

    <aside
      id="mobile-drawer"
      class="mobile-drawer"
      [class.is-open]="mobileOpen()"
      aria-label="Mobile navigation"
    >
      <nav class="mobile-drawer-links" aria-label="Primary (mobile)">
        <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/profile" routerLinkActive="is-active">Profile</a>
        <a routerLink="/docs" routerLinkActive="is-active">Docs</a>
      </nav>

      <div class="mobile-drawer-section">
        <span class="kicker">Adapter</span>
        <app-adapter-switcher />
      </div>

      <div class="mobile-drawer-section">
        <span class="kicker">Session</span>
        @if (auth.isLoading()) {
          <span class="badge badge-dot subtle">Loading</span>
        } @else if (auth.isAuthenticated()) {
          <span class="badge badge-success badge-dot">{{ auth.user()?.name || 'Signed in' }}</span>
          <button type="button" class="btn" (click)="auth.logout()">Logout</button>
        } @else {
          <button type="button" class="btn btn-primary" (click)="auth.login()">Login</button>
        }
      </div>

      <div class="mobile-drawer-meta">
        <app-theme-toggle />
        <a
          class="btn btn-ghost"
          href="https://github.com/ALapaque/angular-auth"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
            <path d="M9 18c-4.51 2-5-2-7-2"/>
          </svg>
          GitHub
        </a>
      </div>
    </aside>

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
        min-width: 0;
      }
      .brand:hover { color: var(--text); text-decoration: none; }
      .brand-mark {
        display: grid; place-items: center;
        width: 34px; height: 34px;
        color: #fff;
        background: var(--grad-primary);
        border-radius: var(--r-sm);
        flex-shrink: 0;
      }
      .brand-text { display: flex; flex-direction: column; line-height: 1.1; min-width: 0; }
      .brand-name {
        font-size: var(--fs-sm);
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
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

      /* Mobile hamburger — hidden on desktop */
      .nav-toggle {
        display: none;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        color: var(--text);
        background: transparent;
        border: var(--border-w-strong) solid var(--border);
        border-radius: var(--r-sm);
        cursor: pointer;
        transition:
          border-color var(--dur-fast) var(--ease-out),
          background var(--dur-fast) var(--ease-out);
      }
      .nav-toggle:hover {
        border-color: var(--border-strong);
        background: var(--surface-2);
      }
      .nav-toggle:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--accent);
      }

      /* Mobile drawer + backdrop — hidden on desktop */
      .mobile-backdrop,
      .mobile-drawer { display: none; }

      @media (max-width: 900px) {
        .nav-inner { gap: var(--sp-4); }
        .nav-links { display: none; }
        .nav-right { display: none; }
        .nav-toggle { display: inline-flex; margin-left: auto; }

        .brand-tag { display: none; }
        .brand-name {
          max-width: 60vw;
        }

        .mobile-backdrop {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 45;
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--dur-base) var(--ease-out);
        }
        .mobile-backdrop.is-open {
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-drawer {
          display: flex;
          flex-direction: column;
          gap: var(--sp-6);
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(86vw, 340px);
          padding: calc(var(--nav-h) + var(--sp-4)) var(--sp-5) var(--sp-8);
          background: var(--bg);
          border-left: var(--border-w) solid var(--border);
          box-shadow: -20px 0 60px -20px rgba(0, 0, 0, 0.45);
          z-index: 46;
          transform: translateX(100%);
          transition: transform var(--dur-base) var(--ease-out);
          overflow-y: auto;
          overscroll-behavior: contain;
        }
        .mobile-drawer.is-open { transform: translateX(0); }

        /* Raise the sticky nav above drawer so toggle stays tappable */
        .nav { z-index: 47; }

        .mobile-drawer-links {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
        }
        .mobile-drawer-links a {
          display: flex;
          align-items: center;
          padding: var(--sp-3) var(--sp-3);
          color: var(--text);
          font-size: var(--fs-lg);
          font-weight: 500;
          letter-spacing: var(--tracking-snug);
          text-decoration: none;
          border-radius: var(--r-sm);
          border-left: 3px solid transparent;
        }
        .mobile-drawer-links a:hover,
        .mobile-drawer-links a:focus-visible {
          background: var(--surface-2);
          outline: none;
          text-decoration: none;
        }
        .mobile-drawer-links a.is-active {
          border-left-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 10%, transparent);
        }

        .mobile-drawer-section {
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
          padding-top: var(--sp-5);
          border-top: var(--border-w) solid var(--border);
        }
        .mobile-drawer-section .kicker { color: var(--text-subtle); }
        .mobile-drawer-section .badge { align-self: flex-start; }
        .mobile-drawer-section .btn { align-self: stretch; }

        .mobile-drawer-meta {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          padding-top: var(--sp-5);
          margin-top: auto;
          border-top: var(--border-w) solid var(--border);
        }
        .mobile-drawer-meta .btn { flex: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .mobile-drawer,
        .mobile-backdrop { transition: none; }
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
        flex-wrap: wrap;
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
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);

  readonly mobileOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.mobileOpen.set(false));

    effect(() => {
      const body = this.doc.body;
      if (!body) return;
      body.style.overflow = this.mobileOpen() ? 'hidden' : '';
    });
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileOpen()) this.closeMobile();
  }
}
