import { Component, computed, effect, input, signal } from '@angular/core';

interface InstallGroup {
  readonly note?: string;
  readonly packages: string;
}

type ManagerKey = 'npm' | 'yarn' | 'pnpm' | 'bun';

interface Manager {
  readonly key: ManagerKey;
  readonly label: string;
  readonly cmd: string;
}

const MANAGERS: readonly Manager[] = [
  { key: 'npm', label: 'npm', cmd: 'npm install' },
  { key: 'yarn', label: 'yarn', cmd: 'yarn add' },
  { key: 'pnpm', label: 'pnpm', cmd: 'pnpm add' },
  { key: 'bun', label: 'bun', cmd: 'bun add' },
];

const STORAGE_KEY = 'generic-auth-demo.pm';

function readStoredManager(): ManagerKey {
  if (typeof localStorage === 'undefined') return 'npm';
  const v = localStorage.getItem(STORAGE_KEY);
  return MANAGERS.some((m) => m.key === v) ? (v as ManagerKey) : 'npm';
}

@Component({
  selector: 'app-package-install',
  standalone: true,
  template: `
    <figure class="code">
      <figcaption>
        <span class="code-lang">Install</span>
        <div class="pm-tabs" role="tablist" aria-label="Package manager">
          @for (m of managers; track m.key) {
            <button
              type="button"
              role="tab"
              [id]="'pm-tab-' + m.key"
              [class.is-active]="active() === m.key"
              [attr.aria-selected]="active() === m.key"
              [attr.tabindex]="active() === m.key ? 0 : -1"
              (click)="select(m.key)"
            >
              {{ m.label }}
            </button>
          }
        </div>
      </figcaption>
      <pre><code>{{ currentCommand() }}</code></pre>
    </figure>
  `,
  styles: [
    `
      :host { display: block; margin: var(--sp-5) 0; }

      .code {
        margin: 0;
        background: var(--surface-strong);
        color: var(--surface-strong-text);
        border: var(--border-w-strong) solid var(--surface-strong);
        border-radius: var(--r-md);
        overflow: hidden;
      }

      figcaption {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-3);
        padding: var(--sp-2) var(--sp-3) var(--sp-2) var(--sp-4);
        border-bottom: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 15%, transparent);
        flex-wrap: wrap;
      }

      .code-lang {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        color: color-mix(in srgb, var(--surface-strong-text) 55%, transparent);
        padding: 2px var(--sp-2);
        border-radius: var(--r-xs);
        border: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 20%, transparent);
      }

      .pm-tabs {
        display: inline-flex;
        gap: 2px;
        padding: 2px;
        background: color-mix(in srgb, var(--surface-strong-text) 8%, transparent);
        border: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 15%, transparent);
        border-radius: var(--r-sm);
      }
      .pm-tabs button {
        appearance: none;
        background: transparent;
        border: 0;
        padding: 4px var(--sp-3);
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        font-weight: 500;
        letter-spacing: var(--tracking-snug);
        color: color-mix(in srgb, var(--surface-strong-text) 60%, transparent);
        cursor: pointer;
        border-radius: var(--r-xs);
        transition:
          color var(--dur-fast) var(--ease-out),
          background var(--dur-fast) var(--ease-out);
      }
      .pm-tabs button:hover {
        color: color-mix(in srgb, var(--surface-strong-text) 90%, transparent);
      }
      .pm-tabs button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--accent);
      }
      .pm-tabs button.is-active {
        background: color-mix(in srgb, var(--surface-strong-text) 18%, transparent);
        color: var(--surface-strong-text);
      }

      pre {
        margin: 0;
        padding: var(--sp-5) var(--sp-6);
        font-family: var(--font-mono);
        font-size: clamp(0.8125rem, 0.5vw + 0.72rem, 0.9375rem);
        line-height: 1.7;
        color: color-mix(in srgb, var(--surface-strong-text) 92%, transparent);
        overflow-x: auto;
        white-space: pre;
      }
      code {
        padding: 0;
        background: transparent;
        border: none;
        color: inherit;
      }
    `,
  ],
})
export class PackageInstallComponent {
  readonly groups = input.required<readonly InstallGroup[]>();

  readonly managers = MANAGERS;
  readonly active = signal<ManagerKey>(readStoredManager());

  constructor() {
    effect(() => {
      const key = this.active();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, key);
      }
    });
  }

  select(key: ManagerKey): void {
    this.active.set(key);
  }

  readonly currentCommand = computed(() => {
    const m = MANAGERS.find((x) => x.key === this.active()) ?? MANAGERS[0];
    return this.groups()
      .map((g) => {
        const comment = g.note ? `# ${g.note}\n` : '';
        return `${comment}${m.cmd} ${g.packages}`;
      })
      .join('\n\n');
  });
}
