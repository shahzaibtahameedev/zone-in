import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconInput } from '@lucide/angular';

export type StatTone = 'violet' | 'emerald' | 'amber' | 'sky' | 'pink';

const TONE_CLASSES: Record<StatTone, string> = {
  violet: 'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  pink: 'bg-pink-50 text-pink-700',
};

@Component({
  selector: 'app-stat-card',
  imports: [LucideDynamicIcon],
  template: `
    <article class="card flex h-full flex-col">
      <span class="flex size-10 items-center justify-center rounded-xl" [class]="toneClasses()">
        <svg [lucideIcon]="icon()" class="size-5"></svg>
      </span>
      <p class="mt-4 text-sm text-slate-500">{{ label() }}</p>
      <p class="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{{ value() }}</p>
      @if (caption()) {
        <p class="mt-1 text-xs text-slate-500">{{ caption() }}</p>
      }
    </article>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<LucideIconInput>();
  readonly tone = input<StatTone>('violet');
  readonly caption = input('');

  protected readonly toneClasses = computed(() => {
    const toneClasses = TONE_CLASSES[this.tone()];

    return toneClasses;
  });
}
