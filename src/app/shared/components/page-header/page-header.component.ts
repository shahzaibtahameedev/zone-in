import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0">
        @if (context()) {
          <p class="text-sm text-slate-500">{{ context() }}</p>
        }
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{{ title() }}</h1>
        @if (description()) {
          <p class="mt-1 text-sm text-slate-500">{{ description() }}</p>
        }
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly context = input('');
}
