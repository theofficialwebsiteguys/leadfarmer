import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

/** Transient "Saved" / "Couldn't save" confirmations shown in the corner. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly items = signal<Toast[]>([]);

  readonly toasts = this.items.asReadonly();

  success(message: string): void {
    this.push('success', message, 3200);
  }

  /** Errors linger longer — the user may need to read and act on them. */
  error(message: string): void {
    this.push('error', message, 7000);
  }

  dismiss(id: number): void {
    this.items.update(list => list.filter(toast => toast.id !== id));
  }

  private push(kind: Toast['kind'], message: string, ms: number): void {
    const id = this.nextId++;
    this.items.update(list => [...list, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), ms);
  }
}
