import { Component, input } from '@angular/core';
import { LucideCircleCheck } from '@lucide/angular';

@Component({
  selector: 'app-success-panel',
  imports: [LucideCircleCheck],
  template: `
    <section
      class="mx-auto mt-6 w-full max-w-xl rounded-2xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-600/10"
      role="status"
    >
      <span
        class="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
      >
        <svg lucideCircleCheck class="size-6"></svg>
      </span>
      <h1 class="mt-4 text-2xl font-semibold tracking-tight text-emerald-900">{{ title() }}</h1>
      <p class="mt-2 text-sm text-emerald-800">{{ message() }}</p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <ng-content />
      </div>
    </section>
  `,
})
export class SuccessPanelComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
