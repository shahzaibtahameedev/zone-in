import { Component, inject } from '@angular/core';
import { LucideCircleCheck, LucideCircleX, LucideX } from '@lucide/angular';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [LucideCircleCheck, LucideCircleX, LucideX],
  template: `
    <div
      class="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 rounded-xl bg-slate-900 py-1 pr-1 pl-4 text-sm text-white"
        >
          @if (toast.type === 'success') {
            <svg lucideCircleCheck class="size-5 shrink-0 text-emerald-400"></svg>
          } @else {
            <svg lucideCircleX class="size-5 shrink-0 text-rose-400"></svg>
          }
          <p class="flex-1 py-2">{{ toast.message }}</p>
          <button
            type="button"
            class="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss message"
            (click)="toastService.dismiss(toast.id)"
          >
            <svg lucideX class="size-4"></svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
