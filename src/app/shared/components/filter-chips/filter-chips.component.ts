import { Component, input, model } from '@angular/core';
import { FilterOption } from '../../../core/models';

@Component({
  selector: 'app-filter-chips',
  template: `
    <div class="flex flex-wrap gap-2" role="group" [attr.aria-label]="label()">
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="option.value === selected()"
          (click)="selected.set(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class FilterChipsComponent {
  readonly options = input.required<FilterOption[]>();
  readonly label = input.required<string>();
  readonly selected = model.required<string>();
}
