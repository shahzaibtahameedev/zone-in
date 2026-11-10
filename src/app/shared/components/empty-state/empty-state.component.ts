import { Component, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconInput } from '@lucide/angular';

@Component({
  selector: 'app-empty-state',
  imports: [LucideDynamicIcon],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <span
        class="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"
      >
        <svg [lucideIcon]="icon()" class="size-5"></svg>
      </span>
      <p class="max-w-sm text-sm text-slate-500">{{ message() }}</p>
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input.required<LucideIconInput>();
  readonly message = input.required<string>();
}
