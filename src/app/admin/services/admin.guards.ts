import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';
import { ConfirmService } from './confirm.service';

/**
 * Keeps signed-out users out of the dashboard UI.
 *
 * This is a navigation convenience, NOT a security boundary — every admin API
 * endpoint independently requires a valid session cookie, so bypassing this
 * guard would show an empty shell and nothing else.
 */
export const adminAuthGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  // On a hard refresh we have not asked the server yet.
  if (!auth.hasChecked()) {
    await auth.refreshSession();
  }

  return auth.isAuthenticated() ? true : router.createUrlTree(['/admin/login']);
};

/** Sends an already-signed-in user straight to the dashboard. */
export const adminLoginGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  if (!auth.hasChecked()) {
    await auth.refreshSession();
  }

  return auth.isAuthenticated() ? router.createUrlTree(['/admin']) : true;
};

/** Implemented by every editing screen so navigation can warn about edits. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Warns before navigating away from a form with unsaved edits. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async component => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  return inject(ConfirmService).ask({
    title: 'Leave without saving?',
    message: 'You have changes that have not been saved yet. If you leave now, they will be lost.',
    confirmLabel: 'Discard changes',
    cancelLabel: 'Stay on this page',
    destructive: true
  });
};
