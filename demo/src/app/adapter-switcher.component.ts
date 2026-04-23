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
    <label>
      Active adapter
      <select [value]="current()" (change)="switch($any($event.target).value)">
        @for (option of options; track option.key) {
          <option [value]="option.key">{{ option.label }}</option>
        }
      </select>
    </label>
    <p class="hint">{{ currentOption().note }}</p>
  `,
  styles: [
    `
      :host { display: block; margin-bottom: 1rem; }
      label { display: flex; gap: 0.5rem; align-items: center; }
      select { padding: 0.25rem 0.5rem; }
      .hint { margin: 0.25rem 0 0; font-size: 0.85rem; opacity: 0.7; }
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
    // Reload to rebuild DI with the newly selected AuthProvider.
    location.reload();
  }
}
