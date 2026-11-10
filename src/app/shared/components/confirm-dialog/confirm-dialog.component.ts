import { Component, ElementRef, afterRenderEffect, inject, viewChild } from '@angular/core';
import { LucideCircleAlert, LucideTriangleAlert } from '@lucide/angular';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [LucideTriangleAlert, LucideCircleAlert],
  host: { '(document:keydown.escape)': 'respond(false)' },
  template: `
    @if (confirmDialog.openDialog(); as pending) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        (click)="respond(false)"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
          class="w-full max-w-md rounded-2xl bg-white p-6"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start gap-4">
            @if (pending.options.isDestructive) {
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
              >
                <svg lucideTriangleAlert class="size-5"></svg>
              </span>
            } @else {
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"
              >
                <svg lucideCircleAlert class="size-5"></svg>
              </span>
            }
            <div class="min-w-0">
              <h2
                id="confirm-dialog-title"
                class="text-lg font-semibold tracking-tight text-slate-900"
              >
                Are you sure?
              </h2>
              <p id="confirm-dialog-message" class="mt-1 text-sm text-slate-500">
                {{ pending.options.message }}
              </p>
            </div>
          </div>
          <div class="mt-6 flex flex-wrap justify-end gap-3">
            <button #cancelButton type="button" class="btn-secondary" (click)="respond(false)">
              Cancel
            </button>
            <button
              type="button"
              [class]="pending.options.isDestructive ? 'btn-danger' : 'btn-primary'"
              (click)="respond(true)"
            >
              {{ pending.options.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirmDialog = inject(ConfirmDialogService);

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    afterRenderEffect(() => {
      this.cancelButton()?.nativeElement.focus();
    });
  }

  protected respond(confirmed: boolean): void {
    this.confirmDialog.respond(confirmed);
  }
}
