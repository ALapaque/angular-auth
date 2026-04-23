import { Component, computed, signal } from '@angular/core';

import {
  ADAPTER_OPTIONS,
  getSelectedAdapterKey,
  setSelectedAdapterKey,
} from './adapter-selection';

@Component({
  selector: 'app-adapter-switcher',
  standalone: true,
  template: `
    <label class="switcher">
      <span class="kicker kicker-bracket">Adapter</span>
      <select
        class="select"
        [value]="current()"
        (change)="switch($any($event.target).value)"
      >
        @for (option of options; track option.key) {
          <option [value]="option.key">{{ option.label }}</option>
        }
      </select>
    </label>
  `,
  styles: [
    `
      :host { display: inline-flex; }
      .switcher {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-3);
      }
      @media (max-width: 720px) {
        .switcher .kicker { display: none; }
      }
    `,
  ],
})
export class AdapterSwitcherComponent {
  readonly options = ADAPTER_OPTIONS;
  readonly current = signal(getSelectedAdapterKey());
  readonly currentOption = computed(
    () => this.options.find((o) => o.key === this.current()) ?? this.options[0],
  );

  switch(key: string): void {
    if (key === this.current()) return;
    setSelectedAdapterKey(key);
    location.reload();
  }
}
