import { Component, input } from '@angular/core';

@Component({
  selector: 'app-code',
  standalone: true,
  template: `
    <pre [attr.data-lang]="lang()"><code>{{ code() }}</code></pre>
  `,
  styles: [
    `
      :host { display: block; margin: 0.75rem 0; }
      pre {
        margin: 0;
        padding: 0.9rem 1rem;
        border-radius: 6px;
        background: color-mix(in srgb, currentColor 10%, transparent);
        overflow-x: auto;
        font-size: 0.85rem;
        line-height: 1.45;
      }
      pre[data-lang]::before {
        content: attr(data-lang);
        display: block;
        font-size: 0.7rem;
        opacity: 0.5;
        margin-bottom: 0.4rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    `,
  ],
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input<string>('typescript');
}
