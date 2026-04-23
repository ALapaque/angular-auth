import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from 'generic-angular-auth';

import { getSelectedAdapter } from '../adapter-selection';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section-sm profile-hero">
      <div class="container">
        <span class="kicker kicker-bracket">protected route</span>
        <h1 class="profile-title">
          Welcome back,
          <span class="text-gradient">{{ displayName() }}</span>.
        </h1>
        <p class="lede">
          You landed here because <code>authGuard</code> let you through — the
          adapter below provides the identity, the shared <code>AuthService</code>
          exposes it to every component.
        </p>
      </div>
    </section>

    <section class="section-sm" aria-labelledby="identity-title">
      <div class="container">
        <h2 id="identity-title" class="sr-only">Your session</h2>

        <div class="profile-bento">
          <!-- Identity tile (span 2) -->
          <article class="card tile-identity">
            <header class="identity-head">
              <span class="identity-mark" aria-hidden="true">
                @if (user()?.picture; as pic) {
                  <img [src]="pic" alt="" />
                } @else {
                  <span>{{ initials() }}</span>
                }
              </span>
              <div class="identity-text">
                <span class="kicker">signed in · {{ adapterLabel }}</span>
                <h3>{{ displayName() }}</h3>
                @if (user()?.email; as email) {
                  <p class="muted identity-email">{{ email }}</p>
                }
              </div>
            </header>

            @if (roles().length) {
              <div class="identity-roles">
                <span class="hint">roles</span>
                <ul class="cluster">
                  @for (role of roles(); track role) {
                    <li><span class="badge badge-soft">{{ role }}</span></li>
                  }
                </ul>
              </div>
            } @else {
              <p class="muted"><span class="hint">roles</span> — no roles on this user.</p>
            }

            <div class="identity-actions cluster">
              <button type="button" class="btn btn-primary" (click)="auth.logout()">
                Log out
              </button>
              <button
                type="button"
                class="btn"
                [attr.aria-busy]="tokenLoading()"
                [disabled]="tokenLoading()"
                (click)="fetchToken()"
              >
                @if (tokenLoading()) { Requesting… } @else { Get access token }
              </button>
            </div>
          </article>

          <!-- Status tile -->
          <article class="card tile-status">
            <span class="kicker">session status</span>
            <ul class="status-list">
              <li>
                <span class="status-label">Authenticated</span>
                <span class="badge" [class.badge-success]="auth.isAuthenticated()" [class.badge-dot]="auth.isAuthenticated()">
                  {{ auth.isAuthenticated() ? 'true' : 'false' }}
                </span>
              </li>
              <li>
                <span class="status-label">Loading</span>
                <span class="badge" [class.badge-soft]="auth.isLoading()">
                  {{ auth.isLoading() ? 'true' : 'false' }}
                </span>
              </li>
              <li>
                <span class="status-label">Adapter</span>
                <span class="badge badge-solid">{{ adapterKey }}</span>
              </li>
              <li>
                <span class="status-label">User&nbsp;id</span>
                <code class="status-id">{{ user()?.id || '—' }}</code>
              </li>
            </ul>
          </article>

          <!-- Claims tile (full width, inverse) -->
          <article class="card card-inverse tile-claims">
            <header class="claims-head">
              <span class="kicker">auth.user()</span>
              <span class="badge badge-accent">live signal</span>
            </header>
            <pre class="claims-pre"><code>{{ userJson() }}</code></pre>
            @if (tokenPreview()) {
              <div class="claims-foot">
                <span class="kicker">latest access token</span>
                <code class="claims-token">{{ tokenPreview() }}</code>
              </div>
            }
          </article>
        </div>

        <div class="callout profile-note">
          <div>
            <p>
              <strong>Route protection.</strong> This component is reached through
              <code>canActivate: [authGuard]</code> in
              <code>app.routes.ts</code>. Swap the adapter from the nav and the
              guard re-evaluates using the new provider — your route code never
              changes.
            </p>
            <p class="muted" style="margin-top: var(--sp-3);">
              Want to see how it's wired? Read the
              <a routerLink="/docs/guards-interceptors">guards &amp; interceptors guide</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }

      .profile-hero { padding-top: clamp(3rem, 6vw, 5rem); }
      .profile-title {
        font-size: clamp(2rem, 4vw + 0.5rem, 3.25rem);
        line-height: 1.05;
        letter-spacing: var(--tracking-tight);
        margin: var(--sp-3) 0 var(--sp-3);
      }

      /* ============ BENTO ============ */
      .profile-bento {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--sp-5);
      }
      .tile-identity { grid-column: span 2; display: flex; flex-direction: column; gap: var(--sp-6); }
      .tile-status   { grid-column: span 1; display: flex; flex-direction: column; gap: var(--sp-4); }
      .tile-claims   { grid-column: span 3; }

      @media (max-width: 900px) {
        .profile-bento { grid-template-columns: 1fr; }
        .tile-identity, .tile-status, .tile-claims { grid-column: span 1; }
      }

      /* ============ IDENTITY ============ */
      .identity-head {
        display: flex;
        align-items: center;
        gap: var(--sp-5);
      }
      .identity-mark {
        flex-shrink: 0;
        width: 72px; height: 72px;
        display: grid; place-items: center;
        border-radius: var(--r-md);
        background: var(--grad-primary);
        color: #fff;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.5rem;
        letter-spacing: var(--tracking-tight);
        overflow: hidden;
        border: var(--border-w-strong) solid transparent;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent);
      }
      .identity-mark img { width: 100%; height: 100%; object-fit: cover; }
      .identity-text { display: flex; flex-direction: column; gap: var(--sp-1); min-width: 0; }
      .identity-text h3 {
        font-size: clamp(1.25rem, 1vw + 0.85rem, 1.75rem);
        letter-spacing: var(--tracking-snug);
      }
      .identity-email {
        font-family: var(--font-mono);
        font-size: var(--fs-sm);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .identity-roles {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        padding-top: var(--sp-5);
        border-top: var(--border-w) solid var(--border-subtle);
      }
      .identity-roles ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .identity-actions {
        padding-top: var(--sp-5);
        border-top: var(--border-w) solid var(--border-subtle);
      }

      /* ============ STATUS ============ */
      .status-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
      }
      .status-list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-3);
      }
      .status-label {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        color: var(--text-subtle);
      }
      .status-id {
        font-size: var(--fs-xs);
        max-width: 55%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* ============ CLAIMS ============ */
      .claims-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-3);
        padding-bottom: var(--sp-4);
        border-bottom: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 15%, transparent);
        margin-bottom: var(--sp-5);
      }
      .claims-head .kicker { color: color-mix(in srgb, var(--surface-strong-text) 60%, transparent); }

      .claims-pre {
        margin: 0;
        font-size: clamp(0.8125rem, 0.5vw + 0.72rem, 0.9375rem);
        line-height: 1.7;
        color: color-mix(in srgb, var(--surface-strong-text) 92%, transparent);
        white-space: pre;
        overflow-x: auto;
        max-height: 360px;
        overflow-y: auto;
      }
      .claims-pre code {
        padding: 0;
        background: transparent;
        border: none;
        color: inherit;
      }

      .claims-foot {
        margin-top: var(--sp-6);
        padding-top: var(--sp-5);
        border-top: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 15%, transparent);
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
      }
      .claims-foot .kicker { color: color-mix(in srgb, var(--surface-strong-text) 60%, transparent); }
      .claims-token {
        padding: var(--sp-3) var(--sp-4);
        background: color-mix(in srgb, var(--surface-strong-text) 10%, transparent);
        border: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 18%, transparent);
        border-radius: var(--r-sm);
        color: color-mix(in srgb, var(--surface-strong-text) 92%, transparent);
        font-size: var(--fs-xs);
        overflow-wrap: anywhere;
        word-break: break-all;
      }

      /* ============ NOTE ============ */
      .profile-note { margin-top: var(--sp-8); }
    `,
  ],
})
export class ProfileComponent {
  readonly auth = inject(AuthService);

  private readonly adapter = getSelectedAdapter();
  readonly adapterKey = this.adapter.key;
  readonly adapterLabel = this.adapter.label;

  readonly user = this.auth.user;

  readonly displayName = computed(() => this.user()?.name || this.user()?.email || 'friend');

  readonly initials = computed(() => {
    const name = this.user()?.name?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
      return letters.toUpperCase();
    }
    return (this.user()?.email?.[0] || '?').toUpperCase();
  });

  readonly roles = computed<readonly string[]>(() => this.user()?.roles ?? []);

  readonly tokenLoading = signal(false);
  readonly tokenPreview = signal<string | null>(null);

  userJson(): string {
    return JSON.stringify(this.user(), null, 2);
  }

  async fetchToken(): Promise<void> {
    this.tokenLoading.set(true);
    try {
      const token = await this.auth.getAccessToken();
      this.tokenPreview.set(token ? this.abbreviate(token) : '(no token for this adapter)');
    } catch (err) {
      this.tokenPreview.set(`(failed) ${String(err)}`);
    } finally {
      this.tokenLoading.set(false);
    }
  }

  private abbreviate(token: string): string {
    if (token.length <= 80) return token;
    return `${token.slice(0, 48)}…${token.slice(-16)}`;
  }
}
