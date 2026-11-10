import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  message: string;
  confirmLabel: string;
  isDestructive: boolean;
}

interface PendingConfirmation {
  options: ConfirmDialogOptions;
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly pendingConfirmation = signal<PendingConfirmation | null>(null);

  readonly openDialog = this.pendingConfirmation.asReadonly();

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    this.pendingConfirmation()?.resolve(false);

    const confirmation = new Promise<boolean>((resolve) => {
      this.pendingConfirmation.set({ options, resolve });
    });

    return confirmation;
  }

  respond(confirmed: boolean): void {
    this.pendingConfirmation()?.resolve(confirmed);
    this.pendingConfirmation.set(null);
  }
}
