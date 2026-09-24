import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Styles the confirm button as destructive. */
  destructive: boolean;
}

/**
 * Promise-based confirmation dialog. Used for every delete, and for leaving a
 * form with unsaved changes — nothing destructive happens on a single click.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly request = signal<ConfirmRequest | null>(null);
  private resolver: ((confirmed: boolean) => void) | null = null;

  readonly active = this.request.asReadonly();

  ask(options: Partial<ConfirmRequest> & { message: string }): Promise<boolean> {
    this.request.set({
      title: options.title ?? 'Are you sure?',
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'Confirm',
      cancelLabel: options.cancelLabel ?? 'Cancel',
      destructive: options.destructive ?? false
    });

    return new Promise<boolean>(resolve => {
      this.resolver = resolve;
    });
  }

  /** Convenience wrapper with delete-flavoured defaults. */
  askDelete(what: string): Promise<boolean> {
    return this.ask({
      title: `Delete ${what}?`,
      message: `This cannot be undone. ${what} will be removed from the website immediately.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Keep it',
      destructive: true
    });
  }

  resolve(confirmed: boolean): void {
    this.request.set(null);
    this.resolver?.(confirmed);
    this.resolver = null;
  }
}
