import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-code',
  standalone: true,
  template: `
    <figure class="codeblock">
      <header class="codeblock-head">
        <span class="codeblock-lang">{{ lang() }}</span>
        <button
          type="button"
          class="btn btn-sm btn-ghost codeblock-copy"
          (click)="copy()"
          [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
        >
          @if (copied()) {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Copied
          } @else {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          }
        </button>
      </header>
      <pre><code>{{ code() }}</code></pre>
    </figure>
  `,
  styles: [
    `
      :host { display: block; margin: var(--sp-4) 0; }

      .codeblock {
        margin: 0;
        background: var(--surface-inset);
        border: 1px solid var(--border);
        border-radius: var(--r-md);
        overflow: hidden;
      }

      .codeblock-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--sp-2) var(--sp-3) var(--sp-2) var(--sp-4);
        background: var(--surface-2);
        border-bottom: 1px solid var(--border);
      }

      .codeblock-lang {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        color: var(--text-subtle);
        text-transform: lowercase;
        letter-spacing: 0.05em;
      }

      .codeblock-copy {
        height: 28px;
        font-size: var(--fs-xs);
        padding: 0 var(--sp-2);
        gap: var(--sp-1);
        min-width: unset;
      }

      pre {
        margin: 0;
        padding: var(--sp-4);
        background: transparent;
        border: 0;
        border-radius: 0;
        font-size: var(--fs-sm);
        line-height: 1.6;
      }
    `,
  ],
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input<string>('typescript');
  readonly copied = signal(false);

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      // Clipboard unavailable — fail silently; users can still select & copy.
    }
  }
}
