import { Component, inject } from '@angular/core';
import { ConfirmService } from '../services/confirm.service';
import { ToastService } from '../services/toast.service';

/**
 * Renders the confirmation dialog and the toast stack.
 *
 * Mounted once by the admin layout; both are driven by services so any screen
 * can raise them without wiring inputs through the component tree.
 */
@Component({
  selector: 'app-admin-overlays',
  standalone: true,
  template: `
    @if (confirmService.active(); as request) {
      <div class="admin-overlay" role="presentation" (click)="confirmService.resolve(false)">
        <div
          class="admin-overlay__dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
          (click)="$event.stopPropagation()"
        >
          <h2 id="confirm-title" class="admin-overlay__title">{{ request.title }}</h2>
          <p id="confirm-message" class="admin-overlay__message">{{ request.message }}</p>

          <div class="admin-overlay__actions">
            <button type="button" class="admin__btn admin__btn--secondary" (click)="confirmService.resolve(false)">
              {{ request.cancelLabel }}
            </button>
            <button
              type="button"
              class="admin__btn"
              [class.admin__btn--danger]="request.destructive"
              (click)="confirmService.resolve(true)"
              autofocus
            >
              {{ request.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }

    <div class="admin-toasts" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="admin-toasts__item" [class]="'admin-toasts__item admin-toasts__item--' + toast.kind">
          <span>{{ toast.message }}</span>
          <button
            type="button"
            class="admin-toasts__close"
            aria-label="Dismiss notification"
            (click)="toastService.dismiss(toast.id)"
          >&times;</button>
        </div>
      }
    </div>
  `
})
export class AdminOverlaysComponent {
  readonly confirmService = inject(ConfirmService);
  readonly toastService = inject(ToastService);
}
