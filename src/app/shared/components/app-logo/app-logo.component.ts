import { Component } from '@angular/core';
import { LucideGamepad2 } from '@lucide/angular';
import { APP_NAME } from '../../../core/config/app.constants';

@Component({
  selector: 'app-logo',
  imports: [LucideGamepad2],
  template: `
    <span class="flex items-center gap-2.5">
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white"
      >
        <svg lucideGamepad2 class="size-[1.125rem]"></svg>
      </span>
      <span class="text-base font-semibold tracking-tight text-slate-900">{{ appName }}</span>
    </span>
  `,
})
export class AppLogoComponent {
  protected readonly appName = APP_NAME;
}
