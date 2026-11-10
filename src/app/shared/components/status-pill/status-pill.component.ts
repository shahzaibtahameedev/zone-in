import { Component, computed, input } from '@angular/core';

type PillTone = 'success' | 'danger' | 'neutral' | 'warning' | 'accent';

export type StatusPillKind = 'default' | 'match';

interface PillColors {
  pill: string;
  dot: string;
}

const PILL_COLORS: Record<PillTone, PillColors> = {
  success: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  danger: { pill: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  neutral: { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  warning: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  accent: { pill: 'bg-violet-50 text-violet-700', dot: 'bg-violet-500' },
};

@Component({
  selector: 'app-status-pill',
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
      [class]="colors().pill"
    >
      <span class="size-1.5 rounded-full" [class]="colors().dot" aria-hidden="true"></span>
      {{ status() }}
    </span>
  `,
})
export class StatusPillComponent {
  readonly status = input.required<string>();
  readonly kind = input<StatusPillKind>('default');

  protected readonly colors = computed(() => {
    const colors = PILL_COLORS[this.getTone()];

    return colors;
  });

  private getTone(): PillTone {
    switch (this.status()) {
      case 'Confirmed':
      case 'Published':
      case 'Resolved':
        return 'success';
      case 'Active':
        return this.kind() === 'match' ? 'accent' : 'success';
      case 'Cancelled':
        return 'danger';
      case 'Open':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}
