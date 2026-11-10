import { Injectable, signal } from '@angular/core';
import { TOAST_DURATION_MS } from '../config/app.constants';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextToastId = 1;

  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  dismiss(toastId: number): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== toastId));
  }

  private show(message: string, type: ToastType): void {
    const toast: Toast = { id: this.nextToastId++, message, type };
    this.toasts.update((toasts) => toasts.concat(toast));
    setTimeout(() => this.dismiss(toast.id), TOAST_DURATION_MS);
  }
}
