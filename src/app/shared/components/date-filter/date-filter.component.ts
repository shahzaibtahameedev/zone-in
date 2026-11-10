import { Component, ElementRef, computed, input, model, viewChild } from '@angular/core';
import { LucideCalendar, LucideX } from '@lucide/angular';
import { formatDisplayDate } from '../../../core/utils/date-time.utils';

@Component({
  selector: 'app-date-filter',
  imports: [LucideCalendar, LucideX],
  template: `
    <div class="relative inline-flex items-center gap-1">
      <button
        type="button"
        class="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:outline-none"
        [attr.aria-label]="label() + ': ' + displayValue() + '. Choose a date'"
        (click)="openPicker()"
      >
        <svg lucideCalendar class="size-4 text-slate-500"></svg>
        {{ displayValue() }}
      </button>
      @if (allowClear() && value()) {
        <button
          type="button"
          class="inline-flex size-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="Clear date"
          (click)="value.set('')"
        >
          <svg lucideX class="size-4"></svg>
        </button>
      }
      <input
        #picker
        type="date"
        class="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
        tabindex="-1"
        aria-hidden="true"
        [value]="value()"
        [min]="min()"
        (change)="onDateChange(picker.value)"
      />
    </div>
  `,
})
export class DateFilterComponent {
  readonly value = model.required<string>();
  readonly label = input('Date');
  readonly min = input('');
  readonly allowClear = input(false);
  readonly emptyLabel = input('All dates');

  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');

  protected readonly displayValue = computed(() => {
    const value = this.value();
    const displayValue = value ? formatDisplayDate(value) : this.emptyLabel();

    return displayValue;
  });

  protected openPicker(): void {
    const pickerElement = this.picker().nativeElement;
    try {
      pickerElement.showPicker();
    } catch {
      pickerElement.focus();
      pickerElement.click();
    }
  }

  protected onDateChange(newValue: string): void {
    const isClearingNotAllowed = newValue === '' && !this.allowClear();
    if (isClearingNotAllowed) {
      return;
    }

    this.value.set(newValue);
  }
}
