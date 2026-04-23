import { Component, input } from '@angular/core';

@Component({
  selector: 'app-code',
  standalone: true,
  template: `
    <figure class="code">
      <figcaption>
        <span class="code-lang">{{ lang() }}</span>
        @if (title()) {
          <span class="code-title">{{ title() }}</span>
        }
      </figcaption>
      <pre><code>{{ code() }}</code></pre>
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
        gap: var(--sp-3);
        padding: var(--sp-3) var(--sp-4);
        border-bottom: var(--border-w) solid color-mix(in srgb, var(--surface-strong-text) 15%, transparent);
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
      .code-title {
        font-family: var(--font-mono);
        font-size: var(--fs-xs);
        color: color-mix(in srgb, var(--surface-strong-text) 70%, transparent);
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
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input<string>('typescript');
  readonly title = input<string | undefined>();
}
